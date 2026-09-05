#!/usr/bin/env python3
"""Idempotently import ESL Lounge A1-C2 catalogue memberships.

This importer keeps ESL Lounge as provenance. It maps entries to existing senses
when possible and creates review-required placeholder senses only for genuinely
unmatched headwords/POS combinations.
"""

from __future__ import annotations

import csv
import hashlib
import html.parser
import json
import os
import pathlib
import re
import subprocess
import tempfile
import unicodedata
import urllib.request
from dataclasses import dataclass


PROJECT_ROOT = pathlib.Path(__file__).resolve().parents[2]
LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
SOURCE_SYSTEM = "esl_lounge"
PAGE_URL = "https://www.esl-lounge.com/student/reference/{level}-cefr-vocabulary-word-list.php"
POS_CODES = {
    "adj": "adjective",
    "adv": "adverb",
    "conj": "conjunction",
    "det": "determiner",
    "interj": "expression",
    "idiom": "expression",
    "n": "noun",
    "num": "numeral",
    "phr v": "verb",
    "prep": "preposition",
    "pron": "pronoun",
    "v": "verb",
    "v ppt": "participle",
}
# Catalogue keys created before determiner support used "article" for ESL det.
# Keep that opaque key stable so refreshing the source does not create duplicates.
SOURCE_KEY_POS_OVERRIDES = {"determiner": "article"}
ARTICLE_HEADWORDS = {"a", "an", "a / an", "the"}
# These entries were checked against Oxford Learner's Dictionaries on 2026-08-19.
# Their ESL part-of-speech labels describe an existing Oxford sense, even when
# the two catalogues use different labels or assign different CEFR levels.
AUDITED_OXFORD_EQUIVALENTS = frozenset(
    {
        "a1:all:article",
        "a1:another:article",
        "a1:any:article",
        "a1:born:participle",
        "a1:both:article",
        "a1:each:article",
        "a1:enough:article",
        "a1:every:article",
        "a1:few:article",
        "a1:hello:expression",
        "a1:hi:expression",
        "a1:his:article",
        "a1:its:article",
        "a1:like:preposition",
        "a1:many:article",
        "a1:more:article",
        "a1:most:article",
        "a1:much:article",
        "a1:my:article",
        "a1:no:article",
        "a1:our:article",
        "a1:please:expression",
        "a1:some:article",
        "a1:their:article",
        "a1:would:verb",
        "a1:your:article",
        "a2:average:noun",
        "a2:cycle:verb",
        "a2:dead:adjective",
        "a2:either:article",
        "a2:his:article",
        "a2:least:article",
        "a2:less:article",
        "a2:neither:article",
        "a2:score:verb",
        "a2:several:article",
        "a2:such:article",
        "a2:whose:article",
        "b1:balance:verb",
        "b1:base:verb",
        "b1:bomb:verb",
        "b1:deal:verb",
        "b1:fancy:verb",
        "b1:neither:conjunction",
        "b1:pin:verb",
        "b1:plenty:pronoun",
        "b1:plus:preposition",
        "b1:till:conjunction",
        "b1:whatever:article",
        "b2:editorial:noun",
        "b2:fellow:adjective",
        "b2:fool:verb",
        "b2:panic:verb",
        "b2:wherever:conjunction",
        "c1:audit:verb",
        "c1:capitalist:noun",
        "c1:clash:verb",
        "c1:communist:noun",
        "c1:harvest:verb",
        "c1:meantime:noun",
        "c1:standing:noun",
    }
)
LOW_CONFIDENCE_EQUIVALENTS = frozenset({"b1:neither:conjunction"})
ENTRY_PATTERN = re.compile(
    r"^(?P<headword>.+)\s+"
    r"\((?P<pos>adj|adv|conj|det|idiom|interj|n|num|phr v|prep|pron|v|v ppt)"
    r"(?:\s*/\s*(?:adj|adv|conj|det|idiom|interj|n|num|phr v|prep|pron|v|v ppt))*\)"
    r"(?:\s+\([^)]*\))*$"
)
SPACE_PATTERN = re.compile(r"\s+")
REGION_QUALIFIER_PATTERN = re.compile(r"\s*\((?:BrE|AmE|British|American)[^)]*\)", re.IGNORECASE)


@dataclass(frozen=True)
class SourceEntry:
    source_id: int
    external_key: str
    headword: str
    normalized_headword: str
    level: str
    part_of_speech: str


@dataclass(frozen=True)
class Sense:
    sense_id: int
    headword: str
    normalized_headword: str
    level: str
    parts_of_speech: frozenset[str]


class WordListParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.table_depth = 0
        self.in_word_cell = False
        self.cell_parts: list[str] = []
        self.lines: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        if tag == "table" and "word-list-table" in classes:
            self.table_depth = 1
        elif tag == "table" and self.table_depth:
            self.table_depth += 1
        elif tag == "td" and self.table_depth and classes.intersection({"left", "right"}):
            self.in_word_cell = True
            self.cell_parts = []
        elif tag == "br" and self.in_word_cell:
            self.cell_parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag == "td" and self.in_word_cell:
            content = "".join(self.cell_parts)
            content = content.replace("medicine \n(n)memory (n)", "medicine (n)\nmemory (n)")
            content = re.sub(r"\)(?=[A-Za-z])", ")\n", content)
            self.lines.extend(line.strip() for line in content.splitlines() if line.strip())
            self.in_word_cell = False
            self.cell_parts = []
        elif tag == "table" and self.table_depth:
            self.table_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.in_word_cell:
            self.cell_parts.append(data)


def normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value).strip().casefold()
    return SPACE_PATTERN.sub(" ", normalized)


def matching_aliases(value: str) -> set[str]:
    base = normalize(REGION_QUALIFIER_PATTERN.sub("", value))
    aliases = {base}
    if base.startswith("to "):
        aliases.add(base[3:])
    for part in re.split(r"\s*[,;/]\s*", base):
        if part:
            aliases.add(part.removeprefix("to "))
    aliases.update(alias.replace("-", " ") for alias in tuple(aliases) if "-" in alias)
    return {alias for alias in aliases if alias}


def parse_source_line(line: str) -> list[tuple[str, str]]:
    segments = re.split(
        r"(?<=\))\s+/\s+(?=(?:to\s+)?[^()]+\s+\((?:adj|adv|conj|det|idiom|interj|n|num|phr v|prep|pron|v|v ppt))",
        line,
    )
    parsed: list[tuple[str, str]] = []
    for segment in segments:
        match = ENTRY_PATTERN.match(segment)
        if not match:
            raise RuntimeError(f"Cannot parse ESL Lounge entry: {segment!r}")
        headword = match.group("headword").strip()
        for raw_pos in (value.strip() for value in match.group("pos").split("/")):
            part_of_speech = POS_CODES.get(raw_pos)
            if part_of_speech is None:
                raise RuntimeError(f"Unsupported ESL Lounge part of speech: {raw_pos!r}")
            if raw_pos == "det" and normalize(headword) in ARTICLE_HEADWORDS:
                part_of_speech = "article"
            parsed.append((headword, part_of_speech))
    return parsed


def load_database_url() -> str:
    configured = os.environ.get("DATABASE_URL")
    if configured:
        return configured

    env_path = PROJECT_ROOT / ".env"
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "DATABASE_URL":
            return value.strip().strip("'\"")

    raise RuntimeError("DATABASE_URL is not configured")


