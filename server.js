import express from 'express';
import fs from 'node:fs';
import dns from 'node:dns/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import wordListPath from 'word-list';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// The word-list npm package is mostly English, but it also contains loanwords,
// archaic variants, abbreviations, and a few words that users recognize as Dutch.
// This blocklist removes obvious Dutch/non-English entries so the generator stays
// English-first instead of showing mixed-language words like "hond", "huis", or "mooi".
const NON_ENGLISH_BLOCKLIST = new Set(`
aan als bij dat de deze die dit doch doen door dus een eens elk en er ge geen gij haar had heb hem het hier hij hoe hun ik in is ja jij jou jouw kan men met mij mijn na naar niet nog nu of ons onze ook op te ten ter tot u uit uw van veel voor waar wat we wel wij zal ze zei zijn zo zou
acht achter af alles ander anders bang bed bel ben bent blauw blijven bloem boek boos bos bruin buiten daar dag dan dank derde drie duizend echter eerst eerste eet eigen einde elk elke even feest fiets fijn gauw geel geld genoeg graag groot groen haar hallo hand heel heer helft helpen her hier hond honden huis huizen hun ieder jaar jas jouw kaas kamer kant kat katten klein klaar klok koe komen kon kopen kort krijg krijgen lang laten lezen lief lekker lopen maar maak maakt man mannen meer meisje mens mensen mooi morgen nacht naam nieuw negen niemand niets nul ogen ons oranje paard paars plaats rood samen school stad staan straat taal tafel tien tijd toch toen tuin twee uur vader vaak vier vijf vogel vrouw vragen vriend waar waarom water weg werk werken wit zwart zeven zes zien ziek zin zitten zoek zonder zoon
hond huis kat mooi lekker fiets kleur dier nummer woord woorden meisje jongen vrouw man stad straat tuin school kaas koe paard vogel rood blauw groen geel zwart wit bruin grijs paars oranje nul twee drie vier vijf zes zeven acht negen tien
abeel avond banaan banket beslag bladzijde boterham broek buur dorp druif eiland eigenaar emmer gebruik gezin glas hoofd knie koffer koning krant kussen laars lepel lucht markt meisje melk minuut mond muts oom oorzaak oma opa papier peer pen raam rivier rok stoel tand trein vader vinger vork vraag winkel zomer zondag
`.split(/\s+/).filter(Boolean));

function isEnglishOnlyWord(word) {
  if (!/^[a-z]+$/.test(word)) return false;
  if (word.length < 3) return false;
  if (NON_ENGLISH_BLOCKLIST.has(word)) return false;
  return true;
}

