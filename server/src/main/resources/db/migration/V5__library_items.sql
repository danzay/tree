CREATE TABLE library_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (btrim(title) <> ''),
  item_type text NOT NULL CHECK (item_type IN ('article', 'story', 'video', 'podcast', 'note')),
  summary text NOT NULL DEFAULT '',
  topic text NOT NULL CHECK (btrim(topic) <> ''),
  cover_image_path text NOT NULL CHECK (cover_image_path LIKE '/images/library/%'),
  estimated_read_minutes integer NOT NULL DEFAULT 1 CHECK (estimated_read_minutes > 0),
  vocabulary_count integer NOT NULL DEFAULT 0 CHECK (vocabulary_count >= 0),
  reading_status text NOT NULL DEFAULT 'not_started'
    CHECK (reading_status IN ('not_started', 'in_progress', 'completed')),
  last_opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE article_blocks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  library_item_id bigint NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position > 0),
  block_type text NOT NULL CHECK (block_type IN ('heading', 'paragraph')),
  text text NOT NULL CHECK (btrim(text) <> ''),
  UNIQUE (library_item_id, position)
);

CREATE INDEX library_items_type_updated_idx
  ON library_items (item_type, updated_at DESC, id DESC);
CREATE INDEX library_items_title_search_idx
  ON library_items (lower(title) text_pattern_ops);
CREATE INDEX article_blocks_item_position_idx
  ON article_blocks (library_item_id, position);

