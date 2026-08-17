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
  'red-gold-the-worlds-most-expensive-spice',
  'Red gold: The world''s most expensive spice.',
  'article',
  'The history, genetics, cultivation, and extraordinary labor behind the world''s most expensive spice.',
  'Food & Culture',
  '/images/library/red-gold-saffron.jpg',
  6,
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
    (1, 'paragraph', $text$Spices are often far pricier proportionately than the foods they flavor. But one's cost has long topped them all. Saffron's red threads regularly run at rates over $600 an ounce.$text$),
    (2, 'paragraph', $text$So why is this so-called “red gold” so expensive?$text$),
    (3, 'heading', $text$What Is Saffron?$text$),
    (4, 'paragraph', $text$Spices come from different plant parts. Saffron is the only one made of flower stigmas. They're plucked from a flowering plant called a crocus.$text$),
    (5, 'paragraph', $text$Different crocus species dot countrysides across Eurasia and North Africa. And it appears that humans began harvesting wild crocuses quite a way back. Ancient cave paintings in what's now Iraq derived colors from crocus pigments.$text$),
    (6, 'paragraph', $text$However, this paint was probably created with a different type of crocus because it's thought that the saffron crocus developed relatively recently, when a single wild crocus produced a seed carrying an extra set of chromosomes.$text$),
    (7, 'heading', $text$A Unique Genetic Mutation$text$),
    (8, 'paragraph', $text$This mutation resulted in a flower with especially long stigmas that packed high concentrations of three compounds of interest.$text$),
    (9, 'paragraph', $text$Crocin lends saffron its vibrant hue and makes an effective dye. Picrocrocin gives saffron its characteristic taste, while safranal imparts its hay-like aroma.$text$),
    (10, 'paragraph', $text$The plant's added chromosomes also made it sterile, so it could have simply come and gone from the face of the Earth pretty quickly.$text$),
    (11, 'paragraph', $text$But scientists think that people long ago recognized this unique crocus's qualities. And while it couldn't reproduce sexually by seed, it could spread through its corm—an underground, stem-like plant organ that can asexually generate new growth.$text$),
    (12, 'paragraph', $text$It seems people began propagating it themselves, separating and cultivating new corm growths.$text$),
    (13, 'heading', $text$Thousands of Years of Cultivation$text$),
    (14, 'paragraph', $text$Today's commercial saffron comes from crocuses that are all functionally twins from this single clonal line.$text$),
    (15, 'paragraph', $text$Scientists think the original plant first emerged in southern Greece. Exactly when is unclear, but over 3,500-year-old Greek frescoes depict women harvesting the spice. Saffron fields in modern-day Iran seem to trace back at least 3,000 years.$text$),
    (16, 'paragraph', $text$Before long, ancient Persian people were stirring the spice into foods, freshening up with saffron-infused perfume, and draping themselves in saffron-tinged fabrics.$text$),
    (17, 'paragraph', $text$Ancient Greeks spread the spice's sensuous smell in courts, theaters, and baths.$text$),
    (18, 'heading', $text$Saffron in Medicine and Culture$text$),
    (19, 'paragraph', $text$In 4th-century BCE Persia, Alexander the Great became smitten with saffron and recommended it in baths to treat battle wounds. Legend says Cleopatra likewise achieved glowing skin from soaking in the spice.$text$),
    (20, 'paragraph', $text$Around the 9th century, Islamic rulers lavished each other with saffron gifts during prisoner exchanges and other diplomatic ventures.$text$),
    (21, 'paragraph', $text$Persian physician Ibn Sina included saffron in his Canon of Medicine circa 1025 as an aphrodisiac and treatment for ailments like depression, asthma, and inflammation.$text$),
    (22, 'paragraph', $text$Meanwhile, a Tibetan text boasted saffron's immune-strengthening and beauty-intensifying powers. In 1300s Europe, saffron was a purported antidote to the plague.$text$),
    (23, 'paragraph', $text$Many of these historical accounts of saffron's health benefits don't hold up or are overblown, but saffron has indeed proved to have anti-inflammatory and antioxidant properties.$text$),
    (24, 'heading', $text$As Valuable as Gold$text$),
    (25, 'paragraph', $text$In medieval Nuremberg, the government appointed inspectors to check for saffron fraud and dole out punishments as extreme as the death penalty.$text$),
    (26, 'paragraph', $text$In the early 1700s, settlers brought saffron to North America, where it fetched the same price as gold at the Philadelphia Exchange.$text$),
    (27, 'paragraph', $text$Saffron's pricey preciousness, then and now, comes down to its production.$text$),
    (28, 'heading', $text$Why Producing Saffron Is So Difficult$text$),
    (29, 'paragraph', $text$Most of the work required to produce saffron is squeezed into the crocus's roughly two-week flowering window.$text$),
    (30, 'paragraph', $text$Workers often begin at dawn, hand-picking the crocuses, usually before they blossom, to prevent wilting and preserve potency. Then they pluck the three stigmas from each flower and dry them.$text$),
    (31, 'paragraph', $text$They must process around 150,000 flowers—the equivalent of over 400 hours of labor—to produce a single kilogram of saffron.$text$),
    (32, 'paragraph', $text$A little goes a long way in what have become some of saffron's signature dishes. A few threads can infuse whole trays of tahchin, pans of paella, and bowls of bouillabaisse.$text$),
    (33, 'paragraph', $text$But the spice's price has stayed astronomical.$text$),
    (34, 'heading', $text$Why Can't We Simply Produce More?$text$),
    (35, 'paragraph', $text$Over generations, farmers have selectively bred many other domesticated crops to maximize yields and other desirable traits.$text$),
    (36, 'paragraph', $text$However, because saffron crocuses are all sterile clones, they've remained largely unchanged, as have their labor-intensive, low-stigma yields.$text$),
    (37, 'paragraph', $text$Some researchers are investigating experimentally inducing mutations. But environmental instability has made harvests increasingly unreliable, threatening the saffron crop and the traditional livelihoods that have painstakingly kept this miraculous mutant alive for millennia.$text$)
) AS block(position, block_type, text)
WHERE item.slug = 'red-gold-the-worlds-most-expensive-spice'
ON CONFLICT (library_item_id, position) DO UPDATE SET
  block_type = EXCLUDED.block_type,
  text = EXCLUDED.text;