def fetch_entries() -> tuple[list[SourceEntry], str]:
    entries: dict[str, SourceEntry] = {}
    digest = hashlib.sha256()
    for level in LEVELS:
        url = PAGE_URL.format(level=level.lower())
        request = urllib.request.Request(url, headers={"User-Agent": "Tree vocabulary importer/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            document = response.read()
        digest.update(document)
        parser = WordListParser()
        parser.feed(document.decode("utf-8"))
        for line in parser.lines:
            for headword, part_of_speech in parse_source_line(line):
                normalized_headword = normalize(headword.removeprefix("to "))
                source_key_pos = SOURCE_KEY_POS_OVERRIDES.get(part_of_speech, part_of_speech)
                external_key = f"{level.lower()}:{normalized_headword}:{source_key_pos}"
                source_hash = hashlib.sha256(external_key.encode("utf-8")).hexdigest()
                source_id = int(source_hash[:15], 16)
                entries[external_key] = SourceEntry(
                    source_id=source_id,
                    external_key=external_key,
                    headword=headword,
                    normalized_headword=normalized_headword,
                    level=level,
                    part_of_speech=part_of_speech,
                )
    return sorted(entries.values(), key=lambda item: item.external_key), digest.hexdigest()


def query_senses(psql: str, database_url: str) -> list[Sense]:
    sql = """
        SELECT json_build_object(
          'senseId', sense.id,
          'headword', headword.word,
          'normalizedHeadword', headword.normalized_word,
          'level', sense.cefr_level,
          'partsOfSpeech', COALESCE(
            (SELECT json_agg(part.part_of_speech_code ORDER BY part.part_of_speech_code)
             FROM sense_parts_of_speech part WHERE part.sense_id = sense.id),
            '[]'::json
          )
        )
        FROM senses sense
        JOIN headwords headword ON headword.id = sense.headword_id
        ORDER BY sense.id
    """
    completed = subprocess.run(
        [psql, database_url, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", sql],
        check=True,
        capture_output=True,
        text=True,
    )
    senses = []
    for line in completed.stdout.splitlines():
        data = json.loads(line)
        senses.append(
            Sense(
                sense_id=int(data["senseId"]),
                headword=data["headword"],
                normalized_headword=data["normalizedHeadword"],
                level=data["level"],
                parts_of_speech=frozenset(data["partsOfSpeech"]),
            )
        )
    return senses


def build_mappings(
    entries: list[SourceEntry],
    senses: list[Sense],
) -> tuple[list[tuple[SourceEntry, Sense, str, str, bool]], list[SourceEntry]]:
    senses_by_alias: dict[str, list[Sense]] = {}
    for sense in senses:
        for alias in matching_aliases(sense.headword):
            senses_by_alias.setdefault(alias, []).append(sense)

    mappings: list[tuple[SourceEntry, Sense, str, str, bool]] = []
    unmatched: list[SourceEntry] = []
    for entry in entries:
        candidates_by_id: dict[int, Sense] = {}
        for alias in matching_aliases(entry.headword.removeprefix("to ")):
            for candidate in senses_by_alias.get(alias, []):
                candidates_by_id[candidate.sense_id] = candidate
        candidates = list(candidates_by_id.values())
        level_pos = [
            sense
            for sense in candidates
            if sense.level == entry.level and entry.part_of_speech in sense.parts_of_speech
        ]
        pos = [sense for sense in candidates if entry.part_of_speech in sense.parts_of_speech]
        if level_pos:
            selected = level_pos
            match_method = "headword_level_pos"
            confidence = "1.000" if len(selected) == 1 else "0.700"
        elif pos:
            selected = pos
            match_method = "headword_pos"
            confidence = "0.850" if len(selected) == 1 else "0.500"
        elif entry.external_key in AUDITED_OXFORD_EQUIVALENTS:
            selected = [sense for sense in candidates if sense.level == entry.level]
            if len(selected) != 1:
                raise RuntimeError(
                    f"Audited ESL entry {entry.external_key!r} expected one same-level sense; "
                    f"found {len(selected)}"
                )
            match_method = "manual"
            confidence = "0.700" if entry.external_key in LOW_CONFIDENCE_EQUIVALENTS else "1.000"
        else:
            selected = []
            match_method = "headword_pos"
            confidence = "0.000"

        if not selected:
            unmatched.append(entry)
            continue

        for index, sense in enumerate(sorted(selected, key=lambda item: item.sense_id)):
            mappings.append((entry, sense, match_method, confidence, index == 0))
    return mappings, unmatched


def write_tsv(path: pathlib.Path, rows: list[tuple[object, ...]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.writer(output, delimiter="\t", lineterminator="\n", quoting=csv.QUOTE_MINIMAL)
        writer.writerows(rows)


def import_entries(
    psql: str,
    database_url: str,
    entries: list[SourceEntry],
    mappings: list[tuple[SourceEntry, Sense, str, str, bool]],
    unmatched: list[SourceEntry],
    source_sha256: str,
) -> None:
    with tempfile.TemporaryDirectory(prefix="tree-esl-import-") as temporary_directory:
        temp_path = pathlib.Path(temporary_directory)
        entries_path = temp_path / "entries.tsv"
        mappings_path = temp_path / "mappings.tsv"
        unmatched_path = temp_path / "unmatched.tsv"
        write_tsv(
            entries_path,
            [
                (
                    entry.source_id,
                    entry.external_key,
                    entry.headword,
                    entry.normalized_headword,
                    entry.level,
                    entry.part_of_speech,
                )
                for entry in entries
            ],
        )
        write_tsv(
            mappings_path,
            [
                (entry.external_key, sense.sense_id, method, confidence, str(is_primary).lower())
                for entry, sense, method, confidence, is_primary in mappings
            ],
        )
        write_tsv(
            unmatched_path,
            [
                (
                    entry.source_id,
                    entry.external_key,
                    entry.headword,
                    entry.normalized_headword,
                    entry.level,
                    entry.part_of_speech,
                )
                for entry in unmatched
            ],
        )

        sql = f"""
BEGIN;
CREATE TEMP TABLE _esl_entries (
  source_id bigint, external_key text, source_headword text,
  normalized_headword text, cefr_level text, part_of_speech_code text
) ON COMMIT DROP;
CREATE TEMP TABLE _esl_mappings (
  external_key text, sense_id bigint, match_method text,
  match_confidence numeric(4, 3), is_primary boolean
) ON COMMIT DROP;
CREATE TEMP TABLE _esl_unmatched (
  source_id bigint, external_key text, source_headword text,
  normalized_headword text, cefr_level text, part_of_speech_code text
) ON COMMIT DROP;
\copy _esl_entries FROM '{entries_path}' WITH (FORMAT csv, DELIMITER E'\t')
\copy _esl_mappings FROM '{mappings_path}' WITH (FORMAT csv, DELIMITER E'\t')
\copy _esl_unmatched FROM '{unmatched_path}' WITH (FORMAT csv, DELIMITER E'\t')

CREATE TEMP TABLE _esl_run (id bigint PRIMARY KEY) ON COMMIT DROP;
WITH inserted AS (
  INSERT INTO import_runs
    (source_type, source_filename, source_sha256, importer_version, status,
     source_records, senses_written, rejected_count, details)
  VALUES
    ('cefr_catalogue', 'ESL Lounge A1-C2 vocabulary pages', '{source_sha256}',
     '1.1.0', 'running', {len(entries)}, 0, 0,
     jsonb_build_object('source', 'esl_lounge', 'levels', jsonb_build_array('A1','A2','B1','B2','C1','C2')))
  RETURNING id
)
INSERT INTO _esl_run SELECT id FROM inserted;

INSERT INTO catalogue_entries
  (source_code, external_key, source_headword, normalized_headword, cefr_level, source_metadata)
SELECT 'esl_lounge', external_key, source_headword, normalized_headword, cefr_level,
       jsonb_build_object('partOfSpeech', part_of_speech_code)
FROM _esl_entries
ON CONFLICT (source_code, external_key) DO UPDATE SET
  source_headword = EXCLUDED.source_headword,
  normalized_headword = EXCLUDED.normalized_headword,
  cefr_level = EXCLUDED.cefr_level,
  source_metadata = EXCLUDED.source_metadata,
  updated_at = now();

INSERT INTO catalogue_entry_parts_of_speech (catalogue_entry_id, part_of_speech_code)
SELECT entry.id, source.part_of_speech_code
FROM _esl_entries source
JOIN catalogue_entries entry
  ON entry.source_code = 'esl_lounge' AND entry.external_key = source.external_key
ON CONFLICT DO NOTHING;

INSERT INTO source_import_records
  (import_run_id, source_system, source_id, source_word, source_translation,
   source_pos_code, inferred_status, raw_scheduling)
SELECT run.id, '{SOURCE_SYSTEM}', source.source_id, source.source_headword, NULL,
       NULL, 'new',
       jsonb_build_object('cefrLevel', source.cefr_level, 'partOfSpeech', source.part_of_speech_code)
FROM _esl_entries source
CROSS JOIN _esl_run run
ON CONFLICT (source_system, source_id) DO UPDATE SET
  import_run_id = EXCLUDED.import_run_id,
  source_word = EXCLUDED.source_word,
  raw_scheduling = EXCLUDED.raw_scheduling,
  updated_at = now();

INSERT INTO source_import_record_catalogue_entries
  (source_import_record_id, catalogue_entry_id)
SELECT record.id, entry.id
FROM _esl_entries source
JOIN source_import_records record
  ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
JOIN catalogue_entries entry
  ON entry.source_code = 'esl_lounge' AND entry.external_key = source.external_key
ON CONFLICT DO NOTHING;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT entry.id, mapping.sense_id, mapping.match_method, mapping.match_confidence, mapping.is_primary
FROM _esl_mappings mapping
JOIN catalogue_entries entry
  ON entry.source_code = 'esl_lounge' AND entry.external_key = mapping.external_key
ON CONFLICT (catalogue_entry_id, sense_id) DO UPDATE SET
  match_method = EXCLUDED.match_method,
  match_confidence = EXCLUDED.match_confidence,
  is_primary = EXCLUDED.is_primary,
  mapped_at = now();

INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
SELECT DISTINCT mapping.sense_id, source.part_of_speech_code
FROM _esl_mappings mapping
JOIN _esl_entries source ON source.external_key = mapping.external_key
ON CONFLICT DO NOTHING;

INSERT INTO reconciliation_items
  (source_key, issue_type, headword, official_level, source_import_record_id,
   matched_sense_id, status, notes, checked_at)
SELECT 'esl_lounge:b1:neither:conjunction:oxford_pos_audit',
       'source_anomaly',
       'neither',
       'B1',
       record.id,
       mapping.sense_id,
       'open',
       'ESL Lounge classifies this entry as a conjunction; Oxford Learner''s Dictionaries classifies its B1 entry as an adverb.',
       DATE '2026-08-19'
FROM _esl_mappings mapping
JOIN _esl_entries source ON source.external_key = mapping.external_key
JOIN source_import_records record
  ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
WHERE mapping.external_key = 'b1:neither:conjunction'
  AND mapping.is_primary
ON CONFLICT (source_key) DO UPDATE SET
  matched_sense_id = EXCLUDED.matched_sense_id,
  source_import_record_id = EXCLUDED.source_import_record_id,
  notes = EXCLUDED.notes,
  checked_at = EXCLUDED.checked_at,
  updated_at = now();

INSERT INTO headwords (word, normalized_word)
SELECT DISTINCT source_headword, normalized_headword
FROM _esl_unmatched
ON CONFLICT (normalized_word) DO NOTHING;

WITH prepared AS (
  SELECT source.*,
         headword.id AS headword_id,
         record.id AS source_import_record_id,
         COALESCE(existing.max_order, 0) AS existing_order
  FROM _esl_unmatched source
  JOIN headwords headword ON headword.normalized_word = source.normalized_headword
  JOIN source_import_records record
    ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
  LEFT JOIN LATERAL (
    SELECT max(sense_order) AS max_order FROM senses WHERE headword_id = headword.id
  ) existing ON true
), ranked AS (
  SELECT prepared.*,
         existing_order + row_number() OVER (
           PARTITION BY headword_id ORDER BY cefr_level, part_of_speech_code, source_id
         ) AS new_sense_order
  FROM prepared
)
INSERT INTO senses
  (headword_id, source_import_record_id, definition_en, transcription, cefr_level,
   sense_order, review_status, preferred_level_source_code)
SELECT headword_id, source_import_record_id, NULL, NULL, cefr_level,
       new_sense_order, 'needs_review', 'esl_lounge'
FROM ranked
ON CONFLICT (source_import_record_id, cefr_level) DO UPDATE SET
  headword_id = EXCLUDED.headword_id,
  preferred_level_source_code = EXCLUDED.preferred_level_source_code,
  updated_at = now();

INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
SELECT sense.id, source.part_of_speech_code
FROM _esl_unmatched source
JOIN source_import_records record
  ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
JOIN senses sense
  ON sense.source_import_record_id = record.id AND sense.cefr_level = source.cefr_level
ON CONFLICT DO NOTHING;

INSERT INTO sense_progress (sense_id, status, status_origin)
SELECT sense.id, 'to_learn', 'system'
FROM _esl_unmatched source
JOIN source_import_records record
  ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
JOIN senses sense
  ON sense.source_import_record_id = record.id AND sense.cefr_level = source.cefr_level
ON CONFLICT (sense_id) DO NOTHING;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT entry.id, sense.id, 'source_record', 1.000, true
FROM _esl_unmatched source
JOIN catalogue_entries entry
  ON entry.source_code = 'esl_lounge' AND entry.external_key = source.external_key
JOIN source_import_records record
  ON record.source_system = '{SOURCE_SYSTEM}' AND record.source_id = source.source_id
JOIN senses sense
  ON sense.source_import_record_id = record.id AND sense.cefr_level = source.cefr_level
ON CONFLICT DO NOTHING;

UPDATE import_runs
SET status = 'completed', completed_at = now(),
    senses_written = (SELECT count(*) FROM _esl_unmatched),
    details = details || jsonb_build_object(
      'mappedEntries', {len(entries) - len(unmatched)},
      'placeholderSenses', {len(unmatched)}
    )
WHERE id = (SELECT id FROM _esl_run);
COMMIT;
"""
        subprocess.run(
            [psql, database_url, "-X", "-v", "ON_ERROR_STOP=1"],
            input=sql,
            check=True,
            text=True,
        )


def main() -> None:
    database_url = load_database_url()
    psql = os.environ.get("PSQL", "/opt/homebrew/bin/psql")
    entries, source_sha256 = fetch_entries()
    senses = query_senses(psql, database_url)
    mappings, unmatched = build_mappings(entries, senses)
    import_entries(psql, database_url, entries, mappings, unmatched, source_sha256)
    print(
        f"Imported {len(entries)} ESL Lounge catalogue entries: "
        f"{len(entries) - len(unmatched)} mapped, {len(unmatched)} placeholder senses created."
    )


if __name__ == "__main__":
    main()