INSERT INTO library_items (
  slug,
  title,
  item_type,
  summary,
  topic,
  cover_image_path,
  estimated_read_minutes,
  vocabulary_count,
  reading_status
) VALUES (
  'what-would-happen-if-everyone-stopped-eating-meat-tomorrow',
  'What would happen if everyone stopped eating meat tomorrow?',
  'article',
  'A thought experiment about the environmental, social, economic, and health effects of a meatless world.',
  'Environment',
  '/images/library/meatless-world.jpg',
  5,
  0,
  'not_started'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  item_type = EXCLUDED.item_type,
  summary = EXCLUDED.summary,
  topic = EXCLUDED.topic,
  cover_image_path = EXCLUDED.cover_image_path,
  estimated_read_minutes = EXCLUDED.estimated_read_minutes,
  vocabulary_count = EXCLUDED.vocabulary_count,
  reading_status = EXCLUDED.reading_status,
  updated_at = now();

INSERT INTO article_blocks (library_item_id, position, block_type, text)
SELECT item.id, block.position, block.block_type, block.text
FROM library_items item
CROSS JOIN (
  VALUES
    (1, 'paragraph', $text$Let's explore a hypothetical together.$text$),
    (2, 'paragraph', $text$There are over four times as many livestock as people. Farmed cattle alone weigh nearly ten times as much as all wild mammals combined.$text$),
    (3, 'paragraph', $text$So imagine if a wizard of meatless dining suddenly appeared and, with one wave of a wand, wiped away all meat from our shelves—along with any desire to eat it. Farm animals destined for food vanish, whisked away to another planet.$text$),
    (4, 'paragraph', $text$What happens in the following days, years, and even millennia?$text$),
    (5, 'heading', $text$The Immediate Impact$text$),
    (6, 'paragraph', $text$Overnight, food-related greenhouse gas emissions drop by about 63%.$text$),
    (7, 'paragraph', $text$We no longer get protein and key nutrients from the approximately 70 billion chickens, 1.5 billion pigs, 300 million cattle, and 200 million tons of fish and shellfish processed for consumption each year.$text$),
    (8, 'paragraph', $text$To help fill this nutritional gap, our demand for fruits, vegetables, and legumes goes up—a diet that most dietitians agree contains all of the nutrients we need for a healthy life.$text$),
    (9, 'paragraph', $text$But initially, there aren't enough of these foods to go around. The rise in demand causes produce costs to soar. In regions like Mongolia, where the harsh environment makes it difficult to grow vegetables, a sudden lack of meat leaves people with little to eat.$text$),
    (10, 'heading', $text$The Social and Economic Consequences$text$),
    (11, 'paragraph', $text$Cultures built around meat lose their foundations. Members of salmon-eating tribes in the Pacific Northwest of the United States, for example, lose not only sustenance and livelihoods, but an integral component of their religion.$text$),
    (12, 'paragraph', $text$Tens of millions of anglers lose work that was already threatened by dwindling fish populations. As the meat industry collapses, many households in developing countries are left scrambling for income that once came from livestock farming.$text$),
    (13, 'paragraph', $text$Some meat producers shift to agricultural crops, which leave workers—and neighboring communities—less susceptible to respiratory diseases associated with livestock production.$text$),
    (14, 'paragraph', $text$As crop agriculture expands, prices come down. Ultimately, vegetarianism becomes less expensive than meat-eating in most countries.$text$),
    (15, 'heading', $text$Less Land and Water$text$),
    (16, 'paragraph', $text$Luckily, we don't need to clear new farmland to grow all this food. Without animals raised for meat, land that had been used to grow feed is now available.$text$),
    (17, 'paragraph', $text$All things considered, our new diets require less land and water.$text$),
    (18, 'heading', $text$Effects on Human Health$text$),
    (19, 'paragraph', $text$Millions of deaths are avoided every year, thanks in part to lower rates of heart disease, cancer, and other conditions associated with red meat consumption.$text$),
    (20, 'paragraph', $text$We no longer contract new pathogens from wild animals hunted for food, novel influenza viruses from farmed pigs, or drug-resistant superbugs that develop in beef cattle that have been preemptively fed antibiotics.$text$),
    (21, 'heading', $text$Nature Begins to Recover$text$),
    (22, 'paragraph', $text$As the years pass, global biodiversity rises as habitat loss, pesticide use, and other pressures from agriculture subside.$text$),
    (23, 'paragraph', $text$Amazonian birds have more forest to fly over. Fewer cheetahs are shot for stalking too close to livestock. Bee, wasp, and butterfly communities thrive as natural areas expand.$text$),
    (24, 'paragraph', $text$In turn, insect-pollinated crops produce higher yields. Many ocean species rebound from overfishing.$text$),
    (25, 'heading', $text$How Humans Might Evolve$text$),
    (26, 'paragraph', $text$Throughout history, humans in traditionally vegetarian regions have evolved a genetic mutation that helps them more efficiently process fats from plants.$text$),
    (27, 'paragraph', $text$So, over thousands of years, our bodies may evolve to make the most of our veggies. Or we may lose some adaptations, like the ability to extract iron from meat.$text$),
    (28, 'heading', $text$The Real World$text$),
    (29, 'paragraph', $text$Of course, a wizard will not turn our world meatless.$text$),
    (30, 'paragraph', $text$Though many individuals are choosing to go vegetarian, globally, meat eating is still on the rise. This trend spells trouble for our climate.$text$),
    (31, 'paragraph', $text$Even if we suddenly stopped burning fossil fuels, business-as-usual food systems paired with a growing population would push global temperatures over 1.5°C by the end of the century.$text$),
    (32, 'paragraph', $text$Cattle are the biggest culprit. Beef and dairy production are responsible for over 60% of all food-based emissions, while only providing around 18% of the world's calories.$text$),
    (33, 'paragraph', $text$In fact, diets containing modest portions of meats like chicken often produce less greenhouse gas than vegetarian diets high in dairy.$text$),
    (34, 'paragraph', $text$Reducing beef, cheese, and milk consumption could go a long way toward achieving many of the benefits of a meatless world—no magic required.$text$)
) AS block(position, block_type, text)
WHERE item.slug = 'what-would-happen-if-everyone-stopped-eating-meat-tomorrow'
ON CONFLICT (library_item_id, position) DO UPDATE SET
  block_type = EXCLUDED.block_type,
  text = EXCLUDED.text;