const WORD_BANKS = {
  common: {
    label: 'Common English words',
    description: 'Curated common English words only. Best choice if you do not want Dutch or obscure words.',
words: [
      'able','about','above','ace','active','adventure','after','again','air','alive','alpha','amber','angel','apple','arc','arena','arrow','astro','atlas','atomic','audio','autumn','awake','awesome','axis',
      'baby','badge','balance','bamboo','base','beach','beacon','beam','beauty','berry','best','better','big','bird','bit','bite','black','blade','blast','blaze','bliss','bloom','blue','bold','bolt','bond','boost','box','brain','brand','brave','bright','bring','brook','build','buzz',
      'cabin','cafe','calm','camel','candy','canvas','carbon','card','care','cargo','castle','catch','center','champ','charm','cherry','chill','circle','city','clear','clever','click','cliff','cloud','club','coach','coast','cocoa','code','coffee','color','comet','cool','core','cosmic','craft','cream','crisp','crown','crystal','cube','curve','cyber',
      'daily','dance','dash','data','dawn','deep','delta','design','dev','digital','dream','drive','drop','dune','dynamic',
      'eagle','earth','easy','echo','edge','elite','ember','energy','epic','ever','exact','extra',
      'fair','fast','field','fire','first','flash','flex','flight','flow','flower','flux','focus','forest','forge','frame','fresh','friend','frost','fruit','future',
      'galaxy','game','garden','gem','giant','glad','glide','globe','glow','gold','good','grand','grass','great','green','grid','groove','grow','guard','guide',
      'happy','harbor','harmony','hawk','heart','hero','hill','honey','horizon','host','house','human','hyper',
      'idea','image','impact','indigo','inner','island','ivory',
      'jade','jazz','jewel','join','journey','joy','juice','jump','jungle',
      'keen','key','kind','king','kite','kiwi',
      'lake','laser','leaf','legend','lemon','level','life','light','lime','lion','logic','loop','lucky','luna',
      'magic','magnet','mango','map','market','matrix','meadow','media','mega','melon','micro','mind','mint','mobile','modern','moon','motion','mountain','music',
      'nature','navy','nest','new','next','nice','ninja','noble','nova',
      'ocean','olive','orbit','orange','origin',
      'panda','park','party','path','peach','pearl','peak','pixel','planet','play','plum','plus','point','power','prime','prompt','pulse','pure',
      'quest','quick','quiet',
      'rapid','ray','ready','real','red','river','rocket','rose','royal','ruby','rush',
      'safe','sage','sand','scale','scene','sea','seed','sharp','shine','silver','simple','sky','smart','smile','snow','solar','solid','spark','speed','spice','spring','square','star','stone','storm','stream','studio','sun','sunny','super','swift','sync',
      'taco','talent','tea','team','tech','tempo','terra','think','tiger','tiny','token','top','tower','trail','tree','true','turbo','turtle',
      'ultra','union','urban',
      'value','vector','velvet','venture','video','violet','vision','vivid','voice',
      'wave','web','white','wild','wind','wing','wise','wolf','wonder','wood','world',
      'yellow','young',
      'zen','zero','zone','zoom'
    ]
  },
  all: {
    label: 'Large English dictionary',
    description: 'Large cleaned English dictionary. Obvious Dutch/non-English entries are removed, but some rare English words may appear.',
    words: null
  },
  animals: {
    label: 'Animals',
    description: 'Animal names plus cute pet/nickname variants such as piggy, kitty, puppy, doggy, ducky, and bunny.',
    words: [
      'ox','yak','gnu','doe','ewe','ram','ant','ape','bat','bee','cat','cow','cub','dog','eel','emu','fox','hen','hog','owl','pig','pup','rat','seal','cod','koi','carp','bass','mole','toad','frog','hare','deer','lion','wolf','bear','duck','goat','pony','colt','calf','joey','kid','aardvark','albatross','alligator','alpaca','anteater','antelope','armadillo','badger','beaver','bison','boar','buffalo','bull','bulldog','bunny','camel','capybara','caterpillar','cheetah','chick','chicken','chimp','chimpanzee','cobra','cougar','coyote','crab','crane','croc','crocodile','crow','dingo','dolphin','donkey','dove','dragon','dragonfly','eagle','elephant','elk','falcon','ferret','finch','firefly','fish','flamingo','foal','gazelle','gecko','giraffe','goose','gorilla','guppy','hamster','hawk','hedgehog','hippo','horse','hyena','iguana','jaguar','jellyfish','kangaroo','koala','lamb','lemur','leopard','lizard','llama','lobster','lynx','macaw','mammoth','meerkat','mink','monkey','moose','mouse','mule','newt','nightingale','octopus','orca','ostrich','otter','panther','parrot','peacock','pelican','penguin','pigeon','platypus','pooch','porcupine','python','rabbit','raccoon','raven','rhino','robin','rooster','salamander','salmon','scorpion','seahorse','serpent','sheep','shrew','skunk','sloth','snail','snake','sparrow','spider','squid','squirrel','stallion','starling','swan','tapir','termite','tortoise','toucan','trout','turkey','turtle','vixen','vulture','walrus','weasel','whale','wildcat','wombat','woodpecker','zebra','bearcat','bobcat','housecat','kitty','kitten','catty','doggy','doggo','doggie','puppy','puppo','piggy','piglet','foxy','mousy','ratty','ducky','chicky','birdie','birdy','goaty','goatie','horsie','horsy','cowie','calfy','goosie','lamby','ottery'
    ]
  },
  insects: {
    label: 'Insects',
    description: 'Insects and small arthropods only.',
    words: [
      'ant','bee','fly','bug','mite','tick','wasp','moth','gnat','aphid','beetle','butterfly','cicada','cricket','dragonfly','earwig','firefly','flea','fly','gnat','grasshopper','hornet','ladybug','locust','mantis','midge','mite','moth','mosquito','roach','silkworm','silverfish','termite','tick','wasp','weevil'
    ]
  },
  elements: {
    label: 'Elements',
    description: 'Chemical element names only.',
    words: [
      'hydrogen','helium','lithium','beryllium','boron','carbon','nitrogen','oxygen','fluorine','neon','sodium','magnesium','aluminum','silicon','phosphorus','sulfur','chlorine','argon','potassium','calcium','scandium','titanium','vanadium','chromium','manganese','iron','cobalt','nickel','copper','zinc','gallium','germanium','arsenic','selenium','bromine','krypton','rubidium','strontium','yttrium','zirconium','niobium','molybdenum','technetium','ruthenium','rhodium','palladium','silver','cadmium','indium','tin','antimony','tellurium','iodine','xenon','cesium','barium','lanthanum','cerium','neodymium','samarium','europium','gadolinium','terbium','dysprosium','holmium','erbium','thulium','ytterbium','lutetium','hafnium','tantalum','tungsten','rhenium','osmium','iridium','platinum','gold','mercury','thallium','lead','bismuth','radon','radium','thorium','uranium','plutonium'
    ]
  },
  materials: {
    label: 'Materials',
    description: 'Materials such as latex, metal, wood, glass, and fabric.',
    words: [
      'latex','rubber','plastic','silicone','nylon','polyester','cotton','wool','linen','silk','denim','canvas','leather','suede','velvet','felt','fleece','foam','paper','cardboard','wood','bamboo','cork','stone','marble','granite','slate','clay','ceramic','porcelain','glass','crystal','metal','steel','iron','copper','bronze','brass','silver','gold','titanium','aluminum','carbon','graphite','fiber','resin','acrylic','vinyl','wax','plaster','concrete','cement','sand','silica','kevlar','spandex','rayon','hemp','jute'
    ]
  },
  uncommon: {
    label: 'Less-used common words',
    description: 'A larger list of normal English words that are outside the small Common list: recognizable words such as castle, harbor, meadow, ribbon, tunnel, willow, museum, agency, candle, and velvet.',
    words: [
      'abide','aboard','absorb','accent','acclaim','across','adapt','admire','adorn','agenda','agency','agile','aisle','alarm','album','alert','alley','almond','alter','amaze','ample','angle','ankle','anthem','apron','arena','aroma','arrow','artery','aspect','attic','audit','avenue','badge','baker','ballot','bargain','basket','beacon','border','bronze','buffer','bureau','cabin','canyon','captain','carbon','career','carpet','castle','cellar','cement','center','cereal','chance','chapel','cherry','chorus','circle','circus','client','closet','cobalt','colony','column','corner','cotton','county','cradle','credit','creek','cricket','custom','damage','dancer','decade','denim','deputy','desert','detail','diner','doctor','dollar','domain','donkey','dragon','drawer','ember','empire','engine','escape','estate','factor','farmer','faucet','favor','feather','ferry','fiber','flavor','foster','gallon','garden','garlic','gentle','gesture','harbor','helmet','hollow','honest','horizon','hotel','humor','hunter','insect','island','jacket','journey','junior','kernel','ladder','lagoon','landmark','lantern','laptop','lawyer','lemon','lesson','marble','meadow','member','mentor','mirror','moment','muffin','museum','narrow','nectar','noodle','object','office','olive','option','orchard','origin','palace','parcel','pardon','parlor','patent','peanut','pepper','permit','pillow','planet','pocket','polish','prairie','profit','puzzle','rabbit','radar','random','record','relic','ribbon','ritual','rocket','sailor','sample','sandal','scenic','scholar','secret','sector','shadow','shelter','sheriff','signal','silver','simple','sister','socket','spirit','stable','staple','station','studio','suburb','summit','symbol','talent','temple','ticket','timber','tunnel','valley','velvet','vendor','vessel','village','violin','virtue','vision','voyage','wallet','window','winter','wizard','wonder','yellow','zipper','abacus','abbey','acorn','adobe','advise','anchor','atlas','bakery','bamboo','beaver','beetle','binder','biscuit','blazer','bonnet','broker','bucket','butter','cactus','camera','campus','candle','cedar','celery','cider','clover','comet','copper','crown','fabric','fossil','harvest','hazel','honey','laurel','linen','mosaic','orchid','pebble','pillar','riddle','stone','violet','willow','abode','accord','aerial','affair','amber','arcade','archer','archive','asylum','autumn','balance','banner','barrel','basin','berry','bison','blade','blanket','bloom','blossom','bounty','branch','brass','breeze','brick','bridge','broom','brush','bubble','canvas','carton','charm','chimney','civic','cloak','cluster','coral','craft','crater','crystal','dagger','daisy','delta','depot','diary','disco','drift','echo','eclipse','elder','falcon','fence','flame','flower','foam','forest','frame','frost','gazelle','gem','glacier','glide','globe','granite','grove','hammer','haven','hidden','hostel','icon','ivory','jade','jewel','laser','legend','lily','lizard','lodge','lunar','market','medal','melody','merchant','merit','mist','mobile','modest','monarch','needle','neon','novel','ocean','orbit','patrol','petal','piano','picnic','poem','prism','quartz','ranger','raven','reef','river','rose','satin','sketch','slate','slogan','solar','spice','steam','theater','tower','wagon','walnut','zinc','ability','absence','academy','account','accused','address','advance','adviser','airport','alcohol','alliance','analyst','anxiety','apparel','arrival','article','athlete','baggage','balcony','battery','benefit','bicycle','booster','brother','cabinet','capital','catalog','charity','chicken','citizen','climate','college','comfort','company','content','convert','costume','council','courage','cousin','culture','curtain','defense','delivery','dentist','deposit','diamond','dignity','display','economy','edition','effort','emotion','episode','essence','evening','factory','failure','fashion','finance','fortune','freedom','gallery','hallway','holiday','illness','kitchen','language','laundry','library','machine','manager','mansion','measure','meeting','memory','message','method','mission','mixture','morning','mystery','network','nursery','opinion','package','passage','pattern','penalty','perfume','phrase','picture','pioneer','plastic','poetry','policy','premium','prison','private','problem','process','product','project','promise','purpose','quality','receipt','recipe','request','resort','result','routine','savings','scanner','science','service','silence','society','special','sponsor','storage','student','success','traffic','trouble','uniform','victory','warning','weather','weekend','wisdom','worker','writer','youth'
    ]
  },
  adultDerogatory: {
    label: 'Adult / edgy words',
    description: 'Sexual, flirty, rude, and insult-style English words. Protected-class slurs are intentionally not included.',
    words: [
      'adult','amour','aphrodisiac','arouse','babe','baddy','bimbo','bitchy','booty','boudoir','brat','cheeky','clown','crave','crush','curvy','desire','dirty','dumb','edgy','erotic','flirt','flirty','fool','freak','frisky','horny','hottie','idiot','jerk','kinky','kiss','lust','lusty','minx','moron','naked','naughty','nude','passion','playboy','playgirl','pleasure','prude','racy','risque','romance','savage','seduce','sensual','sex','sexual','sexy','shameless','silly','sleazy','smut','spicy','steamy','stud','sucker','tease','thirsty','trash','trashy','vixen','wild'
    ]
  },
  colours: {
    label: 'Colours',
    description: 'Colour names only.',
    words: [
      'amber','aqua','ash','azure','beige','black','blue','bronze','brown','burgundy','cerise','charcoal','coral','cream','crimson','cyan','denim','emerald','gold','gray','green','grey','indigo','ivory','jade','khaki','lavender','lemon','lilac','lime','magenta','maroon','mint','navy','ochre','olive','orange','peach','pink','plum','purple','red','rose','ruby','salmon','sand','scarlet','silver','sky','tan','teal','turquoise','violet','white','yellow'
    ]
  },
  numbers: {
    label: 'Numbers',
    description: 'Digits and number words.',
    words: [
      '0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','40','50','60','70','80','90','100','zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety','hundred','first','second','third'
    ]
  },
  food: {
    label: 'Food',
    description: 'Food and drink words.',
    words: [
      'apple','apricot','avocado','bacon','bagel','banana','bean','berry','biscuit','bread','brownie','burger','butter','cake','candy','caramel','carrot','cheese','cherry','chili','choco','cocoa','coffee','cookie','cream','croissant','cupcake','donut','fig','fries','grape','honey','jam','juice','kiwi','latte','lemon','lime','mango','melon','milk','mocha','muffin','noodle','olive','orange','pasta','peach','pear','pepper','pizza','plum','potato','ramen','rice','salad','salsa','soup','spice','sushi','taco','tea','toast','tomato','waffle','yogurt'
    ]
  },
  nature: {
    label: 'Nature',
    description: 'Nature and landscape words.',
    words: [
      'acorn','bay','beach','bloom','breeze','brook','cedar','cliff','cloud','coast','coral','creek','dawn','dune','earth','field','flame','flora','forest','garden','glade','grove','hill','island','jungle','lake','leaf','meadow','mist','moon','moss','mountain','ocean','pebble','pine','rain','river','rock','root','sand','sea','seed','sky','snow','spring','star','stone','storm','sun','sunset','thunder','tree','valley','wave','wind','wood'
    ]
  },
  tech: {
    label: 'Tech',
    description: 'Technology startup-style words.',
    words: [
      'app','bot','byte','cache','chip','cloud','code','data','dev','digital','drive','flow','grid','host','hyper','logic','loop','matrix','micro','mobile','node','pixel','prompt','proxy','quantum','robot','server','signal','smart','stack','stream','sync','tech','token','vector','virtual','web','wire'
    ]
  },
  short: {
    label: 'Short words',
    description: 'Short words from the full dictionary, useful for compact domains.',
    words: null
  }
};

