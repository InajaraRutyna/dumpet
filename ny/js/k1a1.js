/* Dumpet på Måne Syv · Kapitel 1 · Afsnit 1 · Faldet */
(function () {
  'use strict';
  const E = window.E, A = window.Art, G = E.G, Gm = window.Games;
  const S = () => E.S();

  /* ---------------- voices and names */
  Object.assign(E.SPK, {
    lav: { name: 'Lav', sub: 'moshjort', voice: [0.85, 0.75] },
    skib: { name: 'SKIB', sub: 'skibets computer', voice: [1, 1.4] },
    birk: { name: 'Birk', sub: 'skovens vogter', voice: [1.05, 1] },
    holm: { name: 'Holm', sub: 'portvagt', voice: [0.85, 0.7] },
    vex: { name: 'Vex', sub: 'Kurator' },
    plink: { name: 'Plink', sub: 'Kurator · assistent' },
    stemme: { name: 'En stemme', sub: '?', voice: [0.8, 1.2] },
    asta: { name: 'Asta', sub: 'log', voice: [0.95, 1.1] }
  });
  Object.assign(E.IRONY, {
    lav: ['Jeg er en hjort, og selv jeg kan det. Sig:', 'Lav sighs the long sigh of a very old deer.'],
    skib: ['Bip. Fejl. Fejl. Fejl. Det korrekte svar er:', 'SKIB’s face flickers, like an eye-roll made of pixels.'],
    birk: ['Har du sand i ørerne? Sig:', 'Birk taps her staff on the ground. Patience is not her gift.'],
    holm: ['Formularen siger:', 'Holm reads it out like a law.'],
    _: ['Sig bare:', '']
  });

  /* ---------------- every Danish word in this section can be tapped */
  E.addGloss({
    // little words
    'og': 'and', 'er': 'is, are, am', 'jeg': 'I', 'du': 'you', 'ja': 'yes', 'nej': 'no', 'hej': 'hi', 'tak': 'thanks', 'ikke': 'not', 'også': 'also, too', 'men': 'but', 'så': 'so, then', 'for': 'for; because (joins two sentences, word order unchanged)',
    'en': 'a, an; one', 'et': 'a, an (et-words)', 'den': 'it; the', 'det': 'it, that; the', 'de': 'they', 'dem': 'them', 'mig': 'me', 'dig': 'you (object)', 'sig': 'say! (also: oneself)', 'han': 'he', 'hun': 'she', 'ham': 'him', 'hende': 'her', 'hans': 'his', 'hendes': 'her (owner)', 'vi': 'we', 'man': 'one, you, people', 'min': 'my (en-words)', 'mit': 'my (et-words)', 'mine': 'my (plural)', 'din': 'your', 'dit': 'your (et-words)', 'sin': 'her/his own',
    'i': 'in', 'på': 'on, at (also: in, for islands and some workplaces)', 'til': 'to', 'fra': 'from', 'med': 'with', 'af': 'of, by', 'om': 'about; at (time)', 'bag': 'behind', 'ind': 'in, into', 'ud': 'out', 'over': 'over, across', 'som': 'as; who, that',
    'hvem': 'who', 'hvad': 'what', 'hvor': 'where', 'hvorfor': 'why', 'hvordan': 'how', 'hvis': 'if', 'når': 'when', 'nu': 'now', 'her': 'here', 'hertil': 'here (to here, after a movement)', 'der': 'there; who, that', 'lige': 'just, right', 'kun': 'only', 'meget': 'very, much', 'stadig': 'still', 'aldrig': 'never', 'altid': 'always', 'bare': 'just', 'imens': 'meanwhile, while doing it', 'igen': 'again', 'endnu': 'yet, still', 'måske': 'maybe', 'gerne': 'gladly (gerne vil = would like to)', 'godt': 'well, good', 'godt sagt': 'well said', 'hurtigt': 'fast, quickly', 'langsomt': 'slowly', 'nogen': 'anyone, someone', 'alt': 'everything', 'alle': 'everyone, all', 'mere': 'more, any more', 'før': 'before', 'fordi': 'because (+ a whole sentence)', 'for at': 'in order to (+ a verb)', 'på grund af': 'because of (+ a thing)', 'at': 'to (before a verb); that', 'bip': 'beep', 'stop': 'stop', 'vent': 'wait', 'ssh': 'shh', 'ironisk': 'ironic', 'ligesom': 'just like', 'selv': 'even; self', 'næsten': 'almost', 'sammen': 'together',
    // the moon and the forest
    'måne': 'moon', 'måne syv': 'Moon Seven', 'månens': 'the moon’s', 'syv': 'seven', 'skov': 'forest', 'skoven': 'the forest', 'skovens': 'the forest’s', 'sø': 'lake', 'søen': 'the lake', 'træ': 'tree', 'træet': 'the tree', 'sten': 'stone, stones', 'stenene': 'the stones', 'klangsten': 'sound stone(s)', 'krystal': 'crystal', 'krystallen': 'the crystal', 'krystaller': 'crystals', 'lys': 'light', 'lyset': 'the light', 'mørke': 'darkness, dark', 'mørk': 'dark', 'nat': 'night', 'natten': 'the night', 'om natten': 'at night', 'morgen': 'morning', 'god morgen': 'good morning', 'stien': 'the path', 'broen': 'the bridge', 'bro': 'bridge', 'kløften': 'the ravine', 'pylonen': 'the pylon', 'lås': 'lock', 'låse': 'locks', 'nøgle': 'key', 'nøgler': 'keys', 'drone': 'drone', 'dronen': 'the drone', 'droner': 'drones', 'dronerne': 'the drones', 'skib': 'ship', 'skibet': 'the ship', 'skibe': 'ships', 'skibs': 'ship’s', 'skibets': 'the ship’s', 'computer': 'computer', 'moshjort': 'moss deer', 'hjort': 'deer', 'spejl': 'mirror', 'spejlbroen': 'the mirror bridge', 'planke': 'plank', 'by': 'town, city', 'byer': 'towns, cities', 'port': 'gate', 'porten': 'the gate', 'portvagt': 'gatekeeper', 'vogter': 'warden, guardian', 'scanneren': 'the scanner', 'formular': 'form', 'formularen': 'the form', 'stempel': 'stamp', 'log': 'log', 'loggen': 'the log', 'frakke': 'coat', 'frakken': 'the coat', 'skulderen': 'the shoulder', 'ord': 'word, words', 'ordet': 'the word', 'ordene': 'the words', 'ordkraft': 'word power', 'ordbog': 'dictionary, word book', 'magi': 'magic', 'sprog': 'language', 'sproget': 'the language', 'dansk': 'Danish', 'engelsk': 'English', 'fremmed': 'stranger; foreign', 'fremmede': 'strangers', 'mennesker': 'humans, people', 'alien': 'alien', 'aliens': 'aliens', 'vej': 'way, road', 'hjælp': 'help', 'sand': 'sand', 'ørerne': 'the ears', 'datter': 'daughter', 'mor': 'mother', 'mors': 'mother’s', 'navn': 'name', 'liv': 'life', 'minde': 'memory', 'minder': 'memories', 'dine': 'your (plural)', 'datid': 'past tense', 'grund': 'reason', 'spørgsmål': 'question', 'analyse': 'analysis', 'registrering': 'registration', 'færdig': 'finished, done', 'advarsel': 'warning', 'fejl': 'error', 'korrekte': 'correct', 'svar': 'answer', 'svaret': 'the answer', 'selskab': 'company (people around you)', 'brug for': 'need (have brug for = need)', 'år': 'year, years', 'siden': 'ago; since', 'nummer': 'number', 'to': 'two', 'tre': 'three', 'fem': 'five', 'seks': 'six', 'seng': 'bed', 'skak': 'chess', 'nabo': 'neighbour', 'havet': 'the sea',
    // adjectives
    'gammel': 'old', 'gammelt': 'old (et-word)', 'gamle': 'old (plural, the …)', 'ny': 'new', 'lille': 'small', 'stor': 'big', 'stærk': 'strong', 'stædig': 'stubborn', 'modig': 'brave', 'klog': 'clever, wise', 'sarkastisk': 'sarcastic', 'mærkeligt': 'strange (et-word)', 'spændende': 'exciting', 'træt': 'tired', 'sulten': 'hungry', 'alene': 'alone', 'rigtigt': 'correct, right', 'rigtig': 'correct, right', 'forkert': 'wrong', 'dårligt': 'bad', 'ikke dårligt': 'not bad', 'smukt': 'beautiful', 'godkendt': 'approved', 'herfra': 'from here', 'klar': 'ready', 'forstået': 'understood',
    // verbs, present
    'hedder': 'am/is called', 'kommer': 'comes, is coming', 'lyser': 'glows, shines', 'jager': 'hunts', 'gem dig': 'hide!', 'gemmer': 'hides', 'ned': 'down; get down!', 'stille': 'quiet, still; freeze!', 'løb': 'run! (also: ran)', 'bag træet': 'behind the tree', 'kan': 'can', 'kunne': 'could (past of kan)', 'vil': 'want to, will', 'ville': 'wanted to, would (past of vil)', 'skal': 'must, have to, am going to', 'har': 'have, has', 'taler': 'speaks', 'hjælper': 'helps', 'hjælpe': 'help (verb)', 'lukker': 'closes', 'åbner': 'opens', 'spørger': 'asks', 'svarer': 'answers', 'bygger': 'builds', 'står': 'stands', 'ligger': 'lies, is located', 'lugter': 'smell, smells', 'forstår': 'understand(s)', 'kalder': 'call(s)', 'læser': 'read(s), is reading', 'lærer': 'learn(s); teacher', 'siger': 'says', 'kender': 'know(s) (a person, a thing)', 'tror': 'think, believe', 'skylder': 'owe(s)', 'sove': 'sleep', 'se': 'see', 'sige': 'say', 'finde': 'find', 'redde': 'save, rescue', 'flygte': 'escape, flee', 'overleve': 'survive', 'leve': 'live (be alive)', 'flyve': 'fly', 'lære': 'learn', 'være': 'be', 'tale': 'speak, talk', 'lyse': 'glow, shine', 'lytte': 'listen', 'registrere': 'register', 'kig': 'look!', 'kig ikke ned': 'don’t look down', 'takke': 'thank', 'læse': 'read', 'lide': 'like (kan lide = like)', 'kan lide': 'like(s)', 'skære': 'cut', 'tag': 'take!', 'klarede': 'managed, made it', 'ro på': 'easy, calm down', 'kom': 'came (past of komme); come!', 'følg mig': 'follow me', 'halvvejs': 'halfway', 'hjem': 'home (going home)', 'hjemme': 'at home', 'udfylde': 'fill in', 'skrive': 'write', 'skriv': 'write!', 'lad mig se': 'let me see', 'sover': 'sleeps', 'dør': 'die(s)', 'lyder': 'sounds', 'det lyder spændende': 'that sounds exciting', 'vender tilbage': 'comes back, returns', 'et minde vender tilbage': 'a memory comes back', 'tilbage': 'back', 'har set': 'has seen', 'set': 'seen', 'leder': 'lead(s), guide(s)', 'væk': 'away', 'skjuler': 'hides', 'gør': 'does', 'stemme': 'voice', 'hold ud': 'hold on',
    // verbs: infinitive → past (the forge)
    'lave': 'make, do', 'lavede': 'made, did (past of lave)', 'arbejde': 'work', 'arbejdede': 'worked', 'arbejder': 'work(s), is working (now)', 'flytte': 'move (house)', 'flyttede': 'moved', 'bo': 'live (somewhere)', 'boede': 'lived', 'bor': 'live(s) (now)', 'spille': 'play', 'spillede': 'played', 'spiller': 'plays (now)', 'studere': 'study', 'studerede': 'studied', 'cykle': 'cycle', 'cyklede': 'cycled', 'cykler': 'cycles (now)', 'starte': 'start', 'startede': 'started', 'åbne': 'open', 'åbnede': 'opened', 'læste': 'read (past); studied (a subject)', 'købe': 'buy', 'købte': 'bought', 'spise': 'eat', 'spiste': 'ate', 'begynde': 'begin', 'begyndte': 'began', 'rejse': 'travel', 'rejste': 'travelled', 'undervise': 'teach', 'underviste': 'taught', 'møde': 'meet', 'mødte': 'met', 'gå': 'go, walk', 'gik': 'went, walked', 'går': 'go(es), walk(s) (now)', 'have': 'have', 'havde': 'had', 'komme': 'come', 'tage': 'take', 'tog': 'took; train', 'tager': 'take(s) (now)', 'var': 'was, were', 'få': 'get', 'fik': 'got', 'gøre': 'do', 'gjorde': 'did', 'sagde': 'said', 'skrev': 'wrote', 'sov': 'slept', 'stjal': 'stole', 'faldt': 'fell', 'smed': 'threw', 'smed mig ud': 'threw me out', 'styrtede ned': 'crashed', 'lærte': 'learned; taught', 'gemte': 'hid', 'elskede': 'loved', 'hjalp': 'helped', 'stoppede': 'stopped', 'tog mig': 'took me', 'malede': 'painted', 'dansede': 'danced', 'kørte': 'drove', 'kører': 'drive(s) (now)', 'lyste': 'glowed',
    // jobs, places, life before
    'job': 'job', 'sygeplejerske': 'nurse', 'ingeniør': 'engineer', 'kok': 'cook, chef', 'designer': 'designer', 'journalist': 'journalist', 'læge': 'doctor', 'økonom': 'economist', 'programmør': 'programmer', 'arkitekt': 'architect', 'frisør': 'hairdresser', 'studerende': 'student', 'geolog': 'geologist', 'pilot': 'pilot',
    'hospital': 'hospital', 'et hospital': 'a hospital', 'skole': 'school', 'en skole': 'a school', 'universitet': 'university', 'et universitet': 'a university', 'hotel': 'hotel', 'et hotel': 'a hotel', 'fabrik': 'factory', 'en fabrik': 'a factory', 'firma': 'company, firm', 'et firma': 'a company', 'bank': 'bank', 'en bank': 'a bank', 'butik': 'shop', 'en butik': 'a shop', 'børnehave': 'kindergarten', 'en børnehave': 'a kindergarten', 'kontor': 'office', 'et kontor': 'an office',
    'fritid': 'free time', 'din fritid': 'your free time', 'fodbold': 'football', 'yoga': 'yoga', 'gik til yoga': 'went to yoga (classes)', 'guitar': 'guitar', 'bøger': 'books', 'fitnesscenter': 'gym', 'mad': 'food', 'lavede mad': 'cooked', 'ture': 'walks, trips', 'gik ture': 'went for walks', 'computerspil': 'video games', 'arbejde': 'work; to work', 'på arbejde': 'to work, at work', 'bussen': 'the bus', 'metroen': 'the metro', 'toget': 'the train', 'bil': 'car', 'kørte bil': 'drove a car',
    'jorden': 'the Earth', 'lissabon': 'Lisbon', 'berlin': 'Berlin', 'london': 'London', 'kraków': 'Kraków', 'são paulo': 'São Paulo', 'manila': 'Manila', 'lagos': 'Lagos', 'toronto': 'Toronto', 'mumbai': 'Mumbai', 'madrid': 'Madrid', 'sicilien': 'Sicily', 'island': 'Iceland', 'bali': 'Bali', 'kreta': 'Crete', 'fyn': 'Funen (a Danish island)', 'bornholm': 'Bornholm (a Danish island)', 'tyskland': 'Germany', 'bergen': 'Bergen (a city in Norway)',
    // phrases used in the story
    'du lyser': 'you are glowing', 'du er ikke alene': 'you are not alone', 'du skylder mig en': 'you owe me one', 'hvad hedder du': 'what is your name', 'jeg hedder': 'my name is', 'det modsatte': 'the opposite', 'modsatte': 'opposite', 'igen': 'again', 'ikke helt': 'not quite', 'prøv igen': 'try again', 'sig det': 'say it', 'lyt': 'listen', 'lyt efter enden': 'listen to the ending', 'ved ikke': 'don’t know', 'anderledes': 'different (here: irregular)', 'brug mit eget': 'use my own', 'videre': 'on, onward', 'til menuen': 'to the menu', 'fundet': 'found', 'byg': 'build!', 'forfra': 'from the start', 'planken holder': 'the plank holds', 'planken knækker': 'the plank breaks', 'låsen gnister': 'the lock sparks', 'tre nøgler': 'three keys', 'stenen synger': 'the stone sings', 'sådan her': 'like this', 'stumme bogstaver': 'silent letters', 'find lyden': 'find the sound', 'find dem': 'find them', 'færdig': 'done', 'dikter': 'dictate', 'baggrund': 'background', 'sætninger': 'sentences', 'verbet': 'the verb', 'først': 'first', 'jeg sagde det': 'I said it', 'lytter': 'listening', 'skriv her': 'write here', 'hukommelsessmedjen': 'the memory forge', 'hukommelse': 'memory', 'i eller på': 'i or på', 'læs højt': 'read aloud', 'fortsæt': 'continue', 'kapitler': 'chapters', 'indstillinger': 'settings', 'luk': 'close', 'begynd': 'begin', 'sov godt': 'sleep well', 'ny rejse': 'new journey', 'ord mødt': 'words met', 'kapitel': 'chapter', 'afsnit': 'section', 'faldet': 'the fall', 'ankomsten': 'the arrival', 'til titelskærmen': 'to the title screen', 'start afsnittet forfra': 'restart the section', 'svar': 'answer',
    'tingene': 'the things', 'i morgen': 'tomorrow', 'taler vi': 'we talk', 'låst': 'locked', 'sti': 'path', 'lyd': 'sound', 'synge': 'sing', 'flytter': 'move(s) (to a new home)', 'ikke væk': 'not gone', 'følg': 'follow!', 'her kan du sove': 'you can sleep here', 'danskere': 'Danes', 'find': 'find!', 'brug': 'use; need (brug for)', 'a': 'A', 'l': 'L', 'spist': 'eaten (har spist = has eaten)', 'pas på': 'careful; take care of', 'lyden': 'the sound', 'blød': 'soft', 'hører': 'hear(s)', 'ede': 'the ending -ede', 'te': 'the ending -te', 't': 'the letter t', 'd': 'the letter d', 'lav': 'Lav (his name; lav also means low)', 'asta': 'Asta (a name)', 'lund': 'Lund (a surname; lund = grove)', 'birk': 'Birk (her name; birk = birch tree)', 'holm': 'Holm (his name; holm = islet)', 'registreret': 'registered', 'gendannet': 'restored', 'minde gendannet': 'memory restored', 'egne': 'own (plural)', 'egen': 'own', 'fire': 'four', 'interessant': 'interesting', 'sidste': 'last', 'gang': 'time (one time)', 'første': 'first', 'bedste': 'best', 'elev': 'student, pupil', 'værste': 'worst', 'velkommen': 'welcome', 'velkommen til': 'welcome to', 'hm': 'hm', 'lukket': 'closed', 'os': 'us', 'dette': 'this', 'deres': 'their', 'små': 'small (plural)', 'ingen': 'no, none', 'artikel': 'article (en/et)', 'andet': 'other', 'det andet ord': 'the other word', 'hele': 'the whole', 'sætningen': 'the sentence', 'vrag': 'wreck', 'ø': 'island', 'eller': 'or', 'land': 'country', 'i begyndelsen': 'at first, in the beginning', 'høre': 'hear', 'selv en sten': 'even a stone', 'formular 7b': 'form 7B', 'b': 'B', 'dette skibs': 'this ship’s', 'skibs computer': 'ship’s computer', 'ikke herfra': 'not from here', 'vil du': 'do you want to', 'den første': 'the first one', 'stenen': 'the stone', 'gem': 'hide', 'ro': 'calm', 'jeg ved det ikke': 'I don’t know', 'ved': 'know (jeg ved = I know)', 'bip': 'beep', 'spørgsmål et': 'question one', 'artiklen': 'the article', 'tak': 'thanks; please (after a request)', 'hører man': 'one hears', 'mors': 'mother’s', 'min mors frakke': 'my mother’s coat', 'gemmer mig': 'hide (myself)', 'lærte mig': 'taught me', 'ud af': 'out of', 'af deres': 'of their', 'om aftenen': 'in the evening', 'vågen': 'awake', 'huske': 'remember', 'gemte mig': 'hid me', 'himlen': 'the sky', 'falder': 'fall(s)', 'ned': 'down', 'ærligt': 'honest(ly)', 'forkerte': 'wrong (the …)', 'er kommet': 'have come', 'kommet': 'come (past participle)', 'bringer': 'bring(s)', 'spurgte': 'asked', 'kuratorerne': 'the Kurators', 'finde vej': 'find the way', 'fordi-sætning': 'fordi-sentence', 'sætning': 'sentence', 'bygger sig selv': 'builds itself', 'flyve': 'fly', 'i min seng': 'in my bed', 'have selskab': 'have company', 'imponeret': 'impressed', 'kom over': 'got across', 'tingene': 'the things', 'danskere': 'Danes', 'som danskere siger dem': 'the way Danes say them', 'længere': 'further, longer', 'pas på': 'take care of, watch out', 'før-sætning': 'før-clause', 'omvendt': 'inverted, reversed', 'ordstilling': 'word order', 'hurtigere end': 'faster than', 'end': 'than', 'ikke endnu': 'not yet',
    'tal nu': 'speak now', 'vent': 'wait', 'lytter': 'is listening',
    'dansker': 'a Dane', 'farligt': 'dangerous', 'hund': 'dog', 'nøglen': 'the key', 'passer': 'looks after, guards', 'passer på': 'looks after, takes care of', 'åbnet': 'opened, unlocked', 'minde åbnet': 'memory unlocked',
    'kronby': 'Kronby (the town in the tree)', 'kronbys': 'Kronby’s', 'vraget': 'the wreck', 'kurator-skibet': 'the Kurator ship', 'klangstenene': 'the sound stones'
  });

  /* ---------------- helpers */
  const has = (t, ...ps) => ps.every(p => (' ' + t + ' ').includes(' ' + E.norm(p) + ' '));
  const any = (t, ...ps) => ps.some(p => has(t, p));
  const SUBJ = ['jeg', 'du', 'han', 'hun', 'vi', 'de', 'man', 'den', 'det', 'birk', 'lav', 'asta', 'to', 'nogle', 'min', 'mit', 'dronen', 'dronerne', 'kuratorerne', 'aliens'];
  const PRON = ['jeg', 'du', 'han', 'hun', 'vi', 'de', 'man'];
  function reason(t) {
    const w = t.split(' ');
    const i1 = t.indexOf('på grund af'), i2 = (' ' + t + ' ').indexOf(' for at '), i3 = w.indexOf('fordi');
    if (i3 >= 0) { const nx = w[i3 + 1]; if (nx === 'at') return { bad: '**fordi** needs a whole sentence, never “at”: fordi jeg …' }; if (!nx) return { bad: 'After **fordi** comes a whole sentence: fordi de smed mig ud.' }; if (w.length - i3 >= 3) return { ok: 'fd' }; return { bad: 'After **fordi** comes a whole sentence with a subject and a verb: fordi jeg ikke ville …' }; }
    if (i2 >= 0) { const after = t.slice(i2 + 7).trim().split(' '); if (!after[0]) return { bad: '**for at** needs a verb after it: for at finde hjælp.' }; if (PRON.includes(after[0])) return { bad: '**for at** takes a verb right away, no subject: for at finde …, not for at jeg …' }; return { ok: 'fa' }; }
    if (i1 >= 0) { const after = t.slice(i1 + 11).trim().split(' '); if (!after[0]) return { bad: '**på grund af** needs a thing after it: på grund af to aliens.' }; if (PRON.includes(after[0]) && after[1]) return { bad: '**på grund af** takes a thing, not a sentence: på grund af dem / på grund af to aliens.' }; return { ok: 'pga' }; }
    return { none: 1 };
  }
  async function fadeTo(fn, dur) {
    E.hidePanel(); E.closeSheet();
    await E.tween(G, 'fade', 1, dur || 0.9);
    await fn();
    await E.wait(250);
    await E.tween(G, 'fade', 0, dur || 0.9);
  }
  function setScene(id, o) {
    o = o || {};
    ['progress', 'anomaly', 'beam', 'lifted', 'fallP', 'locker', 'coatTaken', 'locks', 'lockHi', 'pylonOpen', 'planks', 'crack', 'scan', 'dusk', 'glowPool', 'glowX', 'glowY', 'drone', 'burst', 'fizzle', 'splash', 'flash', 'shake', 'glitch', 'vignette', 'zzz', 'cam', 'camX', 'camZ', 'lights', 'stonesLit', 'gateOpen'].forEach(k => delete G[k]);
    G.scene = id; G.night = !!o.night; G.glow = o.night ? 1 : null; G.feet = o.feet || 668; G.maxLift = o.maxLift == null ? 260 : o.maxLift;
    Object.assign(G, o.g || {});
    E.setCast(o.cast || []);
    if (o.where) E.where(o.where);
  }
  const heroSet = (k, v, dur) => { const h = E.actor('hero'); if (!h) return; h.extra = Object.assign({}, h.extra || {}, { [k]: v }); return E.tween(h.o, k, v, dur || 0); };
  const D = () => G.drone;

  /* the memory menus */
  const JOBS = [
    { da: 'lærer', en: 'teacher', m: 'Chalk on your fingers. Thirty faces turning toward you at once, and the one at the back who never listened, and whom you liked best.' },
    { da: 'sygeplejerske', en: 'nurse', m: 'Night shifts. Bad coffee. A patient squeezing your hand and saying thank you without words.' },
    { da: 'ingeniør', en: 'engineer', m: 'A drawing that finally worked. The quiet pride of a thing that holds.' },
    { da: 'kok', en: 'cook', m: 'Heat, steam, shouting, the clatter of plates. The moment a whole kitchen moved like one body.' },
    { da: 'designer', en: 'designer', m: 'A screen at 2 a.m., a colour that was almost right, and then exactly right.' },
    { da: 'journalist', en: 'journalist', m: 'A notebook full of other people’s secrets. A deadline breathing on your neck.' },
    { da: 'læge', en: 'doctor', m: 'A waiting room. A child who was scared of you, and then wasn’t.' },
    { da: 'økonom', en: 'economist', m: 'Columns of numbers that told a story, if you knew how to listen.' },
    { da: 'programmør', en: 'programmer', m: 'A bug you hunted for three days. The silly little dance when you found it.' },
    { da: 'arkitekt', en: 'architect', m: 'A building that had only existed in your head, with people walking in and out of it.' },
    { da: 'frisør', en: 'hairdresser', m: 'The snip of scissors, the hum of the dryer, people telling you everything while you cut.' },
    { da: 'studerende', en: 'student', m: 'Libraries. Late nights. Friends on the floor of a tiny kitchen, laughing about nothing.' }
  ];
  const WORK = [
    { da: 'på et hospital', w: 'et hospital', p: 'på', en: 'at a hospital' }, { da: 'på en skole', w: 'en skole', p: 'på', en: 'at a school' }, { da: 'på et universitet', w: 'et universitet', p: 'på', en: 'at a university' },
    { da: 'på et hotel', w: 'et hotel', p: 'på', en: 'at a hotel' }, { da: 'på en fabrik', w: 'en fabrik', p: 'på', en: 'at a factory' }, { da: 'på et kontor', w: 'et kontor', p: 'på', en: 'at an office' },
    { da: 'i et firma', w: 'et firma', p: 'i', en: 'in a company' }, { da: 'i en bank', w: 'en bank', p: 'i', en: 'in a bank' }, { da: 'i en butik', w: 'en butik', p: 'i', en: 'in a shop' },
    { da: 'i en børnehave', w: 'en børnehave', p: 'i', en: 'in a kindergarten' }, { da: 'hjemme', w: 'hjemme', p: '', en: 'at home' }
  ];
  const CITIES = [
    { da: 'Lissabon', p: 'i' }, { da: 'Berlin', p: 'i' }, { da: 'London', p: 'i' }, { da: 'Kraków', p: 'i' }, { da: 'São Paulo', p: 'i' }, { da: 'Manila', p: 'i' },
    { da: 'Lagos', p: 'i' }, { da: 'Toronto', p: 'i' }, { da: 'Mumbai', p: 'i' }, { da: 'Madrid', p: 'i' }, { da: 'Sicilien', p: 'på', en: 'island' }, { da: 'Island', p: 'på', en: 'Iceland, an island' }, { da: 'Bali', p: 'på', en: 'island' }, { da: 'Kreta', p: 'på', en: 'island' }
  ];
  const HOBBY = [
    { da: 'spillede fodbold', pres: 'spiller', en: 'played football', m: 'Wet grass, a ball you never quite controlled, a team that shouted your name anyway.' },
    { da: 'gik til yoga', pres: 'går', en: 'went to yoga', m: 'A quiet room, slow breath, a teacher saying “and relax” as if it were easy.' },
    { da: 'spillede guitar', pres: 'spiller', en: 'played guitar', m: 'Three chords, sore fingertips, one song you could finally play all the way through.' },
    { da: 'læste bøger', pres: 'læser', en: 'read books', m: 'A sofa, a blanket, a book you didn’t want to end.' },
    { da: 'malede', pres: 'maler', en: 'painted', m: 'The smell of paint, a picture that was never finished, and that you loved anyway.' },
    { da: 'dansede', pres: 'danser', en: 'danced', m: 'Music too loud to think. Your body knowing exactly what to do.' },
    { da: 'gik i fitnesscenter', pres: 'går', en: 'went to the gym', m: 'Mirrors, heavy breathing, a playlist you knew by heart.' },
    { da: 'lavede mad', pres: 'laver', en: 'cooked', m: 'Onions in a pan, friends around the table, someone asking for the recipe.' },
    { da: 'gik ture', pres: 'går', en: 'went for walks', m: 'Long walks, no destination, the city changing colour in the evening.' },
    { da: 'spillede computerspil', pres: 'spiller', en: 'played video games', m: 'A glowing screen at midnight, one more level, one more, one more.' }
  ];
  const TRANS = [
    { da: 'cyklede', pres: 'cykler', en: 'cycled', m: 'a bicycle with a squeaky chain' }, { da: 'tog bussen', pres: 'tager', en: 'took the bus', m: 'the bus, always four minutes late' },
    { da: 'tog metroen', pres: 'tager', en: 'took the metro', m: 'the metro, faces lit by phones' }, { da: 'tog toget', pres: 'tager', en: 'took the train', m: 'the train, the same window seat every day' },
    { da: 'gik', pres: 'går', en: 'walked', m: 'the walk, the same corners, the same café' }, { da: 'kørte bil', pres: 'kører', en: 'drove a car', m: 'the car, the radio, the traffic lights' }
  ];
  const mem = () => S().mem;
  const jobLine = (subj, inv) => {
    const j = mem().job || JOBS[0], st = j.da === 'studerende';
    const v = st ? 'var' : 'arbejdede', rest = st ? 'studerende' : 'som ' + j.da;
    return inv ? `${v} ${subj} ${rest}` : `${subj} ${v} ${rest}`;
  };
  const cityP = () => { const c = mem().city || CITIES[0]; return (c.p || 'i') + ' ' + c.da; };

  /* ======================================================================= */
  const WLD = () => window.World;
  // walk until a place; on a restored checkpoint, you are simply there
  async function go(o) {
    const cp = S().cp, h0 = E.actor('hero');
    if (h0 && cp && !E.W.ffq.length && cp.at != null && cp.atN === cp.r.length) {
      // reopened in the middle of this walk: start where you stopped
      const lo = Math.min(h0.wx, o.to), hi = Math.max(h0.wx, o.to);
      h0.wx = Math.max(lo, Math.min(hi, cp.at)); G.view.x = h0.wx + 36;
      G.cast.forEach(a => { if (a.follow) a.wx = h0.wx - (a.gap || 62); });
    }
    await E.step(() => WLD().explore(o));
    const h = E.actor('hero'); if (!h) return;
    if (Math.abs(h.wx - o.to) > 2) h.wx = o.to;
    if (E.W.ff) { G.view.x = h.wx + 36; G.cast.forEach(a => { if (a.follow) a.wx = h.wx - (a.gap || 62); }); }
  }
  const cam = (x, z) => { G.camX = x; if (z != null) G.camZ = z; }, camFree = () => { G.camX = null; G.camZ = null; };

  async function run() {
    E.cpStart('k1a1-3');
    const s = S(), X = A.WX;

    /* ---------- 1 · Earth: a flat on the fourth floor */
    s.day = 0;
    setScene('bedroom', { feet: 664, maxLift: 200, where: 'Jorden', g: { zzz: true, male: s.pro === 'han' } });
    G.view = { x: 0, z: 0.86 };
    E.mood('earth', { wind: 0.01 });
    G.fade = 1; E.tween(G, 'fade', 0, 2);
    await E.tell([
      ['n', 'Earth. 03:12. A block of flats, a city that never quite sleeps, and on the fourth floor, **{navn}**, who does.'],
      ['n', 'On the nightstand the phone glows: an alarm for 06:40, three unread messages, and a reminder: “Dentist, 08:15. Do NOT cancel again.”'],
      ['t', 'I am going to cancel again.']
    ]);
    E.tween(G.view, 'z', 1.1, 3); E.tween(G.view, 'x', -4, 3);
    await E.tell([['n', 'The window starts to hum. Not the glass: the air itself. Every hair on your arms stands up.']]);
    E.hidePanel(); G.zzz = false; E.SFX.beam(); E.mood('ship', { hum: 0.04 });
    await E.tween(G, 'beam', 1, 2.4);
    G.lifted = 1;
    E.setCast([{ k: 'hero', wx: -66, wy: -40, extra: { marks: 0, eyes: 'closed' } }]);
    await E.tell([
      ['n', 'The light does not come through the window. It comes straight through the ceiling: slow, green and completely silent.'],
      ['t', 'This is a dream. In my dreams I can usually fly. …Oh. Apparently I can.']
    ]);
    const c1 = await E.choose({ narr: 'You float. Your feet leave the sheets.', opts: ['Grab the bed frame', 'Reach for your phone', 'Close your eyes'] });
    await E.tell([[c1 === 1 ? 'n' : 'n', ['Your fingers slide off the wood as if it were wet soap.', 'The phone stays behind, glowing. Three unread messages. Then four.', 'Behind your eyelids everything turns green, and then everything is gone.'][c1]], ['t', ['So much for the bed frame.', 'Nobody will believe this. Nobody will even read the message.', 'If I keep my eyes closed, maybe it counts as sleeping.'][c1]]]);
    E.hidePanel();
    E.tween(E.actor('hero'), 'wy', -760, 2.8, 'in');
    G.flash = { t0: E.clock(), up: 2.1, hold: 0.6, down: 1.4 };
    await E.wait(2700);

    /* ---------- 2 · the Kurator ship */
    setScene('ship', {
      feet: 664, maxLift: 200, where: 'Kurator-skibet', g: { progress: 0 },
      cast: [{ k: 'hero', wx: -40, wy: -36, extra: { marks: 0, eyes: 'closed' } },
        { id: 'vex', k: 'kurator', wx: 196, o: { point: 1 }, flip: 1 },
        { id: 'plink', k: 'kurator', wx: 122, o: { small: 1, tablet: 1, robe: '#9fb39a', ph: 1.3 }, flip: 1 }]
    });
    G.view = { x: 64, z: 1 };
    E.mood('ship', { hum: 0.05 });
    await E.wait(1300);
    await E.tell([
      ['n', 'You are standing, but not on anything. A column of light holds you upright. Outside, far below, hangs a small blue planet you used to live on.'],
      ['n', 'You can’t move. You can’t open your eyes. And still, somehow, you see.']
    ]);
    await E.tell([['a:plink', 'Specimen 4471. Human, adult, fully intact. Sleeping nicely.'], ['a:vex', 'Begin the Kernel. I want a power cell by the next orbit.'], ['t', 'They speak English. Polite, precise, faintly bored English. Like a dentist. I knew I should have cancelled.']]);
    E.hidePanel(); E.SFX.heart();
    E.tween(G, 'progress', 41, 4.5, 'lin'); await heroSet('marks', 0.5, 4.5);
    await E.tell([
      ['n', 'Something cold opens in your shoulder, like a flower made of glass. It grows. It has edges.'],
      ['t', 'Not a dream. Dreams don’t itch like broken glass.'],
      ['a:plink', 'Growth at forty-one percent. The Kernel is stable. It’s really very pretty, Vex.'],
      ['a:vex', 'It is a battery, Plink. Batteries are not pretty.']
    ]);
    E.hidePanel(); E.SFX.heart();
    E.tween(G, 'progress', 64, 3, 'lin'); await heroSet('marks', 1, 3);
    G.anomaly = 1; E.SFX.alarm(); E.mood('alarm'); G.glitch = { t0: E.clock(), dur: 1.2 }; G.shake = { t0: E.clock(), dur: 0.8, amp: 0.6 };
    heroSet('eyes', 'open'); heroSet('mouth', 'open');
    await E.tell([['a:plink', 'Wait. Wait, wait, wait. It isn’t growing toward the heart.'], ['a:plink', 'It’s growing along the language centre. Vex… it’s listening.'], ['a:vex', 'Impossible. Show me.']]);
    await E.tell([['t', 'Listening. There is a crystal growing out of my shoulder, and it is listening. I would like to speak to a manager.']]);
    G.glitch = { t0: E.clock(), dur: 2 };
    await E.tell([
      ['n', 'Under the alarm there is a voice. Not the aliens. A woman’s voice, cracked, very far away.'],
      ['d:stemme', 'Du er ikke alene.', 'You are not alone.'],
      ['t', 'I think that was Danish. I don’t speak Danish. And yet, as each word lands, the crystal hums and a meaning floats up behind it. “Du er”: you are. “Ikke”: not. “Alene”… alone. You are not alone. That is either very comforting or very creepy.']
    ]);
    const c2 = await E.choose({ narr: 'The crystal in your shoulder answers the voice with a pulse of light.', opts: ['Try to answer', 'Stay silent', 'Look at the aliens'] });
    await E.tell([['n', ['Your mouth opens. Nothing comes out but light.', 'You hold your breath. The crystal doesn’t. It sings.', 'The tall one is staring at you. For the first time, it looks afraid.'][c2]]]);
    await E.tell([['a:plink', 'Lingual resonance, Vex. The last time we saw this was twenty-two years ago, with Specimen Six. And before that, only in the old moon peop—'], ['a:vex', 'Do not finish that sentence.']]);
    await E.tell([['a:vex', 'Log it as insufficient. Specimen rejected. Wipe its memory.'], ['a:plink', 'Rejected? But it’s the first one since—'], ['a:vex', 'Insufficient, Plink. Drop it somewhere nobody will understand a word it says.'], ['t', 'Insufficient. I’ve had worse report cards. Not many.']]);
    await E.tell([['a:plink', '…Moon Seven, then.'], ['n', 'The small one taps its tablet. Before the floor opens, it leans close and whispers:'], ['a:plink', 'Sorry. Truly. Hold your breath.']]);
    E.hidePanel(); E.SFX.whoosh(); E.mood('fall', { wind: 0.12 });
    G.flash = { t0: E.clock(), up: 0.25, hold: 0.3, down: 1 };
    await E.wait(500);

    /* ---------- 3 · the fall */
    // the same size as everywhere else: a small person, a very large moon
    setScene('fall', { maxLift: 0, where: 'Måne Syv', g: { fallP: 0 }, cast: [{ k: 'hero', x: 195, y: 290, s: 0.56, mid: 60, rot: 2.6, extra: { cast: 1, marks: 1, eyes: 'open', mouth: 'open', ground: '' } }] });
    const fh = E.actor('hero');
    E.tween(G, 'fallP', 0.55, 6, 'lin'); E.tween(fh, 'rot', 3.5, 6);
    await E.tell([
      ['n', 'Wind. Cold. A sky that is green at the edges, cut in half by a ring of light. Below you: a forest the size of a country, and in the middle of it, a lake, rushing up.'],
      ['t', 'Feet first. Feet first. I am a person who takes the lift. I am not built for this.']
    ]);
    const feet = await E.step(() => Gm.qte('Feet first!', 4200, 'The lake is coming.'));
    E.hidePanel();
    E.tween(fh, 'rot', feet ? 0 : 1.5, 0.9);
    E.tween(fh, 'y', 420, 1.6, 'in');
    await E.tween(G, 'fallP', 1, 1.6, 'in');
    // into the water: below the surface she is gone
    fh.clipY = 470; G.splash = { t0: E.clock(), x: 195, y: 470 };
    await E.tween(fh, 'y', 560, 0.3, 'in'); fh.hidden = true;
    E.SFX.splash(); G.flash = { t0: E.clock(), up: 0.08, hold: 0.4, down: 1.6, col: '200,255,235' }; E.mood('silence', { water: 0.05 });
    await E.wait(400);
    await E.tell([['n', feet ? 'You straighten like a needle and go in clean and deep, into water that tastes of metal and mint.' : 'You hit the water like a slammed door. Everything goes white, then green, then very, very quiet.']]);

    /* ---------- 4 · the lake, at night: a big open sky */
    await fadeTo(async () => {
      WLD().enter({ night: true, where: 'Måne Syv · søen', cast: [{ k: 'hero', wx: 130 }, { id: 'lav', k: 'deer', wx: 1060, o: Object.assign({}, A.DEER_NIGHT), alpha: 0 }] });
      E.mood('night', { water: 0.04, crickets: 0.45, wind: 0.02 });
    }, 1.2);
    await E.tell([
      ['n', 'You come up gasping, waist-deep in a black lake. Above you: a ringed planet, an aurora, and that enormous arch of light across the sky.'],
      ['n', 'And you are glowing. Crystal on your shoulder. Lines of light under the skin of your arm. One eye sees the dark in green.'],
      ['t', 'My name is {navn}. That much I know. My job, my street, my own front door: gone, blurred. But I can remember a jingle for washing powder, every single word. Priorities.']
    ]);
    await go({ to: 520, hint: 'Hold ▶ to wade to the shore' });
    E.tween(E.actor('lav'), 'alpha', 1, 1.4); await WLD().walk('lav', 700, 90);
    E.actor('lav').look = 'hero'; cam(610);
    await E.say('lav', 'Ssh. Du lyser.', { en: 'Shh. You are glowing.', pre: 'Something steps out from between the trees: a deer made of moss and bark, with antlers that end in tiny lights.', think: '“Du”: you. That one I have now. “Lyser”… the crystal hums, and I get: light. I’m glowing. A deer is telling me I’m glowing. In Danish. Thank you, deer.' });
    G.drone = { wx: 60, y: 372, len: 300, sweep: 0.4, alert: 0 }; E.SFX.drone(); E.mood('hunt', { water: 0.03, wind: 0.03 });
    E.tween(G.drone, 'wx', 640, 3);
    await E.say('lav', 'En drone! Den kan se lys. Gem dig!', { en: 'A drone! It can see light. Hide!', think: '“Den kan se lys.” It can see light. And I am, at the moment, a lamp. “Gem dig” I don’t know. From his face, it means: do something clever, quickly.' });
    WLD().walk('lav', 905, 150);   // out of the way, beyond the hiding tree
    await E.step(() => Gm.gemDig());
    if (G.drone) E.tween(G.drone, 'sweep', 0.05, 1.5);
    await E.say('lav', 'Du lyser stadig. Sig: mørke.', { en: 'You are still glowing. Say: mørke (darkness).', pre: 'The drone stops right above the shore. Its beam crawls toward the light you are leaking.', think: '“Stadig”: still. I’m still glowing. “Mørke”: dark. Darkness. He wants me to say a word at a drone. Fine. Sure. Why not.' });
    await E.converse({
      who: 'lav', da: 'Sig det: mørke.', en: 'Say it: mørke (darkness).', pool: ['mørke', 'lys', 'lyser', 'mørk', 'du'], ans: 'mørke', noBurst: true,
      hint: 'mørke = darkness. Round your lips for the ø, like the vowel in “bird”.',
      judge: t => /\bm[øo]rke/.test(t) ? { ok: true, who: 'lav', da: '…Godt.', en: '…Good.' } : { ok: false, who: 'lav', da: has(t, 'lys') || has(t, 'lyser') ? 'Nej! Lys er det modsatte. Mørke!' : 'Mørke. Ikke mørk. Mørke!', en: has(t, 'lys') ? 'No! Light is the opposite. Darkness!' : 'Darkness. Not dark. Darkness!' }
    });
    E.SFX.ok(); await E.tween(G, 'glow', 0.15, 2);
    await E.tell([['n', 'The word leaves your mouth, and the light inside you folds itself up like a hand closing. The beam slides over the place where you stand, and finds nothing.'], ['t', 'I said one word and my own body obeyed. At home I can’t make a printer do that.']]);
    E.hidePanel();
    if (G.drone) { E.tween(G.drone, 'y', 160, 3); await E.tween(G.drone, 'wx', 1600, 3.2); } G.drone = null;
    E.mood('night', { water: 0.03, crickets: 0.45, wind: 0.02 });
    await E.say('lav', 'Her er ord magi. Men kun, hvis du forstår dem.', { en: 'Here, words are magic. But only if you understand them.', think: '“Ord”: words. “Magi” is free. Words are magic here, but only if I understand them. Wonderful. My survival depends on vocabulary.' });
    await E.say('lav', 'Jeg hedder Lav. Jeg er en moshjort. Hvad hedder du?', { en: 'My name is Lav. I am a moss deer. What is your name?', think: 'He says his own name, then points his nose at me. Some things don’t need a crystal. My name. Easy. Something I still have.' });
    await E.converse({
      who: 'lav', da: 'Hvad hedder du?', en: 'What is your name?', pool: ['Jeg', 'hedder', '{navn}', 'er', 'du', 'Lav'], ans: 'Jeg hedder {navn}', noBurst: true,
      judge: t => has(t, 'hedder') && !has(t, 'du hedder') && !has(t, 'hedder lav') ? { ok: true, who: 'lav', da: '{navn}. Et mærkeligt navn. Du er ikke herfra.', en: '{navn}. A strange name. You are not from here.', think: '“Mærkeligt”: strange. From a deer made of moss. Fair enough.' } : { ok: false, who: 'lav', da: has(t, 'lav') ? 'Nej, jeg hedder Lav. Og du? Jeg hedder …' : 'Jeg hedder Lav. Og du? Jeg hedder …', en: 'My name is Lav. And you? My name is …' }
    });
    const c3 = await E.choose({ who: 'lav', da: 'Du er fremmed her. Om natten er det farligt.', en: 'You are a stranger here. At night it is dangerous.', opts: ['Where am I?', 'Can you help me?', 'Why do you speak… Danish?'] });
    await E.say('lav', ['Måne Syv. Skoven. Min sø.', 'Måske. Hvis du lærer hurtigt.', 'Det er månens sprog. Og nu er det også dit.'][c3], { en: ['Moon Seven. The forest. My lake.', 'Maybe. If you learn fast.', 'It is the moon’s language. And now it is yours too.'][c3], think: ['Moon Seven. The forest. His lake. Short sentences, slowly, for the new arrival. I appreciate that more than he knows.', 'Maybe, if I learn fast. Nobody has ever described me as fast. Not before coffee.', 'The moon’s language. Danish. Of all the languages in the universe, the moon picked the one with “ø” in it.'][c3] });
    await E.say('lav', 'Kom. Der ligger et gammelt skib i skoven. Der kan du sove. Følg mig.', { en: 'Come. There is an old ship in the forest. You can sleep there. Follow me.', think: '“Skib”: ship. “Sove”: sleep. A ship and a bed. The two best words anyone has said to me tonight.' });
    camFree(); const lav = E.actor('lav'); lav.look = null; lav.follow = 'hero'; lav.gap = -130;
    await E.tell([['t', 'Little lights drift between the trees, and each one has a word inside. If I touch one, I keep the word. Vocabulary, on this moon, is a kind of firefly. Some float high: ▲ jumps.']]);
    await go({ to: X.WRECK_X + 168, hint: 'Follow Lav into the dark forest  ▶', lights: [[900, 60, 'skib', 'ship'], [1120, 150, 'sove', 'sleep'], [1420, 64, 'mørk', 'dark'], [1660, 150, 'gammel', 'old'], [1900, 62, 'minde', 'memory'], [2160, 152, 'krystal', 'crystal']] });
    lav.follow = null; await WLD().walk('lav', X.WRECK_X + 300, 100); lav.look = 'hero'; cam(X.WRECK_X + 120);
    await E.tell([['n', 'In a hollow between the roots lies a ship. A small one, crashed long ago, half eaten by moss. One porthole still glows, as if someone had left a lamp on.']]);
    await E.say('lav', 'Her kan du sove. I morgen taler vi.', { en: 'You can sleep here. Tomorrow we talk.', think: '“I morgen”: tomorrow. He’s giving me the night off. The first kind thing anyone has done for me in two galaxies.' });
    await E.tell([['n', 'You climb through the hatch, lie down on a cot that smells of dust and rain, and are asleep before you can be afraid.']]);

    /* ---------- 5 · inside the wreck, at dawn */
    await fadeTo(async () => {
      WLD().enter({ night: false, where: 'Vraget', cast: [{ k: 'hero', wx: X.WRECK_X - 104 }, { id: 'skib', k: 'skib', wx: X.WRECK_X + 196, wy: -132, alpha: 0 }] });
      G.wreckOpen = 1; cam(X.WRECK_X - 40, 1.3); G.view.x = X.WRECK_X - 40; G.view.z = 1.3;
      E.mood('wreck', { wind: 0.01, birds: 0.25 });
    }, 1.6);
    await E.tell([
      ['n', 'Morning light through small round windows. Notes pinned to the walls. A locker with two letters scratched into its door: **A.L.** In the corner, a dead console that is not quite dead: one green light blinks.'],
      ['t', 'Not a dream, then. I’m on an alien moon, in my pyjamas, in a shipwreck. On the plus side, I am definitely missing the dentist.']
    ]);
    camFree(); G.camZ = 1.3;
    await go({ to: X.WRECK_X + 112, hint: 'Walk to the blinking console  ▶', min: X.WRECK_X - 250, max: X.WRECK_X + 120 });
    cam(X.WRECK_X + 150, 1.3); E.SFX.chime(); await E.tween(E.actor('skib'), 'alpha', 1, 1.2);
    await E.say('skib', 'Bip. God morgen. Jeg er SKIB. Jeg er dette skibs computer.', { en: 'Beep. Good morning. I am SKIB. I am this ship’s computer.', think: '“Skib” again: ship. A ship called Ship. Someone here had a sense of humour once.' });
    await E.say('skib', 'Du er ny. Jeg skal registrere dig. Hvad lavede du, før du kom hertil?', { en: 'You are new. I must register you. What did you do before you came here?', think: '“Lavede”. The crystal hums: did. What did I do before I came here? Easy. Everyone knows that about themselves.' });
    await E.tell([
      ['n', 'You open your mouth to answer, and nothing is there.'],
      ['t', 'My job. I had a job. A street, a bed, a way to get to work. I can see the shapes, not the faces. The tall one said: wipe its memory. They did. Everything except my name, and that jingle.']
    ]);
    await E.say('skib', 'Analyse: Dine minder er låst. Nøglen er datid. Sig dine minder i datid, så kommer de tilbage.', { en: 'Analysis: Your memories are locked. The key is the past tense. Say your memories in the past tense, and they come back.', think: '“Datid”: the crystal says “the past tense”. My memories are locked, and the key is grammar. Of course it is. Nothing on this moon is just a door.' });
    E.mood('wonder', { wind: 0.01 });
    await E.step(() => Gm.teach({
      lab: 'Datid', sub: 'past tense', h: 'Three ways to remember',
      html: `<p>Danish past tense comes in three kinds. SKIB calls it a forge: each verb has its own fire.</p>
        <div class="book"><div><span><b>-ede</b> <span lang="da">${E.fog('lave → lavede, bo → boede')}</span></span><i>soft d</i></div><div><span><b>-te</b> <span lang="da">${E.fog('læse → læste, købe → købte')}</span></span><i>a clean t</i></div><div><span><b>anderledes</b> <span lang="da">${E.fog('gå → gik, være → var, have → havde')}</span></span><i>irregular</i></div></div>
        <p class="hint">There is no rule you can fully trust. Danes learn them by ear, and so will you. If you don't know, tap <b>? Ved ikke</b>: the card comes back later.</p>`
    }));
    await E.step(() => Gm.forgeSort([
      { inf: 'lave', past: 'lavede', g: '1', en: 'make, do' }, { inf: 'arbejde', past: 'arbejdede', g: '1', en: 'work' }, { inf: 'flytte', past: 'flyttede', g: '1', en: 'move house' },
      { inf: 'bo', past: 'boede', g: '1', en: 'live somewhere' }, { inf: 'spille', past: 'spillede', g: '1', en: 'play' }, { inf: 'cykle', past: 'cyklede', g: '1', en: 'cycle' }, { inf: 'studere', past: 'studerede', g: '1', en: 'study' },
      { inf: 'læse', past: 'læste', g: '2', en: 'read; study a subject' }, { inf: 'købe', past: 'købte', g: '2', en: 'buy' }, { inf: 'spise', past: 'spiste', g: '2', en: 'eat' }, { inf: 'rejse', past: 'rejste', g: '2', en: 'travel' }, { inf: 'begynde', past: 'begyndte', g: '2', en: 'begin' },
      { inf: 'gå', past: 'gik', g: 'u', en: 'go, walk' }, { inf: 'have', past: 'havde', g: 'u', en: 'have' }, { inf: 'komme', past: 'kom', g: 'u', en: 'come' }, { inf: 'tage', past: 'tog', g: 'u', en: 'take' }, { inf: 'være', past: 'var', g: 'u', en: 'be' }, { inf: 'gøre', past: 'gjorde', g: 'u', en: 'do' }
    ]));
    await E.say('skib', 'Godt. Nu skal du lytte. I -ede er lyden blød. I -te hører man et t.', { en: 'Good. Now listen. In -ede the sound is soft. In -te you hear a t.', think: 'A computer is teaching me pronunciation. It doesn’t even have a mouth. It has a wavy line.' });
    await E.step(() => Gm.earTest([{ w: 'lavede', g: '1' }, { w: 'læste', g: '2' }, { w: 'boede', g: '1' }, { w: 'købte', g: '2' }, { w: 'spillede', g: '1' }, { w: 'spiste', g: '2' }, { w: 'flyttede', g: '1' }, { w: 'rejste', g: '2' }]));
    E.mood('wreck', { wind: 0.01, birds: 0.2 });

    // memory 1 · the job
    await E.say('skib', 'Nu dine egne minder. Hvad lavede du, før du kom hertil?', { en: 'Now your own memories. What did you do before you came here?' });
    await E.step(() => Gm.teach({ lab: 'Job', sub: 'no article', h: 'Jobs have no “a”', html: `<p>In Danish a job stands alone, without <b lang="da">${E.fog('en')}</b> or <b lang="da">${E.fog('et')}</b>:</p><div class="book"><div><span lang="da">${E.fog('Jeg var lærer.')}</span><i>I was a teacher.</i></div><div><span lang="da">${E.fog('Jeg arbejdede som kok.')}</span><i>I worked as a cook.</i></div></div><p class="hint">Never <s>Jeg var en lærer</s>.</p>` }));
    const job = await E.step(() => Gm.pickOne({ lab: 'Hukommelse', sub: 'memory · job', h: 'What were you, before?', hint: 'Choose a shard of memory, or write your own job in Danish.', opts: JOBS, own: 'Another job (in Danish)…', ownMake: v => ({ da: v.toLowerCase(), en: v, m: 'Your work. Your hands knew it better than your head does now.', own: 1 }) }));
    mem().job = job; E.save();
    const st = job.da === 'studerende';
    await E.converse({
      who: 'skib', da: 'Hvad lavede du, før du kom hertil?', en: 'What did you do before you came here?',
      pool: st ? ['Jeg', 'var', 'er', 'en', 'studerende', 'som', 'studerer'] : ['Jeg', 'arbejdede', 'arbejder', 'som', 'en', job.da, 'var', 'er'], ans: st ? 'Jeg var studerende' : 'Jeg arbejdede som ' + job.da,
      hint: 'Past tense, and no article: Jeg arbejdede som … / Jeg var …',
      judge: t => {
        if (has(t, 'arbejder') || has(t, 'studerer') || has(t, 'er') && !has(t, 'var')) return { ok: false, who: 'skib', da: 'Nu? Nej. Før. Datid.', en: 'Now? No. Before. Past tense.', fb: 'It is a memory, so it needs the past tense: **arbejdede**, **var**.', think: 'Present tense. I just told a computer what I do now, on a moon, in pyjamas. Nothing.' };
        if (has(t, 'som en') || has(t, 'var en') || has(t, 'som et') || has(t, 'var et')) return { ok: false, who: 'skib', da: 'Fejl. Et job har ingen artikel.', en: 'Error. A job has no article.', fb: 'No **en** before a job: Jeg var lærer, Jeg arbejdede som kok.' };
        if (has(t, 'var som')) return { ok: false, who: 'skib', da: 'Var som? Nej. Jeg var … eller: Jeg arbejdede som …', en: 'Was as? No. I was … or: I worked as …' };
        if (has(t, 'arbejdede som') || has(t, 'var') || has(t, 'læste') || has(t, 'studerede')) return { ok: true, who: 'skib', da: `Registreret: ${job.da}. Minde åbnet.`, en: `Registered: ${job.en}. Memory unlocked.`, word: st ? 'var' : 'arbejdede', think: 'Something clicks in my shoulder, like a key in a lock.' };
        return { ok: false, who: 'skib', da: 'Jeg forstår ikke. Jeg arbejdede som …?', en: 'I don’t understand. I worked as …?' };
      }
    });
    await E.tell([['m', job.m]]);

    // memory 2 · where you worked: i or på
    await E.say('skib', 'Spørgsmål to: Hvor arbejdede du? Pas på: i eller på.', { en: 'Question two: Where did you work? Careful: i or på.', think: '“I” or “på”. The two smallest words in Danish, and they already look like trouble. The computer knows. Of course it knows.' });
    await E.step(() => Gm.teach({ lab: 'i eller på', sub: 'in or at', h: 'Small words, big trouble', html: `<p><b lang="da">${E.fog('i')}</b> for cities, countries, and most companies and shops: <span lang="da">${E.fog('i Berlin, i Tyskland, i et firma, i en bank')}</span>.</p><p><b lang="da">${E.fog('på')}</b> for islands and for many institutions: <span lang="da">${E.fog('på Island, på Fyn, på et hospital, på en skole, på et universitet')}</span>.</p><p class="hint">There is logic, and there are habits. Learn them in pairs.</p>` }));
    await E.step(() => Gm.prepSort([
      { w: 'et hospital', p: 'på', en: 'a hospital', why: 'på et hospital: an institution.' }, { w: 'et firma', p: 'i', en: 'a company', why: 'i et firma.' }, { w: 'en skole', p: 'på', en: 'a school', why: 'på en skole.' },
      { w: 'en bank', p: 'i', en: 'a bank', why: 'i en bank.' }, { w: 'Lissabon', p: 'i', en: 'Lisbon', ctx: 'Jeg boede ___', why: 'Cities take i.' }, { w: 'Island', p: 'på', en: 'Iceland', ctx: 'Jeg boede ___', why: 'Islands take på, and Iceland is an island.' },
      { w: 'et universitet', p: 'på', en: 'a university', why: 'på et universitet.' }, { w: 'en butik', p: 'i', en: 'a shop', why: 'i en butik.' }, { w: 'Tyskland', p: 'i', en: 'Germany', ctx: 'Jeg boede ___', why: 'Countries take i.' }, { w: 'Bornholm', p: 'på', en: 'a Danish island', ctx: 'Jeg boede ___', why: 'Islands take på.' }
    ]));
    const work = await E.step(() => Gm.pickOne({ lab: 'Hukommelse', sub: 'memory · workplace', h: 'Where did you work?', opts: WORK }));
    mem().work = work; E.save();
    const ww = work.w.split(' ');
    await E.converse({
      who: 'skib', da: 'Hvor arbejdede du?', en: 'Where did you work?', pool: ['Jeg', 'arbejdede', 'arbejder', 'i', 'på', ...ww, ww.length > 1 ? (ww[0] === 'en' ? 'et' : 'en') : 'ude'], ans: 'Jeg arbejdede ' + work.da,
      hint: `Jeg arbejdede ${work.da}.`,
      judge: t => {
        if (has(t, 'arbejder')) return { ok: false, who: 'skib', da: 'Datid, tak.', en: 'Past tense, please.' };
        if (work.p && !has(t, work.p + ' ' + work.w)) { const wrong = work.p === 'i' ? 'på' : 'i'; return { ok: false, who: 'skib', da: has(t, wrong + ' ' + work.w) ? `Ikke ${wrong}. Prøv det andet ord.` : 'Hvor? Sig hele sætningen.', en: has(t, wrong + ' ' + work.w) ? `Not ${wrong}. Try the other little word.` : 'Where? Say the whole sentence.' }; }
        if (!work.p && !has(t, 'hjemme')) return { ok: false, who: 'skib', da: 'Hvor? Hjemme?', en: 'Where? At home?' };
        if (has(t, 'arbejdede')) return { ok: true, who: 'skib', da: 'Registreret.', en: 'Registered.', word: work.p || 'hjemme' };
        return { ok: false, who: 'skib', da: 'Jeg arbejdede … hvor?', en: 'I worked … where?' };
      }
    });
    await E.tell([['m', work.p ? `A door you opened every morning. A smell you would know anywhere. The ${work.en.replace(/^(at|in) (a|an) /, '')} where you spent half your life.` : 'A desk by the window at home, a mug going cold, the neighbour’s dog barking at exactly ten every day.']]);

    // memory 3 · where you lived
    const city = await E.step(() => Gm.pickOne({ lab: 'Hukommelse', sub: 'memory · home', h: 'Where did you live?', hint: 'Choose, or write your own town. Islands take <b>på</b>, everything else <b>i</b>.', opts: CITIES.map(c => Object.assign({}, c, { en: c.en || '' })), own: 'Another town or country…', ownMake: v => ({ da: v.charAt(0).toUpperCase() + v.slice(1), p: '', own: 1 }) }));
    mem().city = city; E.save();
    const cp = city.p || 'i';
    await E.converse({
      who: 'skib', da: 'Spørgsmål tre: Hvor boede du?', en: 'Question three: Where did you live?', pool: ['Jeg', 'boede', 'bor', 'i', 'på', 'til', city.da], ans: `Jeg boede ${cp} ${city.da}`,
      hint: `Jeg boede ${cp} ${city.da}.`,
      judge: t => {
        if (has(t, 'bor')) return { ok: false, who: 'skib', da: 'Bor? Nu bor du i et vrag. Datid: boede.', en: 'Live? Right now you live in a wreck. Past tense: boede.', think: 'Fair. Rude, but fair.' };
        if (!has(t, 'boede')) return { ok: false, who: 'skib', da: 'Jeg boede …?', en: 'I lived …?' };
        if (has(t, 'til')) return { ok: false, who: 'skib', da: 'Til? Man flytter til en by. Man bor i en by.', en: 'Til? You move to a town. You live in a town.' };
        if (!city.own && !has(t, cp)) return { ok: false, who: 'skib', da: cp === 'på' ? 'En ø. Så hedder det på.' : 'En by eller et land: i.', en: cp === 'på' ? 'An island. So it’s på.' : 'A town or a country: i.' };
        return { ok: true, who: 'skib', da: `Registreret: ${cp} ${city.da}.`, en: `Registered: ${cp} ${city.da}.`, word: 'boede' };
      }
    });
    await E.tell([['m', `A street in ${city.da}. Your window. The neighbour’s radio through the wall. It hurts how ordinary it was.`]]);

    // memory 4 · free time
    const hob = await E.step(() => Gm.pickOne({ lab: 'Hukommelse', sub: 'memory · free time', h: 'What did you do in your free time?', opts: HOBBY }));
    mem().hobby = hob; E.save();
    const hv = hob.da.split(' ');
    await E.converse({
      who: 'skib', da: 'Spørgsmål fire: Hvad lavede du i din fritid?', en: 'Question four: What did you do in your free time?', pool: ['Jeg', ...hv, hob.pres, 'har', 'min'], ans: 'Jeg ' + hob.da,
      hint: `Jeg ${hob.da}.`,
      judge: t => has(t, hob.pres) && !has(t, hv[0]) ? { ok: false, who: 'skib', da: 'Det var før. Datid.', en: 'That was before. Past tense.' } : has(t, hv[0]) ? { ok: true, who: 'skib', da: 'Registreret. Interessant.', en: 'Registered. Interesting.', word: hv[0], think: 'It said “interesting” in the voice people use for “not interesting”.' } : { ok: false, who: 'skib', da: 'I din fritid. Jeg …', en: 'In your free time. I …' }
    });
    await E.tell([['m', hob.m]]);

    // memory 5 · the way to work
    const tr = await E.step(() => Gm.pickOne({ lab: 'Hukommelse', sub: 'memory · the way to work', h: 'How did you get to work?', opts: TRANS }));
    mem().trans = tr; E.save();
    const tv = tr.da.split(' ');
    await E.converse({
      who: 'skib', da: 'Sidste spørgsmål: Hvordan kom du på arbejde?', en: 'Last question: How did you get to work?', pool: ['Jeg', ...tv, tr.pres, 'med', 'kom'], ans: 'Jeg ' + tr.da,
      hint: `Jeg ${tr.da}.`,
      judge: t => has(t, tr.pres) && !has(t, tv[0]) ? { ok: false, who: 'skib', da: 'Datid, tak. Det er sidste gang, jeg siger det. Måske.', en: 'Past tense, please. This is the last time I say it. Maybe.' } : has(t, tv[0]) ? { ok: true, who: 'skib', da: 'Registreret.', en: 'Registered.', word: tv[0] } : { ok: false, who: 'skib', da: 'Hvordan? Jeg …', en: 'How? I …' }
    });
    await E.tell([['m', `Every morning, ${tr.m}. You used to complain about it. You would give anything for it now.`]]);
    E.castAnim('minder');
    await E.say('skib', `Registrering færdig. Før {hun} kom hertil, ${jobLine('{hun}', true)}. {Hun} boede ${cityP()}. Velkommen, {navn}.`, { en: `Registration complete. Before {she} came here, {she} ${st ? 'was a student' : 'worked as ' + (/^[aeiou]/i.test(job.en) ? 'an ' : 'a ') + job.en}. {She} lived in ${city.da}. Welcome, {navn}.`, pre: 'The shards settle. Not everything is back, but enough. You remember who you were.', think: '“Før {hun} kom hertil, ' + (st ? 'var' : 'arbejdede') + ' {hun}…” The verb jumped in front of “{hun}”. Interesting. I’ll keep an eye on that.' });

    /* ---------- 6 · Seks's log, the coat */
    await E.say('skib', 'Du er nummer to. Den første var Seks.', { en: 'You are number two. The first was Six.', think: '“Seks” is six. Specimen Six. The small alien said that name, twenty-two years ago, give or take.' });
    await E.say('skib', 'Hun skrev en log. Vil du læse den?', { en: 'She wrote a log. Do you want to read it?', think: 'Reading. In Danish. Without a dictionary. Yes. No. Yes.' });
    await E.step(() => Gm.readLog({
      lab: 'Seks’ log', title: 'Log 1', who: 'asta',
      text: 'Jeg hedder Asta Lund. Før de tog mig, boede jeg i Bergen. Jeg var geolog, og jeg arbejdede på et universitet. Jeg elskede sten og krystaller.\nIronisk, ikke? Nu har jeg en krystal i skulderen.\nDe ville skære krystallen ud af mig. Så jeg stjal et af deres små skibe.',
      qs: [
        { q: 'What was Asta’s job?', opts: ['Geologist', 'Pilot', 'Teacher'], a: 0, why: 'Jeg var geolog. No article with jobs.' },
        { q: 'Hvor boede Asta?', da: 1, opts: ['i Bergen', 'på et universitet', 'i skibet'], a: 0, why: 'Før de tog mig, boede jeg i Bergen. Look: after the før-sentence, the verb boede comes before jeg.' },
        { q: 'Why did she steal a ship?', opts: ['They wanted to cut the crystal out of her', 'She wanted to see Bergen again', 'She was bored'], a: 0, why: 'De ville skære krystallen ud af mig.' }
      ]
    }));
    await E.say('skib', 'Bip. Det var mig. Jeg var det lille skib.', { en: 'Beep. That was me. I was the small ship.', think: 'The computer is proud of having been stolen. I think I like it.' });
    await E.step(() => Gm.readLog({
      lab: 'Seks’ log', title: 'Log 2', who: 'asta',
      text: 'Jeg styrtede ned i skoven på grund af en drone. Skibet kan ikke flyve mere, men det kan tale. Jeg kalder det SKIB.\nJeg lærte det dansk, fordi jeg ikke ville være alene. Det lærte hurtigt. Det lærte også at sige bip.\nOm natten gemmer jeg mig. Dronerne kan se alt, der lyser.',
      qs: [
        { q: 'Why did Asta crash?', opts: ['Because of a drone', 'Because she couldn’t fly', 'Because SKIB said beep'], a: 0, why: 'på grund af en drone: på grund af + a thing.' },
        { q: 'Why did she teach SKIB Danish?', opts: ['Because she didn’t want to be alone', 'To fly the ship again', 'Because of the drones'], a: 0, why: 'fordi jeg ikke ville være alene. Inside a fordi-sentence, ikke comes before the verb.' },
        { q: 'Skibet kan flyve.', da: 1, opts: ['Rigtigt', 'Forkert'], a: 1, why: 'Skibet kan ikke flyve mere.' }
      ]
    }));
    await E.step(() => Gm.readLog({
      lab: 'Seks’ log', title: 'Log 3', who: 'asta',
      text: 'En gammel moshjort lærte mig sproget. Han var sarkastisk og meget klog.\nOrd er magi her, men kun når man forstår dem. Jeg lærte dansk for at overleve. Nu lærer jeg det for at leve.\nJeg har en datter nu. Hun er stærk og stædig, ligesom sin mor.\nHvis du læser dette, så tag min frakke. Den skjuler lyset om natten.\nDronerne er her. Jeg gemmer loggen. Hvis jeg ikke kommer tilbage —',
      qs: [
        { q: 'Who taught Asta the language?', opts: ['An old moss deer', 'SKIB', 'Her daughter'], a: 0, why: 'En gammel moshjort lærte mig sproget.' },
        { q: 'Hvorfor lærte Asta dansk i begyndelsen?', da: 1, opts: ['for at overleve', 'på grund af sin datter', 'fordi hun var geolog'], a: 0, why: 'Jeg lærte dansk for at overleve. for at + a verb.' },
        { q: 'What does the coat do?', opts: ['It hides the light at night', 'It keeps her warm', 'It lets her fly'], a: 0, why: 'Den skjuler lyset om natten.' }
      ]
    }));
    await E.tell([['t', 'An old moss deer. Sarcastic and very clever.'], ['t', '…Lav. Of course. He has done this before.'], ['n', 'The log ends in static. SKIB’s face flickers.'], ['d:skib', 'Hun kom ikke tilbage. Det er fem år siden.', 'She did not come back. That was five years ago.']]);
    E.hidePanel(); E.SFX.door(); E.tween(G, 'locker', 1, 1.6);
    await E.tell([['n', 'Behind you, the locker clicks open by itself.']]);
    camFree(); G.camZ = 1.3;
    await go({ to: X.WRECK_X - 196, hint: '◀ Walk back to the locker', min: X.WRECK_X - 200, max: X.WRECK_X + 150 });
    cam(X.WRECK_X - 160, 1.3);
    const c4 = await E.choose({ narr: 'Inside hangs a long brown coat with a teal lining. The hem shimmers faintly, like moss after rain.', opts: ['Put it on', 'Leave it. It’s hers.'] });
    if (c4 === 1) await E.tell([['n', 'You close your hand without touching it. Then you think about the beam, the drone, the light burning under your skin. You take it down.'], ['t', 'Sorry, Asta. I’ll give it back. If I can.']]);
    s.day = 1; G.coatTaken = 1; E.refreshHero(); E.save(); E.SFX.chime(); E.castAnim();
    await E.tell([['n', 'It fits as if it had been waiting for you. Stitched inside the collar, in faded thread: **A.L.**'], ['t', 'Asta Lund. Geologist. Thief of spaceships. Thank you.']]);

    /* ---------- 7 · out into the morning, through the woods */
    camFree(); G.camZ = 1.3;
    await go({ to: X.WRECK_X + 236, hint: 'Walk out through the hatch  ▶', min: X.WRECK_X - 240, max: X.WRECK_X + 240 });
    E.hidePanel(); E.tween(G, 'wreckOpen', 0, 1.2); E.tween(E.actor('skib'), 'alpha', 0, 0.6); G.camZ = null;
    G.cast.push({ id: 'lav', k: 'deer', wx: X.WRECK_X + 430, o: Object.assign({}, A.DEER_DAY), look: 'hero' });
    await WLD().walk('hero', X.WRECK_X + 330, 110);
    E.mood('dawn', { birds: 0.6, wind: 0.02 }); cam(X.WRECK_X + 370);
    await E.tell([['n', 'Outside, the night has turned into a morning so green it almost hurts. Birds that sound like glass bells. Light running up the tree trunks like sap.']]);
    await E.say('lav', 'Den frakke har jeg set før.', { en: 'I have seen that coat before.', pre: 'Lav is waiting by the hatch, chewing something. He looks at the coat for a long time.', think: '“Set”: seen. He has seen this coat before. He says it like someone who has found an old letter.' });
    const c5 = await E.choose({ narr: 'He knew her. Of course he knew her.', opts: ['You taught her. Asta.', 'Say nothing'] });
    await E.say('lav', c5 ? 'Kom. Kronby ligger bag kløften.' : 'Hun var min bedste elev. Og min værste. Kom. Kronby ligger bag kløften.', { en: c5 ? 'Come. Kronby lies beyond the ravine.' : 'She was my best student. And my worst. Come. Kronby lies beyond the ravine.', think: c5 ? '“Kløften”. I don’t know that one. It sounds like something you fall into.' : 'Best and worst. I am going to be compared to her. I can feel it already.' });
    camFree(); const lav2 = E.actor('lav'); lav2.look = null; lav2.follow = 'hero'; lav2.gap = 120;
    E.mood('forest', { birds: 0.55, wind: 0.02 });
    await go({ to: X.PYLON_X - 120, hint: 'Walk through the woods  ▶', lights: [[X.WRECK_X + 560, 62, 'nøgle', 'key'], [X.WRECK_X + 820, 150, 'lås', 'lock'], [X.WRECK_X + 1080, 60, 'grund', 'reason'], [X.WRECK_X + 1340, 152, 'hjælp', 'help'], [X.WRECK_X + 1600, 62, 'sti', 'path']] });

    /* ---------- 8 · the pylon on the meadow */
    lav2.follow = null; await WLD().walk('lav', X.PYLON_X - 270, 120); lav2.look = 'hero'; cam(X.PYLON_X - 110);
    await E.tell([
      ['n', 'The trees open onto a meadow, and suddenly there is sky everywhere. In the middle of the path stands a stone pylon, taller than a house, with three dark sockets: a circle, a triangle, a square.'],
      ['n', 'A wall of light hums across the path. When you reach out, it pushes your hand back, politely but firmly.']
    ]);
    await E.say('lav', 'Pylonen lukker stien. Den åbner kun, hvis du kan sige hvorfor.', { en: 'The pylon closes the path. It only opens if you can say why.', think: '“Hvorfor”: why. The rock wants a reason. Everyone on this moon wants a reason from me. Nobody asked the aliens.' });
    await E.say('lav', 'Tre låse. Tre nøgler: på grund af, for at, fordi.', { en: 'Three locks. Three keys: because of, in order to, because.', think: 'Three ways to say “because”. Danish could have managed with one. It chose not to.' });
    await E.step(() => Gm.teach({
      lab: 'Tre nøgler', sub: 'three keys', h: 'Three ways to say why',
      html: `<div class="book">
        <div><span><b>○ <span lang="da">${E.fog('på grund af')}</span></b> + a thing</span><i lang="da">${E.fog('Asta styrtede ned på grund af en drone.')}</i></div>
        <div><span><b>△ <span lang="da">${E.fog('for at')}</span></b> + a verb</span><i lang="da">${E.fog('Hun lærte dansk for at overleve.')}</i></div>
        <div><span><b>□ <span lang="da">${E.fog('fordi')}</span></b> + a whole sentence</span><i lang="da">${E.fog('Hun lærte SKIB dansk, fordi hun ikke ville være alene.')}</i></div></div>
        <p class="hint">Look at what comes right after the gap. A thing? A verb? Or someone doing something?</p>`
    }));
    await E.step(() => Gm.threeKeys(Gm.shuffle([
      { a: 'Jeg faldt i søen', b: 'to aliens.', k: 'pga', en: 'I fell into the lake because of two aliens.', why: 'to aliens is a thing (who did it), not a sentence.' },
      { a: 'Lav gemte mig bag et træ', b: 'redde mig.', k: 'fa', en: 'Lav hid me behind a tree to save me.', why: 'redde is a verb: for at redde.' },
      { a: 'Jeg lyste om natten,', b: 'min krystal var vågen.', k: 'fd', en: 'I glowed at night because my crystal was awake.', why: 'min krystal var vågen is a whole sentence: subject + verb.' },
      { a: 'Stien er lukket', b: 'dronerne.', k: 'pga', en: 'The path is closed because of the drones.', why: 'dronerne is a thing.' },
      { a: 'Jeg skal til Kronby', b: 'finde hjælp.', k: 'fa', en: 'I have to go to Kronby to find help.', why: 'finde is a verb.' },
      { a: 'Jeg tog frakken,', b: 'den skjuler lyset.', k: 'fd', en: 'I took the coat because it hides the light.', why: 'den skjuler lyset: subject + verb.' },
      { a: 'Jeg kan ikke huske mit liv', b: 'krystallen.', k: 'pga', en: 'I can’t remember my life because of the crystal.', why: 'krystallen is a thing.' },
      { a: 'Lav taler kun dansk,', b: 'han ikke kan lide engelsk.', k: 'fd', en: 'Lav only speaks Danish because he doesn’t like English.', why: 'A whole sentence. And look: ikke stands before kan.' },
      { a: 'Asta stjal et skib', b: 'flygte.', k: 'fa', en: 'Asta stole a ship to escape.', why: 'flygte is a verb.' }
    ])));
    await E.tell([['t', '“På grund af” takes a thing. “For at” takes a verb. “Fordi” takes a whole little sentence. Three kinds of glue. I am seeing a pattern, and I am not sure I like it.']]);
    await E.say('lav', 'Nu din egen nøgle. Pylonen spørger: Hvorfor kom du hertil?', { en: 'Now your own key. The pylon asks: Why did you come here?' });
    await E.converse({
      who: 'lav', da: 'Hvorfor kom du hertil?', en: 'Why did you come here?',
      pool: ['Jeg', 'kom', 'hertil', 'på grund af', 'to aliens', 'for at', 'finde', 'hjælp', 'fordi', 'de', 'smed', 'mig', 'ud', 'at'], ans: 'Jeg kom hertil på grund af to aliens',
      hint: 'Use one key: på grund af + a thing, for at + a verb, or fordi + a sentence.',
      judge: t => {
        const r = reason(t);
        if (r.ok) return { ok: true, tag: r.ok, who: 'lav', da: { pga: 'På grund af aliens. Ja. Det siger alle, der falder ned fra himlen.', fa: 'For at finde hjælp. Så er du kommet til den forkerte hjort.', fd: 'Fordi de smed dig ud. Ærligt. Det kan jeg lide.' }[r.ok], en: { pga: 'Because of aliens. Yes. Everyone who falls from the sky says that.', fa: 'To find help. Then you came to the wrong deer.', fd: 'Because they threw you out. Honest. I like that.' }[r.ok], word: { pga: 'på grund af', fa: 'for at', fd: 'fordi' }[r.ok] };
        if (r.bad) return { ok: false, who: 'lav', da: 'Låsen gnister.', en: 'The lock sparks.', fb: r.bad };
        return { ok: false, who: 'lav', da: 'Hvorfor? Brug en nøgle.', en: 'Why? Use a key.', fb: 'Use på grund af, for at or fordi.' };
      }
    });
    G.locks = [1, 1, 1]; E.SFX.door(); E.hidePanel(); await E.tween(G, 'pylonOpen', 1, 2.4);
    await E.tell([['n', 'The three sockets blaze. With a sound like a giant clearing its throat, the pylon sinks into the moss, and the wall of light goes out.'], ['t', 'I gave a reason to a rock, and the rock moved. My landlord could learn from this.']]);

    /* ---------- 9 · the warden */
    camFree(); lav2.look = null; lav2.follow = 'hero'; lav2.gap = 120;
    await go({ to: 5040, hint: 'Follow the path  ▶', lights: [[X.PYLON_X + 160, 62, 'fremmed', 'stranger'], [X.PYLON_X + 360, 150, 'hvorfor', 'why'], [X.PYLON_X + 560, 62, 'før', 'before']] });
    lav2.follow = null; WLD().walk('lav', 4950, 110).then(() => { lav2.look = 'hero'; });
    G.cast.push({ id: 'birk', k: 'npc', wx: 5420, o: Object.assign({}, A.NPC.birk), flip: 1, look: 'hero' });
    E.mood('tense', { wind: 0.02 }); E.SFX.clang(); cam(5110, 0.9);
    await WLD().walk('birk', 5190, 260);
    await E.say('birk', 'Stop! Hvem er du? Fremmede bringer droner.', { en: 'Stop! Who are you? Strangers bring drones.', pre: 'Someone in bronze armour comes running down the path and stops the glowing tip of a spear a hand’s width from your chest.', think: '“Fremmede”: strangers. “Droner”: drones. Strangers bring drones. Fair. I did bring one, sort of.' });
    await E.say('lav', 'Ro på, Birk. {Hun} er med mig.', { en: 'Easy, Birk. {She} is with me.', think: '“Ro på.” The crystal doesn’t even bother. It sounds like “calm down” in every language I know.' });
    await E.say('birk', 'Med dig? Du hjælper aldrig nogen, Lav.', { en: 'With you? You never help anyone, Lav.' });
    await E.say('lav', 'Jeg hjælper. Jeg er bare sarkastisk imens.', { en: 'I help. I’m just sarcastic while I do it.', think: 'I understood “sarkastisk”. Some words are the same everywhere. Sarcasm, for example.' });
    await E.converse({
      who: 'birk', da: 'Hvad lavede du, før du kom hertil?', en: 'What did you do before you came here?',
      pool: st ? ['Jeg', 'var', 'er', 'studerende', cp, city.da, 'en', 'som'] : ['Jeg', 'arbejdede', 'arbejder', 'som', job.da, cp, city.da, 'en', 'var'], ans: st ? `Jeg var studerende ${cp} ${city.da}` : `Jeg arbejdede som ${job.da} ${cp} ${city.da}`,
      hint: 'Past tense, like with SKIB: Jeg arbejdede som … / Jeg var …',
      judge: t => {
        if (has(t, 'som en') || has(t, 'var en')) return { ok: false, who: 'birk', da: 'En? Et job har ingen artikel her.', en: 'A? A job has no article here.' };
        return (has(t, 'arbejdede') || has(t, 'var') || has(t, 'læste') || has(t, 'studerede') || has(t, 'boede')) && !has(t, 'arbejder') ? { ok: true, who: 'birk', da: 'Hm. Det lyder spændende. Men det hjælper dig ikke her.', en: 'Hm. That sounds exciting. But it doesn’t help you here.', word: 'før', think: '“Det lyder spændende.” That sounds exciting. People say that when it doesn’t.' } : { ok: false, who: 'birk', da: 'Før. Jeg spurgte om før.', en: 'Before. I asked about before.', fb: 'Past tense: arbejdede, var, boede.' };
      }
    });
    await E.converse({
      who: 'birk', da: 'Og hvorfor kom du hertil?', en: 'And why did you come here?',
      pool: ['Jeg', 'kom', 'hertil', 'fordi', 'for at', 'på grund af', 'Kuratorerne', 'de', 'smed', 'mig', 'ud', 'finde', 'hjælp', 'at'], ans: 'Jeg kom hertil på grund af Kuratorerne',
      hint: 'Any of the three keys works.',
      judge: t => { const r = reason(t); return r.ok ? { ok: true, who: 'birk', da: 'Hm. Alle fremmede har en grund.', en: 'Hm. All strangers have a reason.', word: { pga: 'på grund af', fa: 'for at', fd: 'fordi' }[r.ok] } : { ok: false, who: 'birk', da: 'Det er ikke en grund.', en: 'That is not a reason.', fb: r.bad || 'Use på grund af, for at or fordi.' }; }
    });
    await E.step(() => Gm.teach({ lab: 'fordi', sub: 'word order', h: 'Inside fordi, ikke jumps forward', html: `<p>In a normal sentence, <b lang="da">${E.fog('ikke')}</b> and <b lang="da">${E.fog('gerne')}</b> come after the verb:</p><p lang="da">${E.fog('Jeg kan ikke finde vej. Jeg vil gerne lære dansk.')}</p><p>Inside a <b lang="da">${E.fog('fordi')}</b>-sentence they jump in front of it:</p><p lang="da">${E.fog('…, fordi jeg ikke kan finde vej. …, fordi jeg gerne vil lære dansk.')}</p>` }));
    for (let n = 0; ; n++) {
      const c = await E.choose({ who: 'birk', da: 'Hvorfor skal jeg hjælpe dig?', en: 'Why should I help you?', da_opts: true, shuffle: true, opts: ['Fordi jeg ikke kan finde vej.', 'Fordi jeg vil gerne lære dansk.', 'Fordi jeg kan ikke finde vej.', 'Fordi jeg gerne vil lære dansk.', 'Fordi kan jeg ikke finde vej.'] });
      if (c === 0 || c === 3) { E.gainPower(n ? 1 : 3); await E.say('birk', 'Hm. Godt sagt. Jeg er Birk. Jeg passer på skoven.', { en: 'Hm. Well said. I am Birk. I look after the forest.', think: '“Godt sagt”: well said. A compliment from a woman with a spear. It counts double.' }); break; }
      E.SFX.bad();
      await E.say('birk', n >= 2 ? 'Har du sand i ørerne? Sig: Fordi jeg ikke kan finde vej.' : 'Du taler som en drone. I en fordi-sætning står ikke og gerne før verbet.', { en: n >= 2 ? 'Do you have sand in your ears? Say: Because I can’t find the way.' : 'You talk like a drone. In a fordi-sentence, ikke and gerne stand before the verb.', think: n >= 2 ? 'Sand in my ears. I’ll remember that one. For later. For her.' : 'I talk like a drone. That is the second insult today from someone holding a weapon.' });
    }
    await E.say('birk', 'Vent. Den frakke … Hvor har du den fra?', { en: 'Wait. That coat … Where did you get it?', pre: 'Her eyes drop to the coat. Something changes in her face.' });
    G.drone = { wx: 5600, y: 340, len: 300, sweep: 0.4, alert: 1 }; E.SFX.found(); E.mood('hunt', { wind: 0.03 }); G.shake = { t0: E.clock(), dur: 0.5 };
    E.tween(G.drone, 'wx', 5260, 1.2);
    await E.say('birk', 'Dronen! Den har set os. Jeg leder den væk. Løb til broen!', { en: 'The drone! It has seen us. I’ll lead it away. Run to the bridge!', think: '“Løb” I know from the lake. Run. I am getting very good at that one.' });
    E.hidePanel(); const birk = E.actor('birk'); birk.look = null; lav2.look = null;
    WLD().walk('birk', 5900, 300).then(() => { birk.hidden = true; }); E.tween(G.drone, 'wx', 6300, 2.4, 'in').then(() => { G.drone = null; });
    camFree(); lav2.follow = 'hero'; lav2.gap = 120;
    WLD().WD.speed = 230;
    await go({ to: X.RAV0 - 26, hint: 'Run to the ravine!  ▶' });
    WLD().WD.speed = 150; G.drone = null;

    /* ---------- 10 · the mirror bridge over the ravine */
    lav2.follow = null; cam((X.RAV0 + X.RAV1) / 2, 0.8); E.mood('tense', { wind: 0.06 });
    await E.tell([['n', 'The path ends at a ravine. Far below runs a river of light. Across it: nothing. No bridge. Only a shimmer in the air, like heat over a summer road.'], ['t', '“Kløften.” Something you fall into. I was right.']]);
    E.hidePanel(); lav2.autoFlip = false; lav2.flip = true;
    E.tween(lav2, 'wy', -120, 0.6, 'out').then(() => E.tween(lav2, 'wy', 0, 0.6, 'in')); await E.tween(lav2, 'wx', X.RAV1 + 60, 1.2, 'lin'); lav2.flip = false; lav2.autoFlip = true; lav2.look = 'hero';
    await E.say('lav', 'Her er broen. Du kan ikke se den. Den kommer, når ordene står rigtigt.', { en: 'Here is the bridge. You can’t see it. It comes when the words stand right.', pre: 'Lav jumps. He lands on the far side as if the gap were nothing.', think: 'A bridge made of word order. Not wood, not rope: grammar. I might just weep.' });
    await E.step(() => Gm.teach({
      lab: 'Spejlbroen', sub: 'word order', h: 'Where does the verb stand?',
      html: `<div class="book">
        <div><span lang="da">${E.fog('Jeg kan ikke flyve.')}</span><i>normal: subject, verb, ikke</i></div>
        <div><span lang="da">${E.fog('…, fordi jeg ikke kan flyve.')}</span><i>fordi: ikke / gerne before the verb</i></div>
        <div><span lang="da">${E.fog('Før jeg kom hertil, boede jeg ' + cityP() + '.')}</span><i>a før-sentence first: verb, then subject</i></div>
        <div><span lang="da">${E.fog('…, men jeg kan ikke flyve.')}</span><i>men, så, for: nothing changes</i></div></div>`
    }));
    const jobW = st ? ['var', 'jeg', 'studerende'] : ['arbejdede', 'jeg', 'som', job.da];
    await E.step(() => Gm.bridge([
      { pre: 'Jeg tog frakken, fordi', w: ['jeg', 'ikke', 'ville', 'lyse'], en: 'I took the coat because I didn’t want to glow.', hint: 'Inside a fordi-sentence, ikke stands before the verb: fordi jeg ikke ville …', why: 'fordi jeg ikke ville: ikke jumps in front of ville.' },
      { pre: 'Før jeg faldt i søen,', w: ['sov', 'jeg', 'i', 'min', 'seng'], en: 'Before I fell into the lake, I was sleeping in my bed.', hint: 'After a før-sentence, the verb comes first: sov jeg …', why: 'The før-sentence takes the first place, so the verb sov takes the second.' },
      { pre: 'Lav hjalp mig, fordi', w: ['han', 'gerne', 'ville', 'have', 'selskab'], en: 'Lav helped me because he would like some company.', hint: 'gerne also jumps in front of the verb: fordi han gerne ville …', why: 'fordi han gerne ville: gerne before the verb.' },
      { pre: 'Asta var modig, men', w: ['hun', 'kunne', 'ikke', 'flygte'], en: 'Asta was brave, but she couldn’t escape.', hint: 'men changes nothing. Normal order: hun kunne ikke …', why: 'men keeps the normal order: subject, verb, ikke.' },
      { pre: 'Før jeg kom hertil,', w: ['boede', 'jeg', cp, city.da], en: 'Before I came here, I lived in ' + city.da + '.', hint: 'Verb first after the før-sentence: boede jeg …', why: 'boede jeg: verb, then subject.' },
      { pre: 'Jeg skal til Kronby, for', w: ['jeg', 'har', 'brug', 'for', 'hjælp'], en: 'I have to get to Kronby, for I need help.', hint: 'for (= because) changes nothing: for jeg har …', why: 'for joins two normal sentences: jeg har.' },
      { pre: 'Birk stoppede mig, fordi', w: ['hun', 'ikke', 'kunne', 'lide', 'fremmede'], en: 'Birk stopped me because she didn’t like strangers.', hint: 'fordi: ikke before the verb kunne.', why: 'fordi hun ikke kunne: ikke first, then the verb.' },
      { pre: 'Før de tog mig,', w: jobW, en: 'Before they took me, I ' + (st ? 'was a student.' : 'worked as ' + (/^[aeiou]/i.test(job.en) ? 'an ' : 'a ') + job.en + '.'), hint: 'Verb first: ' + jobW[0] + ' jeg …', why: 'Your own memory, in the right order.' }
    ], { mid: ['Halvvejs. Kig ikke ned.', 'Halfway. Don’t look down.'] }));
    E.SFX.chime(); await WLD().walk('hero', X.RAV1 + 10, 110);
    await E.say('lav', 'Du kom over. Jeg er næsten imponeret.', { en: 'You made it across. I am almost impressed.', think: 'Almost impressed. From him, that is a medal.' });

    /* ---------- 11 · the sound stones */
    camFree(); lav2.look = null; lav2.follow = 'hero'; lav2.gap = 120; E.mood('wonder', { birds: 0.3, wind: 0.03 });
    await go({ to: X.STONES_X - 150, hint: 'Walk on  ▶', lights: [[X.RAV1 + 260, 62, 'lyd', 'sound'], [X.RAV1 + 470, 150, 'synge', 'sing'], [X.RAV1 + 640, 62, 'sten', 'stone']] });
    lav2.follow = null; await WLD().walk('lav', X.STONES_X + 70, 100); lav2.look = 'hero'; cam(X.STONES_X - 40);
    await E.tell([['n', 'The forest opens into a clearing of tall grey stones. When the wind passes, they hum, each one on its own note. The sun is low now, and everything is gold.']]);
    await E.say('lav', 'Klangsten. De svarer kun, når du siger ordene rigtigt. Som en dansker.', { en: 'Sound stones. They only answer when you say the words right. Like a Dane.', think: 'Stones that judge my pronunciation. Even the rocks on this moon have standards.' });
    await E.step(() => Gm.stones());
    G.stonesLit = 6;
    await E.say('lav', 'Ikke dårligt. Her går jeg ikke længere. Byer lugter af mennesker.', { en: 'Not bad. I go no further than this. Towns smell of people.', think: '“Byer lugter af mennesker.” Towns smell of people. He is not wrong.' });
    await E.say('lav', 'Kronby ligger lige der. Find Birk. Og {navn} … pas på frakken.', { en: 'Kronby is right there. Find Birk. And {navn} … take care of the coat.', think: '“Pas på frakken.” Look after the coat. Not “look after yourself”. Noted.' });
    E.hidePanel(); lav2.look = null; E.tween(lav2, 'alpha', 0, 2.2); await WLD().walk('lav', X.STONES_X + 300, 110); lav2.hidden = true;

    /* ---------- 12 · the gate of Kronby, at dusk */
    camFree(); E.mood('gate', { wind: 0.02 }); G.dusk = 0.5;
    G.cast.push({ id: 'holm', k: 'npc', wx: X.GATE_X + 104, o: Object.assign({}, A.NPC.holm), flip: 1, look: 'hero' });
    await go({ to: X.GATE_X - 24, hint: 'Walk to the town  ▶', lights: [[X.STONES_X + 300, 62, 'by', 'town'], [X.STONES_X + 520, 150, 'port', 'gate'], [X.STONES_X + 760, 62, 'formular', 'form']] });
    cam(X.GATE_X + 30); E.tween(G, 'dusk', 0.9, 8);
    await E.tell([['n', 'Kronby is built in a tree. Behind a wall of living wood, a trunk as wide as a cathedral rises into the dusk, with a whole town glowing in its branches. At the gate stands a man with a magnificent beard.']]);
    await E.say('holm', 'Stop! Velkommen til Kronby. Jeg er Holm. Jeg passer porten.', { en: 'Stop! Welcome to Kronby. I am Holm. I look after the gate.', think: '“Velkommen”: welcome. The first person on this moon who has said it. He also said “stop” first, but I’ll take it.' });
    await E.say('holm', 'Alle fremmede skal skrive deres baggrund. Hvad lavede du før? Hvorfor kom du hertil? Skriv det her. Scanneren læser det.', { en: 'All strangers must write their background. What did you do before? Why did you come here? Write it here. The scanner reads it.', think: 'An alien moon. A magic forest. A talking deer. And still: a form. Paperwork is the true universal language.' });
    const model = `Før jeg kom hertil, boede jeg ${cityP()}. ${st ? 'Jeg var studerende' : 'Jeg arbejdede som ' + job.da} ${work.p ? work.da : 'hjemme'}. I min fritid ${hv[0]} jeg${hv.length > 1 ? ' ' + hv.slice(1).join(' ') : ''}. Jeg ${tr.da} på arbejde. Jeg kom hertil, fordi to aliens smed mig ud.`;
    const bio = await E.step(() => Gm.gateWrite({ model }));
    mem().bio = bio; E.save();
    E.SFX.scan(); await E.tween(G, 'scan', 1, 1.6); await E.wait(800);
    await E.tell([['n', 'The scanner ring hums and turns. Holm reads your words aloud, slowly, enjoying every one of them.'], ['d:holm', bio, '']]);
    G.scan = 0; E.SFX.clang(); E.gainPower(10); E.castAnim('godkendt');
    await E.say('holm', 'Før jeg kom hertil, boede jeg … Smukt! Verbet står rigtigt. Godkendt!', { en: 'Before I came here, I lived … Beautiful! The verb stands right. Approved!', think: 'He is moved by my word order. I have never moved anyone with my word order. I could get used to this.' });

    /* ---------- 13 · the coat, and the sky */
    const bk = E.actor('birk'); bk.hidden = false; bk.wx = X.GATE_X - 330; bk.look = null; bk.alpha = 1;
    await WLD().walk('birk', X.GATE_X - 110, 140); bk.look = 'hero';
    await E.say('birk', 'Du klarede det.', { en: 'You made it.', pre: 'Footsteps behind you. Birk walks out of the dusk: scratched, out of breath, alive.' });
    const c6 = await E.choose({ who: 'birk', da: 'Du klarede det.', en: 'You made it.', opts: ['Did the drone follow you?', 'Thank you for leading it away.'] });
    await E.say('birk', ['Nej. Jeg er hurtigere end en drone.', 'Du skal ikke takke mig. Ikke endnu.'][c6], { en: ['No. I’m faster than a drone.', 'Don’t thank me. Not yet.'][c6], think: ['Faster than a drone. I believe her.', '“Ikke endnu.” Not yet. That sounds like a promise and a threat at the same time.'][c6] });
    E.mood('dread', { wind: 0.02 }); cam(X.GATE_X - 70);
    await E.tell([['n', 'Under the gate lanterns, Birk sees the coat properly for the first time. She goes very still. She steps closer and turns the collar between two fingers.']]);
    await WLD().walk('birk', X.GATE_X - 62, 60);
    await E.say('birk', 'A. L. … Hvor har du den fra?', { en: 'A. L. … Where did you get it from?', think: '“Hvor har du den fra?” Where do you have it from. She asked that before the drone came. She hasn’t forgotten.' });
    await E.converse({
      who: 'birk', da: 'Hvor har du den fra?', en: 'Where did you get it from?', pool: ['Fra', 'et', 'skib', 'i', 'skoven', 'en', 'sø', 'til', 'på'], ans: 'Fra et skib i skoven', noBurst: true,
      judge: t => has(t, 'skib') ? { ok: true, who: 'birk', da: 'Et skib. I skoven.', en: 'A ship. In the forest.' } : { ok: false, who: 'birk', da: 'Hvor? Fra en sø? Fra et skib?', en: 'Where? From a lake? From a ship?' }
    });
    await E.say('birk', 'Det er min mors frakke.', { en: 'It is my mother’s coat.', think: '“Min mors frakke.” My mother’s coat. Asta. Specimen Six had a daughter, and the daughter has a spear, and I am wearing her mother’s coat.' });

    await fadeTo(async () => {
      setScene('ship', { feet: 664, maxLift: 200, where: 'Kurator-skibet', g: { progress: 64, anomaly: 1 }, cast: [{ id: 'vex', k: 'kurator', wx: 150, o: { point: 1 }, flip: 1 }, { id: 'plink', k: 'kurator', wx: 40, o: { small: 1, tablet: 1, robe: '#9fb39a', ph: 1.3 } }] });
      G.view = { x: 64, z: 1 };
      E.mood('dread', { hum: 0.05 });
    }, 1.2);
    await E.tell([['a:plink', 'Signal confirmed. The anomaly is active. Moon Seven, sector Kronby.'], ['a:plink', 'You logged it as insufficient.'], ['a:vex', 'I logged what the record needed.']]);
    await E.tell([['a:plink', 'And the voice, Vex? During the procedure it spoke. In the old language.'], ['a:vex', 'Then teach it silence.']]);
    await E.tell([['a:vex', 'Collect {her} at nightfall.']]);
    E.hidePanel(); G.glitch = { t0: E.clock(), dur: 1.5 }; await E.wait(900);
    await E.tell([['n', 'Somewhere deep in the ship, behind a door with no handle, a cracked voice whispers into the dark:'], ['d:stemme', 'Du er ikke alene.', 'You are not alone.']]);

    /* ---------- the end of the section */
    S().prog.k1a1 = 1; S().day = 1; E.cpEnd();
    E.hidePanel(); await E.tween(G, 'fade', 0.7, 1.2);
    await Gm.endCard({
      k: 'Kapitel 1 · Afsnit 1', title: 'Faldet', line: 'You fell. You hid. You remembered. Kronby’s gate is open, and someone up there knows exactly where you are.',
      learned: [
        'Past tense: <b>-ede</b> (lavede, boede), <b>-te</b> (læste, købte) and the irregular ones (gik, var, havde, kom, tog).',
        'Three ways to say why: <b>på grund af</b> + a thing, <b>for at</b> + a verb, <b>fordi</b> + a sentence.',
        'Inside a fordi-sentence, <b>ikke</b> and <b>gerne</b> stand before the verb.',
        'After a før-sentence the verb comes first: <span>Før jeg kom hertil, boede jeg …</span>',
        '<b>i</b> or <b>på</b> with places, and no article with jobs.',
        'How Danes really say <b>for at</b>, <b>på grund af</b> and the sound [ɔ].'
      ]
    });
    E.next('k1a2');
  }

  E.chapter({ id: 'k1a1', k: 'k1', kTitle: 'Kapitel 1 · Ankomsten', title: 'Afsnit 1 · Faldet', label: 'Kapitel 1 · Faldet', run });
  // shared with the next sections of the chapter
  window.K1 = { setScene, fadeTo, go, has, any, cam, camFree, heroSet, mem, cityP, jobLine, JOBS, WORK, CITIES, HOBBY, TRANS };
})();