function uniqueCleanWords(words, allowDigits = false) {
  const seen = new Set();
  const clean = [];
  for (const value of words || []) {
    const word = String(value || '').trim().toLowerCase();
    const ok = allowDigits ? /^[a-z0-9]+$/.test(word) : /^[a-z]+$/.test(word);
    if (!ok || seen.has(word)) continue;
    seen.add(word);
    clean.push(word);
  }
  return clean.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

function cleanLabel(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function cleanTld(value) {
  const tld = String(value || '').trim().toLowerCase().replace(/^\.+/, '');
  return tld.replace(/[^a-z0-9-]/g, '');
}

function cleanWordPattern(value) {
  // Applies to the generated word only, not the prefix/suffix.
  // Letters are fixed; ? and _ are wildcards.
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z?_]/g, '')
    .replace(/_/g, '?');
}

function wordMatchesPattern(word, pattern) {
  if (!pattern) return true;
  if (word.length !== pattern.length) return false;
  for (let index = 0; index < pattern.length; index += 1) {
    const expected = pattern[index];
    if (expected !== '?' && word[index] !== expected) return false;
  }
  return true;
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

function randomGeneratedText(pattern) {
  return [...pattern].map(char => char === '?' ? LETTERS[Math.floor(Math.random() * LETTERS.length)] : char).join('');
}

function randomPatternSpace(pattern) {
  const wildcards = [...pattern].filter(char => char === '?').length;
  return Math.pow(26, wildcards);
}

function loadWords() {
  const raw = fs.readFileSync(wordListPath, 'utf8');
  const seen = new Set();
  const words = [];

  for (const line of raw.split(/\r?\n/)) {
    const word = line.trim().toLowerCase();

    // Strictly one English word combined with one fixed label part.
    // Remove obvious Dutch/non-English entries and very short fragments/abbreviations
    // so the generator does not feel like a mixed-language dictionary.
    if (!isEnglishOnlyWord(word)) continue;
    if (seen.has(word)) continue;

    seen.add(word);
    words.push(word);
  }

  return words.sort((a, b) => a.length - b.length || a.localeCompare(b));
}

const WORDS = loadWords();

for (const [key, bank] of Object.entries(WORD_BANKS)) {
  if (key === 'all') bank.words = WORDS;
  else if (key === 'short') bank.words = WORDS.filter(word => word.length <= 5);
  else bank.words = uniqueCleanWords(bank.words, key === 'numbers');
}

function getSelectedWords(wordListKey) {
  return WORD_BANKS[wordListKey]?.words || WORDS;
}

const CACHE_FILE = '.domain-availability-cache.json';
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const UNKNOWN_CACHE_MAX_AGE_MS = 1000 * 60 * 15; // retry unknown results after 15 minutes
const domainCache = new Map();
let cacheSaveTimer = null;

function loadDomainCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const now = Date.now();
    for (const item of Array.isArray(raw) ? raw : []) {
      if (!item?.domain || !item?.status || !item?.checkedAt) continue;
      const maxAge = item.status === 'unknown' ? UNKNOWN_CACHE_MAX_AGE_MS : CACHE_MAX_AGE_MS;
      if (now - item.checkedAt <= maxAge) domainCache.set(item.domain, item);
    }
  } catch (error) {
    console.warn('Could not load domain cache:', error.message);
  }
}

function scheduleDomainCacheSave() {
  clearTimeout(cacheSaveTimer);
  cacheSaveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify([...domainCache.values()], null, 2));
    } catch (error) {
      console.warn('Could not save domain cache:', error.message);
    }
  }, 250);
}


const CACHE_SCHEMA_VERSION = 25;

function getCachedDomain(domain) {
  const cached = domainCache.get(domain);
  if (!cached) return null;

  // v24 changed the RDAP provider for common TLDs. Do not keep old v23
  // unknown results because they can make the scan look like it is doing
  // nothing after an update.
  if (cached.cacheVersion !== CACHE_SCHEMA_VERSION) {
    domainCache.delete(domain);
    return null;
  }

  const maxAge = cached.status === 'unknown' ? UNKNOWN_CACHE_MAX_AGE_MS : CACHE_MAX_AGE_MS;
  if (Date.now() - cached.checkedAt > maxAge) {
    domainCache.delete(domain);
    return null;
  }
  return { domain, status: cached.status, note: cached.note ? `${cached.note} · cached` : 'cached' };
}

function rememberDomainResult(result) {
  domainCache.set(result.domain, {
    domain: result.domain,
    status: result.status,
    note: result.note || '',
    checkedAt: Date.now(),
    cacheVersion: CACHE_SCHEMA_VERSION
  });
  scheduleDomainCacheSave();
}

const RDAP_PROVIDERS = {
  com: 'https://rdap.verisign.com/com/v1/domain/{domain}',
  net: 'https://rdap.verisign.com/net/v1/domain/{domain}',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/{domain}',
  app: 'https://rdap.nic.google/domain/{domain}',
  dev: 'https://rdap.nic.google/domain/{domain}',
  page: 'https://rdap.nic.google/domain/{domain}',
  xyz: 'https://rdap.nic.xyz/domain/{domain}',
  nl: 'https://rdap.domain-registry.nl/domain/{domain}',
  uk: 'https://rdap.nominet.uk/uk/domain/{domain}'
};

function rdapUrlsForDomain(domain) {
  const tld = String(domain).split('.').pop().toLowerCase();
  const provider = RDAP_PROVIDERS[tld];
  // For common TLDs, use the official registry RDAP directly. Do not also
  // wait for rdap.org in the same request, because two timeouts in a row
  // made v23/v24 look stuck at 0 checked. For less common TLDs, fall back
  // to rdap.org.
  if (provider) return [provider.replace('{domain}', encodeURIComponent(domain))];
  return [`https://rdap.org/domain/${encodeURIComponent(domain)}`];
}

async function fetchOneRdapUrl(domain, url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/rdap+json, application/json;q=0.9,*/*;q=0.1' }
    });

    if (response.status === 404) return { domain, status: 'available', note: 'RDAP confirmed' };
    if (response.status === 200) return { domain, status: 'taken', note: 'RDAP confirmed' };
    return { domain, status: 'unknown', note: `RDAP HTTP ${response.status}` };
  } catch (error) {
    return { domain, status: 'unknown', note: error.name === 'AbortError' ? 'RDAP timeout' : 'RDAP request failed' };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDomainRdap(domain, timeoutMs = 5000) {
  let last = null;
  for (const url of rdapUrlsForDomain(domain)) {
    last = await fetchOneRdapUrl(domain, url, timeoutMs);
    if (last.status !== 'unknown') return last;
  }
  return last || { domain, status: 'unknown', note: 'No RDAP answer' };
}


// Strict mode: only confirmed RDAP answers are counted.
// 404 = confirmed available, 200 = taken, timeout/error = unknown.
// Unknown is never shown when "Show available only" is enabled.

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SPEED_PROFILES = {
  safe: { label: 'Safe', concurrency: 6, timeoutMs: 2500, retries: 1, delayMs: 10 },
  fast: { label: 'Fast', concurrency: 20, timeoutMs: 1200, retries: 0, delayMs: 0 },
  turbo: { label: 'Turbo', concurrency: 40, timeoutMs: 800, retries: 0, delayMs: 0 }
};

function getSpeedProfile(value) {
  return SPEED_PROFILES[value] || SPEED_PROFILES.fast;
}

async function checkDomain(domain, options = {}) {
  const cached = getCachedDomain(domain);
  if (cached) return cached;

  const timeoutMs = options.timeoutMs || SPEED_PROFILES.fast.timeoutMs;
  const retries = Math.max(0, Number(options.retries || 0));
  let last = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    last = await fetchDomainRdap(domain, timeoutMs);
    if (last.status !== 'unknown') break;
    if (attempt < retries) await delay(200 * (attempt + 1));
  }

  // Do not guess from DNS and do not use slow WHOIS fallback.
  // The user asked for confirmed available only, so unknown stays unknown.
  rememberDomainResult(last);
  return last;
}

async function checkDomainsWithLimit(candidates, options = {}) {
  const limit = Math.max(1, Math.min(100, Number(options.concurrency || SPEED_PROFILES.fast.concurrency)));
  const delayMs = Math.max(0, Number(options.delayMs || 0));
  const results = new Array(candidates.length);
  let index = 0;

  async function worker() {
    while (index < candidates.length) {
      const current = index;
      index += 1;
      results[current] = await checkDomain(candidates[current].domain, options);
      if (delayMs) await delay(delayMs);
    }
  }

  const workers = Array.from({ length: Math.min(limit, candidates.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function gcd(a, b) {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
}

function generatedFromPatternIndex(pattern, rawIndex, seed = 1) {
  const wildcards = [...pattern].filter(char => char === '?').length;
  const total = Math.pow(26, wildcards);
  let step = 1103515245 + (Math.abs(Number(seed) || 1) % 100000) * 2;
  step = Math.max(1, Math.floor(step));
  while (gcd(step, total) !== 1) step += 2;
  let index = (Math.floor(rawIndex) * step + Math.abs(Math.floor(Number(seed) || 1))) % total;
  const letters = [];
  for (let i = 0; i < wildcards; i += 1) {
    letters.push(String.fromCharCode(97 + (index % 26)));
    index = Math.floor(index / 26);
  }
  let cursor = 0;
  return [...pattern].map(char => {
    if (char !== '?') return char;
    const out = letters[cursor] || 'a';
    cursor += 1;
    return out;
  }).join('');
}

loadDomainCache();

app.get('/api/words/meta', (req, res) => {
  res.json({
    count: WORDS.length,
    source: 'curated common English list, cleaned English dictionary, and curated English category lists, including Less-used common words',
    rule: 'exactly one generated item from the selected word list plus a prefix or suffix',
    filtering: 'Obvious Dutch/non-English entries and very short fragments are removed. The Adult / edgy list allows rude/adult words but intentionally excludes protected-class slurs.',
    lists: Object.entries(WORD_BANKS).map(([key, bank]) => ({
      key,
      label: bank.label,
      description: bank.description,
      count: bank.words.length
    }))
  });
});


function countMatchingWordCandidates(words, fixedPart, mode, maxLength, wordPattern, tldsCount) {
  let matchingWords = 0;
  let skippedPattern = 0;
  let skippedLength = 0;

  for (const word of words) {
    if (!wordMatchesPattern(word, wordPattern)) {
      skippedPattern += 1;
      continue;
    }
    const label = mode === 'suffix' ? `${word}${fixedPart}` : `${fixedPart}${word}`;
    if (label.length > maxLength) {
      skippedLength += 1;
      continue;
    }
    matchingWords += 1;
  }

  return {
    matchingWords,
    matchingDomains: matchingWords * Math.max(1, tldsCount),
    skippedPattern,
    skippedLength,
    selectedWords: words.length
  };
}

app.post('/api/check', async (req, res) => {
  // Keep req.body.prefix for backward compatibility with older front ends.
  const fixedPart = cleanLabel(req.body.fixedPart ?? req.body.prefix);
  const mode = req.body.mode === 'suffix' ? 'suffix' : 'prefix';
  const maxLength = Math.max(1, Math.min(63, Number(req.body.maxLength || 63)));
  const wordPattern = cleanWordPattern(req.body.wordPattern);
  const generationSource = req.body.generationSource === 'random' ? 'random' : 'wordList';
  const batchSize = Math.max(1, Math.min(2000, Number(req.body.batchSize || 100)));
  const offset = Math.max(0, Number(req.body.offset || 0));
  const speedMode = ['safe', 'fast', 'turbo'].includes(req.body.speedMode) ? req.body.speedMode : 'fast';
  const speedProfile = getSpeedProfile(speedMode);
  const randomSeed = Math.max(1, Number(req.body.randomSeed || 1));
  // The server always returns every checked result. The frontend handles the
  // "Show available only" checkbox as a live view filter so already-checked
  // taken/unknown domains are not lost.
  const wordListKey = WORD_BANKS[req.body.wordList] ? req.body.wordList : 'common';
  const selectedWords = getSelectedWords(wordListKey);

  const rawTlds = Array.isArray(req.body.tlds) ? req.body.tlds : String(req.body.tlds || 'com').split(',');
  const tlds = [...new Set(rawTlds.map(cleanTld).filter(Boolean))];

  if (!fixedPart) return res.status(400).json({ error: mode === 'suffix' ? 'Suffix is required.' : 'Prefix is required.' });
  if (!tlds.length) return res.status(400).json({ error: 'At least one TLD is required.' });

  const wordCandidateSummary = generationSource === 'wordList'
    ? countMatchingWordCandidates(selectedWords, fixedPart, mode, maxLength, wordPattern, tlds.length)
    : null;

  const candidates = [];
  let nextOffset = offset;
  let finished = false;
  let totalWords = selectedWords.length;
  let randomPattern = '';

  if (generationSource === 'random') {
    const slots = maxLength - fixedPart.length;
    if (slots < 1) {
      return res.status(400).json({ error: 'Max name length must leave at least 1 random letter after the prefix/suffix.' });
    }
    if (wordPattern && wordPattern.length !== slots) {
      return res.status(400).json({ error: `For random spelling, the pattern must be exactly ${slots} letters/wildcards because ${fixedPart} uses ${fixedPart.length} of ${maxLength} letters.` });
    }

    randomPattern = wordPattern || '?'.repeat(slots);
    totalWords = randomPatternSpace(randomPattern);

    while (nextOffset < totalWords && candidates.length < batchSize) {
      const generated = generatedFromPatternIndex(randomPattern, nextOffset, randomSeed);
      nextOffset += 1;
      const label = mode === 'suffix' ? `${generated}${fixedPart}` : `${fixedPart}${generated}`;

      for (const tld of tlds) {
        candidates.push({ word: generated, mode, fixedPart, domain: `${label}.${tld}`, source: 'random' });
        if (candidates.length >= batchSize) break;
      }
    }

    finished = nextOffset >= totalWords;
  } else {
    while (nextOffset < selectedWords.length && candidates.length < batchSize) {
      const word = selectedWords[nextOffset];
      nextOffset += 1;

      if (!wordMatchesPattern(word, wordPattern)) continue;

      const label = mode === 'suffix' ? `${word}${fixedPart}` : `${fixedPart}${word}`;

      // This is the important rule: one fixed part + one generated item only.
      // Prefix mode creates fixed part + word. Suffix mode creates word + fixed part.
      // No second generated word is ever appended.
      if (label.length > maxLength) continue;

      for (const tld of tlds) {
        candidates.push({ word, mode, fixedPart, domain: `${label}.${tld}`, source: 'wordList' });
        if (candidates.length >= batchSize) break;
      }
    }
    finished = nextOffset >= selectedWords.length;
  }

  const checked = await checkDomainsWithLimit(candidates, speedProfile);
  const byDomain = new Map(checked.map(item => [item.domain, item]));
  const results = candidates.map(item => ({ word: item.word, mode: item.mode, fixedPart: item.fixedPart, source: item.source, ...byDomain.get(item.domain) }));
  res.json({
    results,
    checked: results.length,
    returned: results.length,
    nextOffset,
    finished,
    totalWords,
    generationSource,
    randomPattern,
    wordList: wordListKey,
    wordPattern,
    speedMode,
    speedLabel: speedProfile.label,
    scannedItems: nextOffset - offset,
    candidateCount: candidates.length,
    wordCandidateSummary
  });
});

if (!process.env.VERCEL && process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Prefix/Suffix Domain Generator running at http://localhost:${PORT}`);
    console.log(`Loaded ${WORDS.length.toLocaleString()} English-only words after removing obvious Dutch/non-English entries.`);
  });
}

export default app;
