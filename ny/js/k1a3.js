/* Dumpet på Måne Syv · Kapitel 1 · Afsnit 3 · Bydel */
(function () {
  'use strict';
  const E = window.E, A = window.Art, G = E.G, Gm = window.Games, K = window.K1;
  const S = () => E.S();
  const { setScene, fadeTo, go, has, cam, camFree, mem, CITIES, JOBS } = K;
  const WLD = () => window.World, T = A.TOWN;

  /* ---------------- voices and names */
  Object.assign(E.SPK, {
    ebbe: { name: 'Ebbe', sub: 'bageren', voice: [0.92, 0.8] },
    vibeke: { name: 'Vibeke', sub: 'Toves mor', voice: [1.05, 1.15] },
    tove: { name: 'Tove', sub: 'seks år', voice: [1.15, 1.55] },
    tavle: { name: 'Tavlen', sub: 'the board', voice: [0.95, 1] }
  });
  Object.assign(E.IRONY, {
    ebbe: ['Brødet brænder! Sig bare:', 'Ebbe wipes flour off his hands, very slowly, very meaningfully.'],
    tove: ['Det ved alle børn. Sig:', 'Tove rolls her eyes with the full power of a six-year-old.']
  });

  /* ---------------- every Danish word in this section can be tapped */
  E.addGloss({
    // living somewhere
    'værelse': 'room', 'et værelse': 'a room', 'værelset': 'the room', 'til leje': 'to rent, for rent', 'leje': 'rent', 'værelse til leje': 'room for rent', 'et sted at bo': 'a place to live', 'sted': 'place', 'steder': 'places', 'stedet': 'the place', 'forskellige': 'different', 'forskellige steder': 'different places', 'hus': 'house', 'huset': 'the house', 'huse': 'houses', 'vindue': 'window', 'et vindue': 'a window', 'stort': 'big (et-word)', 'stort værelse': 'big room', 'et stort værelse': 'a big room', 'interesseret': 'interested', 'er du interesseret': 'are you interested', 'brev': 'letter', 'et brev': 'a letter', 'brevet': 'the letter', 'læg': 'put!, lay!', 'læg det': 'put it', 'postkassen': 'the letterbox', 'i postkassen': 'in the letterbox', 'banke på døren': 'knock on the door', 'døren': 'the door', 'banke': 'knock', 'spørge': 'ask', 'skrive et brev': 'write a letter', 'sedlen': 'the note', 'skrev': 'wrote', 'bo': 'live (somewhere)', 'bor': 'live(s)', 'boet': 'lived (har boet = have lived)', 'har boet': 'have lived', 'flytte ind': 'move in', 'nabo': 'neighbour', 'naboer': 'neighbours',
    // the town: streets and places
    'gade': 'street', 'vej': 'road, way', 'stræde': 'lane, narrow street', 'rodgade': 'Rodgade (Root Street)', 'mosevej': 'Mosevej (Moss Road)', 'bagerstræde': 'Bagerstræde (Baker Lane)', 'rodbyen': 'Rodbyen (the root town, a district)', 'mosen': 'Mosen (the moss quarter); the bog', 'kronen': 'Kronen (the crown of the tree, a district); the crown', 'på kronen': 'up in Kronen', 'i rodbyen': 'in Rodbyen', 'i mosen': 'in Mosen', 'på torvet': 'on the square', 'i rodgade': 'in Rodgade', 'på mosevej': 'on Mosevej', 'i bagerstræde': 'in Bagerstræde', 'i kronby': 'in Kronby',
    'bager': 'baker', 'en bager': 'a baker', 'bageren': 'the baker', 'bageri': 'bakery', 'bageriet': 'the bakery', 'apotek': 'pharmacy', 'et apotek': 'a pharmacy', 'apoteket': 'the pharmacy', 'boghandel': 'bookshop', 'en boghandel': 'a bookshop', 'boghandlen': 'the bookshop', 'bibliotek': 'library', 'et bibliotek': 'a library', 'biblioteket': 'the library', 'slagter': 'butcher', 'en slagter': 'a butcher', 'slagteren': 'the butcher', 'grønthandler': 'greengrocer', 'en grønthandler': 'a greengrocer', 'grønthandleren': 'the greengrocer', 'café': 'café', 'en café': 'a café', 'butik': 'shop', 'butikker': 'shops', 'butikkerne': 'the shops', 'springvand': 'fountain', 'springvandet': 'the fountain', 'mosesten': 'moss stone', 'mosestenen': 'the moss stone', 'boderne': 'the market stalls', 'kælder': 'cellar', 'kælderen': 'the cellar', 'kælderen er sikker': 'the cellar is safe', 'sikker': 'safe',
    'i nærheden': 'nearby', 'her i nærheden': 'near here, around here', 'i nærheden af': 'near', 'nærheden': 'the neighbourhood, nearness', 'ved siden af': 'next to', 'lige ved siden af': 'right next to', 'overfor': 'opposite', 'lige overfor': 'right opposite', 'mellem': 'between', 'tæt på': 'close to', 'ikke så langt fra': 'not far from', 'langt': 'far; long', 'langt fra': 'far from', 'på hjørnet af': 'on the corner of', 'hjørnet': 'the corner', 'for enden af': 'at the end of', 'enden': 'the end', 'nummer': 'number', 'i nummer': 'at number', 'derhenne': 'over there', 'lige derhenne': 'right over there', 'lige her': 'right here', 'herhenne': 'over here', 'hvor ligger': 'where is (located)', 'ligger': 'is (located), lies', 'hvor ligger den': 'where is it (en-word)', 'hvor ligger det': 'where is it (et-word)', 'hvilket': 'which (et-word)', 'hvilken': 'which',
    // what a place is like
    'larm': 'noise', 'meget larm': 'a lot of noise', 'luft': 'air', 'liv': 'life (people, things going on)', 'meget liv': 'lots of life', 'lys': 'light', 'meget lys': 'lots of light', 'mos': 'moss', 'rødder': 'roots', 'lamper': 'lamps', 'mennesker': 'people', 'mange mennesker': 'many people', 'mange': 'many (things you can count)', 'meget': 'much, a lot (things you can’t count); very', 'rigtig': 'really', 'rigtig mange': 'really many', 'virkelig': 'really', 'alt for': 'far too', 'alt for mange': 'far too many', 'alt for meget': 'far too much', 'ikke så': 'not so', 'ikke så mange': 'not so many', 'ikke så meget': 'not so much', 'stille': 'quiet', 'hyggelig': 'cosy', 'hyggeligt': 'cosy (et-word)', 'grønt': 'green (et-word)',
    // little answers
    'jo': 'yes (after a question with ikke)', 'det er jeg': 'I am (short answer)', 'ja det er jeg': 'yes, I am', 'det gør jeg': 'I do (short answer)', 'ja det gør jeg': 'yes, I do', 'jo det gør jeg': 'yes, I do (after a question with ikke)', 'det er der': 'there is (short answer)', 'ja det er der': 'yes, there is', 'nej det er der ikke': 'no, there isn’t', 'det kan jeg': 'I can (short answer)', 'det har jeg': 'I have (short answer)', 'jo det har jeg': 'yes, I have (after ikke)', 'det vil jeg gerne': 'I would like that', 'ja det vil jeg gerne': 'yes, I would like that', 'det kan jeg godt lide': 'I like that', 'det kan jeg godt forstå': 'I can understand that', 'gør': 'do, does', 'det gør jeg gerne': 'I’d gladly do that',
    // compounds
    'yndlings': 'favourite (only as the front of a word)', 'yndlingssted': 'favourite place', 'mit yndlingssted': 'my favourite place', 'yndlingscafé': 'favourite café', 'ankomsthal': 'arrivals hall', 'træhus': 'tree house, wooden house', 'månelys': 'moonlight', 'byport': 'town gate', 'måneskib': 'moon ship', 'notesbog': 'notebook', 'ordbog': 'dictionary', 'rod': 'root', 'mose': 'moss bog', 'hal': 'hall', 'to ord': 'two words', 'lavet af': 'made of',
    // things and people
    'medicin': 'medicine', 'knæ': 'knee', 'mit knæ': 'my knee', 'suppe': 'soup', 'det er suppe': 'it’s soup', 'engel': 'angel', 'brød': 'bread', 'friskt': 'fresh (et-word)', 'friskt brød': 'fresh bread', 'brødet': 'the bread', 'brænder': 'is burning', 'klokken fire': 'at four o’clock', 'klokken': 'o’clock; the clock', 'papir': 'paper', 'her er papir': 'here is paper', 'børn': 'children', 'datter': 'daughter', 'min datter': 'my daughter', 'mor': 'mum, mother', 'hjemme': 'at home', 'måske er hun hjemme': 'maybe she is at home', 'skål': 'cheers!', 'skjold': 'shield', 'et skjold': 'a shield', 'et skjold af ord': 'a shield of words', 'råd': 'council', 'kronbys råd': 'Kronby’s council', 'fra i dag': 'from today', 'arbejde for byen': 'work for the town', 'for byen': 'for the town', 'bygger': 'builds, is building', 'bedre end mig': 'better than me', 'bedre': 'better', 'end': 'than', 'ebbe': 'Ebbe (a name)', 'vibeke': 'Vibeke (a name)', 'tove': 'Tove (a name)', 'toves': 'Tove’s', 'b': 'B',
    // verbs and phrases
    'leder du efter': 'are you looking for', 'hvad leder du efter': 'what are you looking for', 'giv': 'give!', 'giv det her til': 'give this to', 'det her': 'this', 'før dem derhen': 'take them there', 'derhen': 'there (to there)', 'går med': 'come along', 'jeg går med': 'I’ll come along', 'er her': 'is here', 'tager mig hjem': 'takes me home', 'troede': 'thought, believed', 'kom med mig': 'come with me', 'kom med': 'come along', 'hold fast': 'hold on', 'synger': 'sings', 'starter': 'starts', 'skal have': 'need, must have', 'jeg skal have': 'I need', 'sluk': 'turn off!', 'gemmer sig': 'hides', 'åbner': 'opens', 'leder': 'is looking (leder efter = looks for)', 'hjem': 'home', 'sagde': 'said',
    'ankomst': 'arrival', 'bydel': 'district, part of town', 'kære': 'dear (to begin a letter)', 'kære b': 'dear B', 'hilsner': 'greetings', 'mange hilsner': 'best wishes (many greetings)', 'hilsen': 'greeting', 'laver': 'make(s), do(es)', 'laver mad': 'cook(s)', 'jeg laver ikke mad': 'I don’t cook', 'søde': 'sweet, kind (plural)', 'søde mennesker': 'kind people', 'leje værelset': 'rent the room',
    'musikeren': 'the musician', 'hurtige': 'quick (plural)', 'hurtige spørgsmål': 'quick questions', 'svar kort': 'answer short!', 'kort': 'short', 'snorker': 'snores', 'slags': 'kind(s)', 'tre slags': 'three kinds', 'venter': 'wait(s)', 'kartofler': 'potatoes', 'købe kartofler': 'buy potatoes', 'det nye værelse': 'the new room', 'otte': 'eight', 'jeg er ny her': 'I am new here', 'hallo': 'hello', 'er der nogen': 'is anyone there', 'alle til biblioteket': 'everyone to the library', 'ned i kælderen': 'down into the cellar', 'tak for medicinen': 'thanks for the medicine', 'medicinen': 'the medicine', 'på biblioteket': 'at the library', 'i biblioteket': 'in the library',
    'god morgen': 'good morning', 'velkommen til rodgade': 'welcome to Rodgade', 'velkommen til': 'welcome to', 'du kender vejen': 'you know the way', 'hjælp dem': 'help them', 'dronerne': 'the drones', 'alle skal ned': 'everyone must go down', 'ned i': 'down into'
  });

  /* ---------------- the street, door by door */
  const RG = [[1, 2645, 'Bageren'], [3, 2825, 'Apoteket'], [5, 3010, 'nr. 5'], [7, 3210, 'Boghandlen'], [9, 3405, 'nr. 9'], [11, 3595, 'Biblioteket'], [13, 3790, 'Slagteren'], [15, 3985, 'nr. 15']].map(([n, x, label]) => ({ id: 'r' + n, n, x, label }));
  const MV = [[1, 4410, 'nr. 1'], [3, 4645, 'Grønthandleren'], [5, 4875, 'nr. 5'], [7, 5125, 'nr. 7'], [9, 5380, 'nr. 9']].map(([n, x, label]) => ({ id: 'm' + n, n, x, label }));
  const DOOR = id => RG.concat(MV).find(d => d.id === id);
  const NAME = { r1: 'the bakery', r3: 'the pharmacy', r5: 'Rodgade 5', r7: 'the bookshop', r9: 'Rodgade 9', r11: 'the library', r13: 'the butcher', r15: 'Rodgade 15', m1: 'Mosevej 1', m3: 'the greengrocer', m5: 'Mosevej 5', m7: 'Mosevej 7', m9: 'Mosevej 9' };

  /* ---------------- helpers */
  const hero = () => E.actor('hero');
  const look = (id, at) => { const a = E.actor(id); if (a) a.look = at; };
  const dark = o => A.nightify(o, 0.2);
  const npc = (id, wx, x) => Object.assign({ id, k: 'npc', wx, o: Object.assign({}, A.NPC[id]), look: 'hero' }, x || {});
  // a character enters again: the old one (maybe hidden somewhere) is replaced
  const enterAs = (id, wx, x) => { G.cast = G.cast.filter(a => a.id !== id); G.cast.push(npc(id, wx, x)); };
  const stroll = (id, to, sp) => { E.hidePanel(); return WLD().walk(id, to, sp); };
  async function walk(o) { const h = hero(); if (h) h.look = null; camFree(); await go(o); }
  const city = () => mem().city || CITIES[0], job = () => mem().job || JOBS[0];
  // find a door; a wrong door gets a dry remark, and after two misses a little arrow shows the way
  async function seek(o) {
    camFree(); const h = hero(); if (h) h.look = null;
    for (let miss = 0; ; miss++) {
      const id = await E.step(() => WLD().find({ doors: o.doors, want: o.want, hint: o.hint, mark: miss >= 2, min: o.min, max: o.max, lights: miss ? null : o.lights }));
      const hh = hero(), d = DOOR(o.want); if (hh && d && id === o.want) hh.wx = d.x;
      if (id === o.want) return;
      E.SFX.bad();
      await E.tell([['t', (o.wrong && o.wrong(id)) || `That’s ${NAME[id] || 'the wrong door'}. Not what I’m looking for.`], ['n', 'Clue: ' + o.clue]]);
    }
  }

  async function run() {
    E.cpStart('k1a3-1');
    const s = S();
    if (!s.mem) s.mem = {};
    const cy = city(), jb = job(), st = jb.da === 'studerende', cyP = (cy.p || 'i') + ' ' + cy.da;

    /* ---------- 1 · morning: a place to live */
    s.day = 3;
    setScene('world', {});
    WLD().enter({ map: 'town', tod: 'day', hallOpen: 1, where: 'Kronby · Ankomsthallen', cast: [{ k: 'hero', wx: 880 }, npc('ruth', 960), npc('noor', 1090, { flip: 1, look: null })] });
    cam(960, 1.05); E.mood('dawn', { birds: 0.25 });
    G.fade = 1; E.tween(G, 'fade', 0, 1.4);
    await E.tell([
      ['n', 'Day three. On the chest by your bunk lies a rust-red jacket with leather on the shoulders, and a note that says only: – Ruth.'],
      ['t', 'I am being dressed by a woman from Glasgow I met yesterday. I’ve had worse stylists.']
    ]);
    await E.say('ruth', 'God morgen. I dag skal du finde et sted at bo.', { en: 'Good morning. Today you must find a place to live.', think: '“Et sted at bo”: a place to live. Day three, and already flat-hunting. The moon is more like home than I expected.' });
    await E.say('ruth', 'Du kan sove her i fem dage mere. Så skal du have et værelse.', { en: 'You can sleep here for five more days. Then you need a room.', think: '“Et værelse”: a room. The board said seven days. Ruth has been counting.' });
    look('noor', 'hero');
    await E.say('noor', 'Jeg skal ikke have et værelse. Jeg rejser hjem om seks dage!', { en: 'I don’t need a room. I am going home in six days!', think: '“Om seks dage.” She is counting too. Every morning, one less.' });
    await E.say('ruth', 'Vi bor forskellige steder. Mateo bor på Torvet. Kofi bor i Rodbyen. Jeg bor i Mosen.', { en: 'We live in different places. Mateo lives on the square. Kofi lives in Rodbyen. I live in Mosen.', think: '“I” Rodbyen, “i” Mosen, but “på” Torvet. Of course there are rules. There are always rules.' });
    await E.step(() => Gm.teach({
      lab: 'i eller på?', sub: 'streets and places', h: 'Where do you live?',
      html: `<div class="book">
        <div><span><b lang="da">${E.fog('i')}</b> + a -gade or a -stræde</span><i lang="da">${E.fog('i Rodgade · i Bagerstræde')}</i></div>
        <div><span><b lang="da">${E.fog('på')}</b> + a -vej, a plads, a torv</span><i lang="da">${E.fog('på Mosevej · på Torvet')}</i></div>
        <div><span><b lang="da">${E.fog('i')}</b> + a town, most districts</span><i lang="da">${E.fog('i Kronby · i Rodbyen · i Mosen')}</i></div>
        <div><span><b lang="da">${E.fog('på')}</b> + some districts (learn them one by one)</span><i lang="da">${E.fog('på Kronen')}</i></div></div>
        <p class="hint">The question copies the little word: <span lang="da">${E.fog('Hvor i Rodbyen bor du? Hvor på Mosevej?')}</span></p>`
    }));
    await E.step(() => Gm.sortCards({
      lab: 'i eller på?', who: 'ruth', h: 'Ruth names a place. i or på?',
      groups: [{ k: 'i', label: 'i', small: '-gade, -stræde, a town' }, { k: 'p', label: 'på', small: '-vej, plads, torv' }],
      items: [
        { w: 'Rodgade', g: 'i', why: 'i Rodgade: a -gade takes i.' }, { w: 'Mosevej', g: 'p', why: 'på Mosevej: a -vej takes på.' },
        { w: 'Torvet', g: 'p', why: 'på Torvet: a torv takes på.' }, { w: 'Bagerstræde', g: 'i', why: 'i Bagerstræde: a -stræde takes i.' },
        { w: 'Kronby', g: 'i', why: 'i Kronby: a town takes i.' }, { w: 'Rodbyen', g: 'i', why: 'i Rodbyen: most districts take i.' },
        { w: 'Kronen', g: 'p', why: 'på Kronen: one of the districts that take på.' }, { w: 'Mosen', g: 'i', why: 'i Mosen: most districts take i.' }
      ]
    }));
    await E.say('ruth', 'Se på tavlen. Der er et værelse til leje.', { en: 'Look at the board. There is a room for rent.' });
    await walk({ to: T.BOARD - 30, hint: 'Walk to the board  ▶' });
    cam(T.BOARD - 40, 1.1);
    await E.step(() => Gm.readLog({
      lab: 'Tavlen', title: 'Værelse til leje i Mosen', who: 'tavle',
      text: 'Jeg har et stort værelse med et vindue og en seng.\nDer er meget lys, og der er ikke så meget larm.\nHuset ligger på Mosevej nummer 5, lige overfor mosestenen.\nDer er en grønthandler tæt på, og Rodbyen ligger ikke så langt fra.\nEr du interesseret? Skriv et brev, og læg det i postkassen.\n– B.',
      qs: [
        { q: 'Hvor ligger huset?', da: true, opts: ['På Mosevej.', 'I Mosevej.', 'På Rodgade.'], a: 0, why: 'På Mosevej nummer 5: a -vej takes på.', hint: 'Look for nummer 5. And a -vej takes på.' },
        { q: 'Hvad er der tæt på huset?', da: true, opts: ['En grønthandler.', 'Et bibliotek.', 'En café.'], a: 0, why: 'Der er en grønthandler tæt på.', hint: 'Look for tæt på.' },
        { q: 'Hvad skal du gøre, hvis du er interesseret?', da: true, opts: ['Skrive et brev.', 'Banke på døren.', 'Spørge Holm.'], a: 0, why: 'Skriv et brev, og læg det i postkassen.', hint: 'Look at the last line.' }
      ]
    }));
    await E.tell([['t', '“– B.” Just B. A landlord with one letter. Very mysterious. Probably a vampire. Possibly a very tidy one.']]);
    await walk({ to: 1000, hint: '◀ Back to Ruth' });
    look('hero', 'ruth');
    await E.say('ruth', 'Godt. Men først: kan du hjælpe mig? Jeg skal have medicin fra apoteket. Mit knæ.', { en: 'Good. But first: can you help me? I need medicine from the pharmacy. My knee.', think: '“Mit knæ”: my knee. Twenty-three years on the moon. I would need medicine too.' });
    await E.say('ruth', 'Og giv det her til Kofi. Det er suppe. Han bor i Rodgade.', { en: 'And give this to Kofi. It is soup. He lives in Rodgade.', pre: 'She puts a warm jar in your hands.', think: 'Soup, delivered by hand, across a town in a tree. This is either a fairy tale or a very small economy.' });

    /* ---------- 2 · Rodbyen: where is it? */
    enterAs('ebbe', 2600, { look: null, flip: 1 });
    await walk({ to: 2530, hint: 'Out across the square, to Rodbyen  ▶', lights: [[1450, 62, 'gade', 'street'], [1860, 150, 'vej', 'road'], [2300, 62, 'værelse', 'room']] });
    look('ebbe', 'hero'); look('hero', 'ebbe'); cam(2570, 1.1); E.mood('town', { birds: 0.2 });
    await E.tell([['n', 'Rodbyen is a street under the roots of the town-tree. The roots arch overhead like the ceiling of a cathedral, hung with little lamps. A man covered in flour is putting loaves in his window.']]);
    await E.say('ebbe', 'God morgen! Friskt brød! Du er den nye, ikke?', { en: 'Good morning! Fresh bread! You are the new one, right?', think: 'Fresh bread. The smell hits me like a memory. Not a specific one. Just: bread. Mornings. Being a person.' });
    await E.step(() => Gm.teach({
      lab: 'Er der et apotek her i nærheden?', sub: 'new or known', h: 'A new thing: en, et. A thing you both know: -en, -et.',
      html: `<div class="book">
        <div><span lang="da">${E.fog('en bager → bageren')}</span><i>a baker → the baker</i></div>
        <div><span lang="da">${E.fog('en café → caféen')}</span><i>ends in -e? just add -n</i></div>
        <div><span lang="da">${E.fog('et apotek → apoteket')}</span><i>a pharmacy → the pharmacy</i></div>
        <div><span lang="da">${E.fog('et bibliotek → biblioteket')}</span><i>a library → the library</i></div>
        <div><span lang="da">${E.fog('butikker → butikkerne')}</span><i>shops → the shops</i></div></div>
        <p class="hint">When you ask if there is one, it is new: <b lang="da">${E.fog('Er der et apotek her i nærheden?')}</b> When you both know it: <b lang="da">${E.fog('Hvor ligger apoteket?')}</b></p>`
    }));
    await E.converse({
      who: 'ebbe', da: 'Hvad leder du efter?', en: 'What are you looking for?',
      pool: ['Er', 'der', 'et', 'en', 'apotek', 'apoteket', 'her', 'i nærheden'], ans: 'Er der et apotek her i nærheden',
      hint: 'You don’t know any pharmacy here yet: Er der et apotek her i nærheden?',
      judge: t => {
        if (has(t, 'apoteket')) return { ok: false, who: 'ebbe', da: 'Apoteket? Hvilket apotek? Du kender det ikke endnu.', en: 'The pharmacy? Which pharmacy? You don’t know it yet.', fb: 'Something new: **et apotek**.' };
        if (has(t, 'en apotek')) return { ok: false, who: 'ebbe', da: 'En apotek? Det hedder et apotek.', en: 'En apotek? It is et apotek.', fb: '**et** apotek.' };
        if (has(t, 'er der') && has(t, 'et apotek')) return { ok: true, who: 'ebbe', da: 'Ja. Der ligger et apotek lige ved siden af bageriet.', en: 'Yes. There is a pharmacy right next to the bakery.', word: 'et apotek', think: '“Lige ved siden af”: right next to. He points at the door next to his. I could have just looked. But then I wouldn’t have learned anything, and Ebbe wouldn’t have had the pleasure.' };
        return { ok: false, who: 'ebbe', da: 'Hvad? Er der … hvad?', en: 'What? Is there … what?' };
      }
    });
    await E.step(() => Gm.teach({
      lab: 'Hvor ligger det?', sub: 'where things are', h: 'Little words for places',
      html: `<div class="book">
        <div><span lang="da">${E.fog('ved siden af bageren')}</span><i>next to the baker</i></div>
        <div><span lang="da">${E.fog('overfor springvandet')}</span><i>opposite the fountain</i></div>
        <div><span lang="da">${E.fog('mellem apoteket og boghandlen')}</span><i>between the pharmacy and the bookshop</i></div>
        <div><span lang="da">${E.fog('tæt på · i nærheden af Torvet')}</span><i>close to · near the square</i></div>
        <div><span lang="da">${E.fog('ikke så langt fra Mosen')}</span><i>not far from Mosen</i></div>
        <div><span lang="da">${E.fog('på hjørnet af Rodgade og Mosevej')}</span><i>on the corner of …</i></div>
        <div><span lang="da">${E.fog('i nummer 9 · på Mosevej nummer 5')}</span><i>at number 9</i></div></div>
        <p class="hint"><b lang="da">${E.fog('lige')}</b> makes it exact: <span lang="da">${E.fog('lige overfor, lige ved siden af')}</span>. And after these words comes the thing you both know: <span lang="da">${E.fog('ved siden af bageren')}</span>.</p>`
    }));
    await seek({ doors: RG, want: 'r3', hint: 'Find the pharmacy: lige ved siden af bageriet', clue: 'lige ved siden af bageriet.', max: 4200, min: 2480, wrong: id => id === 'r1' ? 'That’s Ebbe’s bakery. Ebbe waves a loaf at me. The pharmacy is next to it.' : null });
    await E.tell([['n', 'Inside, it smells of moss and mint. You come out with a small brown bottle labelled, in careful handwriting, KNÆ.'], ['t', 'KNÆ. Knee. A whole word that is mostly vowels and a sigh.']]);
    look('hero', 'ebbe'); look('ebbe', 'hero'); cam(2735, 1.05);
    await E.say('ebbe', 'Kofi? Musikeren? Han bor i nummer 9, mellem boghandlen og biblioteket. Lige overfor springvandet.', { en: 'Kofi? The musician? He lives at number 9, between the bookshop and the library. Right opposite the fountain.', pre: 'Ebbe leans out of his door.', think: '“Mellem”: between. “Overfor”: opposite. Ebbe gives directions the way he bakes: generously.' });
    await seek({ doors: RG, want: 'r9', hint: 'Find Kofi’s house: mellem boghandlen og biblioteket', clue: 'nummer 9, mellem boghandlen og biblioteket, lige overfor springvandet.', max: 4200, min: 2480, lights: [[2950, 62, 'mellem', 'between'], [3300, 150, 'overfor', 'opposite']], wrong: id => id === 'r5' ? 'Number 5: between the pharmacy and the bookshop. Close. Wrong bookshop side.' : null });

    /* ---------- 3 · Kofi, at home */
    enterAs('kofi', 3440, { flip: 1 });
    look('hero', 'kofi'); cam(3420, 1.12);
    await E.say('kofi', 'Hej! Velkommen til Rodgade!', { en: 'Hi! Welcome to Rodgade!', pre: 'The door flies open before you knock. Kofi, with a drum under his arm and toast in his mouth.' });
    await E.tell([['n', 'You give him the jar.'], ['d:kofi', 'Suppe! Fra Ruth? Hun er en engel.', 'Soup! From Ruth? She is an angel.']]);
    await E.step(() => Gm.teach({
      lab: 'Ja, det er jeg', sub: 'short answers', h: 'Danes answer short: det + the same verb',
      html: `<div class="book">
        <div><span lang="da">${E.fog('Er du glad for Kronby?')}</span><i lang="da">${E.fog('Ja, det er jeg.')}</i></div>
        <div><span lang="da">${E.fog('Er der et værelse til leje?')}</span><i lang="da">${E.fog('Ja, det er der.')}</i></div>
        <div><span lang="da">${E.fog('Kan du lide suppe?')}</span><i lang="da">${E.fog('Ja, det kan jeg.')}</i></div>
        <div><span lang="da">${E.fog('Har du en notesbog?')}</span><i lang="da">${E.fog('Ja, det har jeg.')}</i></div>
        <div><span>Every other verb: <b lang="da">${E.fog('gør')}</b></span><i lang="da">${E.fog('Bor du her? – Ja, det gør jeg.')}</i></div></div>
        <p class="hint">A question with <b lang="da">${E.fog('ikke')}</b>? Then yes is <b lang="da">${E.fog('jo')}</b>: <span lang="da">${E.fog('Bor du ikke her? – Jo, det gør jeg.')}</span></p>`
    }));
    await E.say('kofi', 'Hurtige spørgsmål! Svar kort!', { en: 'Quick questions! Answer short!', think: 'Quiz time. With a drum. I have no choice in this.' });
    const QS = [
      { q: 'Er du glad for Kronby?', opts: ['Ja, det er jeg.', 'Ja, det gør jeg.', 'Ja, jeg er.'], why: 'Er du …? – Ja, det er jeg.' },
      { q: 'Bor du i Ankomsthallen?', opts: ['Ja, det gør jeg.', 'Ja, det bor jeg.', 'Ja, det er jeg.'], why: 'bor is not være, kan or har: Ja, det gør jeg.' },
      { q: 'Er der et værelse til leje i Mosen?', opts: ['Ja, det er der.', 'Ja, der er det.', 'Ja, det er det.'], why: 'Er der …? – Ja, det er der.' },
      { q: 'Kan du lide suppe?', opts: ['Ja, det kan jeg.', 'Ja, det gør jeg.', 'Ja, jeg kan.'], why: 'Kan du …? – Ja, det kan jeg.' },
      { q: 'Har du ikke en notesbog?', opts: ['Jo, det har jeg.', 'Ja, det har jeg.', 'Nej, det har jeg.'], why: 'A question with ikke: yes is jo. Jo, det har jeg.' }
    ];
    for (const Q of QS) await E.step(() => Gm.chooseOne({ lab: 'Kofi spørger', sub: 'short answers', html: `<div class="memory"><div class="who">Kofi</div><p class="da" lang="da">${E.fog(Q.q)} ${Gm.sayBtn(Q.q, 'kofi')}</p></div>`, say: Q.q, who: 'kofi', opts: Q.opts, a: 0, da: true, why: Q.why, tip: 'det + the same verb (er, kan, har). Every other verb: gør.' }));
    E.gainPower(4);
    await E.converse({
      who: 'kofi', da: 'Nu dig! Spørg mig om Rodgade.', en: 'Now you! Ask me about Rodgade.',
      pool: ['Er', 'du', 'glad', 'for', 'at', 'bo', 'i', 'på', 'Rodgade', 'Kan'], ans: 'Er du glad for at bo i Rodgade',
      hint: 'Ask if he is happy to live there: Er du glad for at bo i Rodgade?',
      judge: t => {
        if (has(t, 'på rodgade')) return { ok: false, who: 'kofi', da: 'På Rodgade? Det er en gade: i Rodgade.', en: 'På Rodgade? It is a gade: i Rodgade.', fb: 'A -gade takes **i**.' };
        if (has(t, 'glad for') && has(t, 'i rodgade')) return { ok: true, who: 'kofi', da: 'Ja, det er jeg! Der er mange butikker, og der er meget liv. Men der er også meget larm. Bageren starter klokken fire.', en: 'Yes, I am! There are many shops, and there is lots of life. But there is also a lot of noise. The baker starts at four o’clock.', word: 'glad for' };
        return { ok: false, who: 'kofi', da: 'Spørg: er du glad for at bo …?', en: 'Ask: are you happy to live …?' };
      }
    });
    await E.tell([['t', '“Mange butikker”, “meget liv”, “meget larm”. The crystal hums a pattern: mange for things you can count, meget for things you can’t. You can’t count noise. Kofi has tried. At four in the morning.']]);
    await E.step(() => Gm.teach({
      lab: 'mange eller meget?', sub: 'many or much', h: 'Can you count it?',
      html: `<div class="book">
        <div><span><b lang="da">${E.fog('mange')}</b> + things you can count</span><i lang="da">${E.fog('mange butikker · mange mennesker')}</i></div>
        <div><span><b lang="da">${E.fog('meget')}</b> + things you can’t count</span><i lang="da">${E.fog('meget liv · meget larm · meget lys')}</i></div></div>
        <p class="hint">Turn it up or down: <span lang="da">${E.fog('rigtig mange · alt for meget · ikke så mange · ikke så meget')}</span></p>`
    }));
    await E.step(() => Gm.sortCards({
      lab: 'mange eller meget?', who: 'kofi', h: 'Kofi drums a word. Can you count it?',
      groups: [{ k: 'ma', label: 'mange', small: 'you can count it' }, { k: 'me', label: 'meget', small: 'you can’t' }],
      items: [
        { w: 'butikker', g: 'ma', en: 'shops' }, { w: 'mennesker', g: 'ma', en: 'people' }, { w: 'rødder', g: 'ma', en: 'roots' }, { w: 'lamper', g: 'ma', en: 'lamps' }, { w: 'huse', g: 'ma', en: 'houses' },
        { w: 'lys', g: 'me', en: 'light' }, { w: 'larm', g: 'me', en: 'noise' }, { w: 'liv', g: 'me', en: 'life' }, { w: 'mos', g: 'me', en: 'moss' }, { w: 'luft', g: 'me', en: 'air' }
      ]
    }));
    await E.converse({
      who: 'kofi', da: 'Og Ankomsthallen? Er du glad for den?', en: 'And the arrivals hall? Are you happy with it?',
      pool: ['Nej', 'ikke rigtigt.', 'Ja', 'det er jeg.', 'Der', 'er', 'alt for', 'mange', 'meget', 'mennesker', 'larm'], ans: 'Nej, ikke rigtigt. Der er alt for mange mennesker',
      hint: 'Answer short, then say why: Der er alt for mange mennesker.',
      judge: t => {
        if (has(t, 'mange larm') || has(t, 'meget mennesker')) return { ok: false, who: 'kofi', da: 'Hm? Mange mennesker. Meget larm.', en: 'Hm? Many people. Much noise.', fb: '**mange** + people (you can count them), **meget** + noise (you can’t).' };
        if (has(t, 'der er') && (has(t, 'mange mennesker') || has(t, 'meget larm'))) return { ok: true, who: 'kofi', da: 'Det kan jeg godt forstå. Holm snorker.', en: 'I can understand that. Holm snores.', word: has(t, 'mange') ? 'mange' : 'meget', think: 'Holm snores. Of course he does. Probably in perfect word order.' };
        return { ok: false, who: 'kofi', da: 'Og hvorfor? Der er …', en: 'And why? There is …', fb: 'Der er mange … / Der er meget …' };
      }
    });

    /* ---------- 4 · on the way to Mosen: den, det, de, der */
    await E.say('kofi', 'Jeg går med. Jeg skal til grønthandleren.', { en: 'I’ll come along. I need to go to the greengrocer.', think: 'A guide with a drum. Every step of the way, a rhythm.' });
    await E.tell([['n', 'Kofi talks the whole way, and the little words fly past: den, det, de, der. They all sound almost the same. The crystal sorts them anyway.']]);
    await E.step(() => Gm.teach({
      lab: 'den, det, de, der', sub: 'four little words', h: 'Six rules, one by one',
      html: `<div class="book">
        <div><span><b>1</b> <b lang="da">${E.fog('den')}</b>: back to an en-word</span><i lang="da">${E.fog('Mosestenen? Den står på Mosevej.')}</i></div>
        <div><span><b>2</b> <b lang="da">${E.fog('det')}</b>: back to an et-word</span><i lang="da">${E.fog('Apoteket? Det ligger i Rodgade.')}</i></div>
        <div><span><b>3</b> <b lang="da">${E.fog('de')}</b>: back to a plural</span><i lang="da">${E.fog('Boderne? De ligger på Torvet.')}</i></div>
        <div><span><b>4</b> <b lang="da">${E.fog('det')}</b>: a whole sentence, short answers</span><i lang="da">${E.fog('Ved du det? · Ja, det er jeg.')}</i></div>
        <div><span><b>5</b> <b lang="da">${E.fog('det')}</b>: says what something is</span><i lang="da">${E.fog('Det er en god café.')}</i></div>
        <div><span><b>6</b> <b lang="da">${E.fog('der')}</b>: a place, there</span><i lang="da">${E.fog('Jeg har boet der i et år.')}</i></div>
        <div><span><b>+</b> <b lang="da">${E.fog('der er · der ligger')}</b>: there is</span><i lang="da">${E.fog('Der ligger en bager i Rodgade.')}</i></div></div>`
    }));
    await E.step(() => Gm.gapChoice({
      lab: 'den, det, de eller der?', h: 'Which little word goes in the gap?',
      keys: [{ id: 'den', da: 'den', plus: 'en-word' }, { id: 'det', da: 'det', plus: 'et-word, a sentence' }, { id: 'de', da: 'de', plus: 'plural' }, { id: 'der', da: 'der', plus: 'there' }],
      tips: { den: 'den points back to an en-word. Is there one?', det: 'det: an et-word, a whole sentence, or “it is”. Look again.', de: 'de points back to more than one thing.', der: 'der is a place, or “there is”.' },
      items: [
        { a: 'Apoteket?', b: 'ligger ved siden af bageriet.', k: 'det', en: 'The pharmacy? It is next to the bakery.', why: 'Rule 2: apoteket is an et-word.' },
        { a: 'Mosestenen?', b: 'står på Mosevej.', k: 'den', en: 'The moss stone? It stands on Mosevej.', why: 'Rule 1: mosestenen is an en-word.' },
        { a: 'Boderne på Torvet?', b: 'åbner klokken otte.', k: 'de', en: 'The stalls on the square? They open at eight.', why: 'Rule 3: boderne is plural.' },
        { a: 'Hvor ligger biblioteket? Ved du', b: '? Jeg er ny her.', k: 'det', en: 'Where is the library? Do you know (it)?', why: 'Rule 4: det stands for the whole question.' },
        { a: 'Er der en grønthandler i Mosen? – Ja,', b: 'er der.', k: 'det', en: 'Is there a greengrocer in Mosen? – Yes, there is.', why: 'Rule 4: a short answer: Ja, det er der.' },
        { a: 'Ved siden af grønthandleren ligger', b: 'et hus.', k: 'der', en: 'Next to the greengrocer there is a house.', why: '“There is”: der. Something else came first, so der comes after the verb.' },
        { a: 'Kender du Rodgade? Kofi har boet', b: 'i et år.', k: 'der', en: 'Do you know Rodgade? Kofi has lived there for a year.', why: 'Rule 6: der is a place.' },
        { a: '', b: 'er en god café.', k: 'det', en: 'It is a good café.', why: 'Rule 5: det says what something is.' },
        { a: '', b: 'ligger en bager i Rodgade.', k: 'der', en: 'There is a baker in Rodgade.', why: '“There is”: der ligger.' }
      ]
    }));

    /* ---------- 5 · the corner: words made of words */
    { const k = E.actor('kofi'); k.look = null; k.follow = 'hero'; k.gap = 70; }
    await walk({ to: 4200, hint: 'Walk to the corner of Rodgade and Mosevej  ▶', lights: [[3700, 62, 'hjørnet', 'the corner'], [3950, 150, 'derhenne', 'over there']] });
    const ko = E.actor('kofi'); ko.follow = null; ko.look = 'hero'; look('hero', 'kofi'); cam(4220, 1.08);
    await E.say('kofi', 'Rodgade, Mosevej, Bagerstræde … Alle ord her er lavet af to ord.', { en: 'Rodgade, Mosevej, Bagerstræde … All the words here are made of two words.', pre: 'At the corner, Kofi taps the signpost with his drumstick.', think: '“Lavet af to ord”: made of two words. Root-street. Moss-road. Baker-lane. Danish builds words the way children build towers.' });
    await E.step(() => Gm.teach({
      lab: 'To ord bliver ét', sub: 'compound words', h: 'The last part decides',
      html: `<div class="book">
        <div><span lang="da">${E.fog('rod + gade → Rodgade')}</span><i>root + street</i></div>
        <div><span lang="da">${E.fog('ankomst + hal → en ankomsthal')}</span><i>en hal → en ankomsthal</i></div>
        <div><span lang="da">${E.fog('yndlings + sted → et yndlingssted')}</span><i>et sted → et yndlingssted</i></div></div>
        <p class="hint">The <b>last</b> part decides en or et. The <b>first</b> part takes the stress: <b>YND</b>lingssted, <b>AN</b>komsthal.</p>`
    }));
    await E.step(() => Gm.sortCards({
      lab: 'en eller et?', who: 'kofi', h: 'Look at the last part.',
      groups: [{ k: 'en', label: 'en', small: 'en-word' }, { k: 'et', label: 'et', small: 'et-word' }],
      items: [
        { w: 'yndlingssted', g: 'et', why: 'et sted → et yndlingssted' }, { w: 'ankomsthal', g: 'en', why: 'en hal → en ankomsthal' }, { w: 'mosesten', g: 'en', why: 'en sten → en mosesten' },
        { w: 'træhus', g: 'et', why: 'et hus → et træhus' }, { w: 'ordbog', g: 'en', why: 'en bog → en ordbog' }, { w: 'måneskib', g: 'et', why: 'et skib → et måneskib' },
        { w: 'byport', g: 'en', why: 'en port → en byport' }, { w: 'månelys', g: 'et', why: 'et lys → et månelys' }
      ]
    }));
    await E.converse({
      who: 'kofi', da: 'Hvad er dit yndlingssted i Kronby?', en: 'What is your favourite place in Kronby?',
      pool: ['Mit', 'yndlingssted', 'er', 'caféen.', 'brønden.', 'Den', 'Det', 'De', 'ligger', 'på', 'i', 'Torvet'], ans: 'Mit yndlingssted er caféen. Den ligger på Torvet',
      hint: 'Mit yndlingssted er caféen. Then say where it is: caféen is an en-word, so den.',
      judge: t => {
        if (!has(t, 'yndlingssted')) return { ok: false, who: 'kofi', da: 'Dit yndlingssted? Mit yndlingssted er …', en: 'Your favourite place? My favourite place is …' };
        if (has(t, 'i torvet')) return { ok: false, who: 'kofi', da: 'I Torvet? Nej: på Torvet.', en: 'In the square? No: på Torvet.', fb: 'A torv takes **på**.' };
        if ((has(t, 'caféen') || has(t, 'brønden')) && (has(t, 'det ligger') || has(t, 'de ligger'))) return { ok: false, who: 'kofi', da: 'Caféen, brønden … det er en-ord. Den!', en: 'The café, the well … they are en-words. Den!', fb: 'Rule 1: back to an en-word: **den** ligger.' };
        if (has(t, 'den ligger') && has(t, 'på torvet')) return { ok: true, who: 'kofi', da: has(t, 'brønden') ? 'Brønden! Min også. Den synger, når det regner.' : 'Caféen! Mateo bliver glad. Mit yndlingssted er brønden. Den synger, når det regner.', en: has(t, 'brønden') ? 'The well! Mine too. It sings when it rains.' : 'The café! Mateo will be happy. My favourite place is the well. It sings when it rains.', word: 'yndlingssted' };
        return { ok: false, who: 'kofi', da: 'Og hvor ligger den?', en: 'And where is it?', fb: '… **Den ligger på Torvet.**' };
      }
    });
    await E.say('kofi', 'Lyt! Tre slags a.', { en: 'Listen! Three kinds of a.', think: 'Three kinds of a. One letter, three sounds. Danish spelling is a lottery, and the house always wins.' });
    await E.step(() => Gm.sortCards({
      lab: 'Tre a’er', who: 'kofi', listen: true, h: 'Kofi sings a word. Which a do you hear?',
      groups: [{ k: 'g', label: 'gade', small: 'a long, bright a' }, { k: 'a', label: 'alt', small: 'a short a' }, { k: 'l', label: 'langt', small: 'a deep a' }],
      items: [
        { w: 'gade', g: 'g', en: 'street' }, { w: 'bager', g: 'g', en: 'baker' }, { w: 'lave', g: 'g', en: 'make' },
        { w: 'alt', g: 'a', en: 'everything' }, { w: 'glad', g: 'a', en: 'happy' }, { w: 'kaffe', g: 'a', en: 'coffee' },
        { w: 'langt', g: 'l', en: 'far' }, { w: 'mange', g: 'l', en: 'many', why: 'Before ng, the a goes deep.' }, { w: 'lang', g: 'l', en: 'long', why: 'Before ng, the a goes deep.' }
      ]
    }));

    /* ---------- 6 · a letter to B. */
    await E.say('kofi', 'Her er papir. Skriv til B. Jeg venter ikke. Jeg skal købe kartofler.', { en: 'Here is paper. Write to B. I am not waiting. I need to buy potatoes.', pre: 'He tears a page out of his own notebook, full of drawn drums on the back.', think: 'Potatoes over moral support. Honest man.' });
    stroll('kofi', 4640, 100).then(() => { const k = E.actor('kofi'); if (k) k.flip = 1; });
    const nm = s.name || 'Syv';
    const model = `Kære B.\nJeg hedder ${nm}. Jeg kom til Kronby for to dage siden. Før jeg kom hertil, boede jeg ${cyP}, og ${st ? 'jeg var studerende' : 'jeg arbejdede som ' + jb.da}. Jeg kom hertil, fordi to aliens smed mig ud.\nJeg er glad for Kronby. Der er mange søde mennesker, og der er meget liv på Torvet. Jeg vil gerne leje værelset.\nMange hilsner\n${nm}`;
    const letter = await E.step(() => Gm.writeTask({
      lab: 'Et brev til B.', sub: 'a letter', ph: 'Kære B. …', model, modelWho: 'An example',
      hint: 'Write to B. Who are you? What did you do before, and why did you come? When did you come? What do you like here? Begin and end like a letter.',
      checks: [
        { f: (r, l) => / kære | hej /.test(l), t: () => 'Begin: Kære B.' },
        { f: (r, l) => / (boede|arbejdede|var|kom|læste|studerede|flyttede|faldt) /.test(l), t: () => 'Your past: boede, arbejdede, var, kom …' },
        { f: (r, l) => / fordi | for at | på grund af /.test(l), t: () => 'Why you came: fordi, for at or på grund af' },
        { f: (r, l) => / siden | i går /.test(l), t: () => 'When you came: for … siden, or i går' },
        { f: (r, l) => / glad for | kan godt lide | kan lide | mange | meget /.test(l), t: () => 'What you like: glad for, kan godt lide, mange, meget' },
        { f: (r, l) => / hilsen | hilsner /.test(l), t: () => 'End: Mange hilsner' }
      ],
      warn: (r, l) => / mange (larm|lys|liv|luft|mos) /.test(l) ? 'mange + things you can count. Larm, lys, liv: meget.' : / meget (mennesker|butikker|huse|lamper) /.test(l) ? 'meget + things you can’t count. People, shops: mange.' : / i mosevej | på rodgade /.test(l) ? 'på Mosevej, i Rodgade.' : ''
    }));
    mem().letter = letter; E.save();
    E.gainPower(8); E.castAnim('brev');

    /* ---------- 7 · Mosevej number 5 */
    await seek({ doors: MV, want: 'm5', hint: 'Find the house: Mosevej nummer 5', clue: 'Mosevej nummer 5, lige overfor mosestenen.', min: 4150, max: 5500, wrong: id => id === 'm3' ? 'The greengrocer. Kofi is arguing with a cabbage. The house is next door.' : null });
    E.mood('tender', { birds: 0.2 });
    await E.tell([['n', 'You slide the letter into the box. For a moment, nothing. Then footsteps inside, coming down a staircase, slowly, as if someone has been watching the street from a window for a long time. The door opens.']]);
    enterAs('birk', 4900, { flip: 1, o: Object.assign({}, A.NPC.birkHome) });
    E.SFX.door(); look('hero', 'birk'); cam(4890, 1.15);
    await E.say('birk', 'Det er dig.', { en: 'It’s you.', pre: 'Birk. No armour, no spear. Your letter in her hand.', think: '“Det er dig.” Rule five, I think: det says what something is. In this case: me.' });
    const c1 = await E.choose({ who: 'birk', da: 'Det er dig.', en: 'It’s you.', opts: ['You’re “B”?', 'You have a room to rent?'] });
    await E.say('birk', ['Ja. B for Birk. Jeg skriver ikke så godt.', 'Ja. Jeg skrev sedlen. Jeg skriver ikke så godt.'][c1], { en: ['Yes. B for Birk. I don’t write very well.', 'Yes. I wrote the note. I don’t write very well.'][c1], think: 'Not a vampire, then. Just a warrior with bad handwriting.' });
    await E.say('birk', 'Du skriver bedre end mig.', { en: 'You write better than me.', narr: 'She folds your letter very carefully and puts it in her pocket.' });
    await E.say('birk', 'Det var mors værelse.', { en: 'It was Mum’s room.', pre: 'She steps aside. Behind her, a staircase, and at the top an open door with a window full of moss-light.', think: 'Asta’s room. She is renting me her mother’s room. I don’t know what to say, so for once I don’t.' });
    await E.step(() => Gm.chooseOne({ html: `<div class="memory"><div class="who">Birk</div><p class="da" lang="da">${E.fog('Vil du bo her?')} ${Gm.sayBtn('Vil du bo her?', 'birk')}</p></div>`, say: 'Vil du bo her?', who: 'birk', opts: ['Ja, det vil jeg gerne.', 'Ja, det gør jeg gerne.', 'Ja, jeg vil gerne det.'], a: 0, da: true, why: 'Vil du …? – Ja, det vil jeg gerne.', tip: 'Short answer: det + the same verb. Vil du …? – Ja, det vil jeg …' }));
    await E.say('birk', 'Godt. Men jeg laver ikke mad.', { en: 'Good. But I don’t cook.', think: 'A flatmate with a spear who doesn’t cook. I have had worse flatmates. I think. I can’t remember. That’s probably a mercy.' });

    /* ---------- 8 · the swarm */
    await fadeTo(async () => {
      WLD().enter({ map: 'town', tod: 'dusk', dusk: 0.9, where: 'Kronby · Torvet', cast: [{ k: 'hero', wx: T.CAFE + 10 }, npc('mateo', T.CAFE - 40), npc('ruth', T.CAFE - 110), npc('noor', T.CAFE + 80, { flip: 1 }), npc('kofi', T.CAFE + 150, { flip: 1 })] });
      cam(T.CAFE + 30, 0.98); E.mood('town', { crickets: 0.3 });
    }, 1.2);
    await E.tell([['n', 'Evening at Mateo’s café. Word has travelled: the new one has a room. In Mosen. At Birk’s.'], ['d:mateo', 'Skål! For {navn} og det nye værelse!', 'Cheers! To {navn} and the new room!']]);
    await E.say('ruth', 'Og tak for medicinen. Mit knæ siger også tak.', { en: 'And thanks for the medicine. My knee says thanks too.' });
    await E.say('noor', 'Og skål for skibet! Om seks dage!', { en: 'And cheers to the ship! In six days!', think: 'Nobody drinks to that one. Ruth looks at her cup. Noor doesn’t notice.' });
    E.hidePanel(); E.SFX.alarm(); E.mood('alarm', { wind: 0.05 }); G.shake = { t0: E.clock(), dur: 0.6, amp: 0.5 };
    await E.wait(700);
    await E.tween(G, 'blackout', 1, 1.2);
    G.drones = [{ wx: T.CAFE - 380, y: 140, len: 460, sweep: 0.3, sc: 1.2 }, { wx: T.CAFE + 420, y: 120, len: 460, sweep: -0.3, sc: 1.2 }, { wx: T.CAFE + 60, y: 40, len: 500, sweep: 0, sc: 1.4 }];
    G.drones.forEach((D, i) => { E.tween(D, 'y', 230 + i * 30, 2.4); E.tween(D, 'wx', D.wx + (i === 0 ? 200 : i === 1 ? -200 : 30), 2.6); });
    E.SFX.drone();
    await E.tell([['n', 'A horn sounds from the gate: one long note, then three short. Every lamp in Kronby goes out at once, as if someone had blown on the whole town. And out of the dark, from every direction, the amber eyes come.'], ['t', '“Send the swarm tomorrow night.” I didn’t hear them say it. I know it anyway.']]);
    enterAs('birk', T.CAFE - 520, { look: 'hero', o: dark(Object.assign({}, A.NPC.birk)) });
    await stroll('birk', T.CAFE - 90, 260);
    await E.say('birk', 'Dronerne! Alle til biblioteket! Ned i kælderen! Kælderen er sikker!', { en: 'The drones! Everyone to the library! Down into the cellar! The cellar is safe!', think: '“Kælderen er sikker”: the cellar is safe. The library is in Rodgade. I know where it is. I am, God help me, the person who knows the way.' });
    await E.say('birk', 'Du kender Rodgade. Før dem derhen! Og du lyser. Sluk!', { en: 'You know Rodgade. Lead them there! And you are glowing. Turn it off!' });
    await E.converse({
      who: 'birk', da: 'Du lyser. Sluk!', en: 'You are glowing. Turn it off!', pool: ['mørke', 'lys', 'mørk', 'stille'], ans: 'mørke', noBurst: true,
      hint: 'Your first word on this moon: darkness.',
      judge: t => /\bm[øo]rke/.test(t) ? { ok: true, who: 'birk', da: 'Godt. Løb!', en: 'Good. Run!' } : { ok: false, who: 'birk', da: 'Mørke! Nu!', en: 'Darkness! Now!' }
    });
    E.hidePanel(); E.tween(G, 'glow', 0.12, 0.8);
    G.night = true; G.glow = 0.12;
    ['mateo', 'ruth', 'noor', 'kofi', 'birk'].forEach(id => { const a = E.actor(id); if (a) a.o = dark(Object.assign({}, A.NPC[id])); });
    ['mateo', 'ruth', 'kofi'].forEach((id, i) => { const a = E.actor(id); a.look = null; WLD().walk(id, 3560 + i * 30, 170 + i * 20).then(() => { a.hidden = true; }); });
    { const n = E.actor('noor'); n.look = null; WLD().walk('noor', T.CAFE - 300, 120).then(() => { n.hidden = true; }); }
    { const b = E.actor('birk'); b.look = null; WLD().walk('birk', 2400, 240).then(() => { b.hidden = true; }); }

    /* Ebbe */
    enterAs('ebbe', 2610, { o: dark(Object.assign({}, A.NPC.ebbe)), look: null, flip: 1 });
    G.drones.forEach(D => { D.wx += 900; });
    WLD().WD.speed = 210;
    await walk({ to: 2540, hint: 'Run to Rodgade!  ▶' });
    look('ebbe', 'hero'); look('hero', 'ebbe'); cam(2600, 1.08);
    await E.step(() => Gm.chooseOne({ lab: 'Ebbe råber', sub: 'Ebbe shouts', html: `<div class="memory"><div class="who">Ebbe</div><p class="da" lang="da">${E.fog('Jeg kan ikke se noget! Hvor ligger biblioteket?')} ${Gm.sayBtn('Hvor ligger biblioteket?', 'ebbe')}</p></div>`, say: 'Jeg kan ikke se noget! Hvor ligger biblioteket?', who: 'ebbe', ms: 9000, opts: ['Det ligger ved siden af slagteren.', 'Den ligger ved siden af slagteren.', 'Det ligger i Mosen.'], a: 0, da: true, why: 'Biblioteket is an et-word: det. And it is next to the butcher, in Rodgade.', tips: { 1: 'biblioteket is an et-word. Rule 2.', 2: 'The library is in Rodgade, not in Mosen.' }, slow: 'Too slow! Ebbe is running in circles. Again!' }));
    await E.say('ebbe', 'Ved siden af slagteren. Tak!', { en: 'Next to the butcher. Thanks!' });
    { const eb = E.actor('ebbe'); eb.look = null; stroll('ebbe', 3595, 190).then(() => { eb.hidden = true; }); }

    /* Vibeke and Tove */
    enterAs('vibeke', 2860, { o: dark(Object.assign({}, A.NPC.vibeke)), look: null, flip: 1 });
    await stroll('vibeke', 2700, 200); look('vibeke', 'hero'); cam(2660, 1.1);
    await E.say('vibeke', 'Tove! Min datter! Hun er væk!', { en: 'Tove! My daughter! She is gone!', pre: 'A woman comes running out of the dark, without a coat, without shoes.' });
    await E.converse({
      who: 'vibeke', da: 'Hun er væk!', en: 'She is gone!', pool: ['Hvor', 'bor', 'du', 'Hvad', 'Hvornår', 'er'], ans: 'Hvor bor du', silent: true,
      hint: 'Ask where she lives: Hvor bor du?',
      judge: t => has(t, 'hvor bor du') ? { ok: true, who: 'vibeke', da: 'I nummer 5! Mellem apoteket og boghandlen! Måske er hun hjemme!', en: 'At number 5! Between the pharmacy and the bookshop! Maybe she is at home!', word: 'hvor' } : { ok: false, who: 'vibeke', da: 'Hvad? Hurtigt!', en: 'What? Quickly!' }
    });
    E.actor('vibeke').look = null; stroll('vibeke', 3595, 150).then(() => { const v = E.actor('vibeke'); if (v) v.hidden = true; });
    await seek({ doors: RG, want: 'r5', hint: 'Find Tove: nummer 5, mellem apoteket og boghandlen', clue: 'nummer 5, mellem apoteket og boghandlen.', min: 2480, max: 3700, wrong: id => `That’s ${NAME[id] || 'the wrong door'}. It’s dark, everything looks the same, and somewhere a drone is humming.` });
    enterAs('tove', 3010, { sc: 0.64, o: dark(Object.assign({}, A.NPC.tove)) });
    await E.say('tove', 'Mor?', { en: 'Mum?', pre: 'The door of number 5 is open. Behind it, under a table, two very big eyes.' });
    await E.converse({
      who: 'tove', da: 'Hvor er mor?', en: 'Where is Mum?', pool: ['Kom', 'med', 'mig', 'Din', 'mor', 'er', 'på', 'biblioteket', 'Mosen'], ans: 'Kom med mig. Din mor er på biblioteket',
      hint: 'Kom med mig. Din mor er på biblioteket.',
      judge: t => has(t, 'biblioteket') ? { ok: true, who: 'tove', da: 'Biblioteket? Det kender jeg! Det ligger ved siden af slagteren!', en: 'The library? I know it! It is next to the butcher!', word: 'kom med mig' } : has(t, 'mosen') ? { ok: false, who: 'tove', da: 'I Mosen? Nej! Mor sagde biblioteket!', en: 'In Mosen? No! Mum said the library!' } : { ok: false, who: 'tove', da: 'Hvor er mor?', en: 'Where is Mum?' }
    });
    { const tv = E.actor('tove'); tv.look = null; tv.follow = 'hero'; tv.gap = 50; }
    await seek({ doors: RG, want: 'r11', hint: 'To the library!', clue: 'biblioteket ligger ved siden af slagteren.', min: 2900, max: 3900 });
    await E.tell([['n', 'The library door opens a crack. A hand pulls Tove inside, and you hear Vibeke say her name, over and over, the way you say a word you never want to lose.']]);
    { const tv = E.actor('tove'); tv.follow = null; tv.hidden = true; }

    /* Noor */
    E.mood('dread', { wind: 0.05 });
    enterAs('noor', 3430, { o: dark(Object.assign({}, A.NPC.noor)), look: null });
    G.drone = { wx: 3860, y: 110, len: 520, sweep: 0, alert: 0, sc: 1.6 };
    E.tween(G.drone, 'y', 230, 2); cam(3720, 1);
    await stroll('noor', 3730, 220);
    await E.say('noor', 'Skibet er her! Det tager mig hjem!', { en: 'The ship is here! It is taking me home!', pre: 'Someone runs past you, toward the drones. A bag over her shoulder. Packed. Very neatly.' });
    const c2 = await E.choose({ narr: 'Noor is running straight into the light.', opts: ['“Noor, stop! It’s not going home!”', 'Run after her and grab her arm'] });
    E.hidePanel();
    if (c2 === 1) { await stroll('hero', 3680, 230); }
    await stroll('noor', 3855, 150);
    G.drone.alert = 1; E.SFX.beam(); E.tween(G.drone, 'sweep', 0, 0.3);
    const nr = E.actor('noor');
    nr.alpha = 1; nr.wy = 0; E.tween(nr, 'alpha', 0, 2.6); await E.tween(nr, 'wy', -300, 2.6, 'in'); nr.hidden = true;
    E.tween(G.drone, 'y', -100, 2.4); E.tween(G.drone, 'wx', 4300, 2.4);
    await E.tell([['n', ['Your voice disappears in the hum. She doesn’t turn around.', 'Your fingers close on her sleeve, and then on nothing.'][c2] + ' The beam turns from amber to white. Noor rises into it, bag and all, very slowly, and she is smiling.'], ['t', 'She thinks she is going home. She packed so neatly.']]);
    G.drone = null;
    enterAs('birk', 4300, { o: dark(Object.assign({}, A.NPC.birk)), look: 'hero' });
    await stroll('birk', 3800, 260);
    await E.say('birk', 'Kom! Mit hus! Nu!', { en: 'Come! My house! Now!', pre: 'Birk comes out of the dark and grabs your jacket.' });
    { const b = E.actor('birk'); b.look = null; b.follow = 'hero'; b.gap = 70; }
    await seek({ doors: MV, want: 'm5', hint: 'Run to Birk’s house: Mosevej 5', clue: 'Mosevej nummer 5, lige overfor mosestenen.', min: 3700, max: 5500 });

    /* inside, in the dark */
    E.hidePanel(); await E.tween(G, 'fade', 1, 0.8);
    G.cast.forEach(a => { a.hidden = true; }); G.drones = null; G.drone = null;
    await E.tween(G, 'fade', 0.86, 0.6); E.mood('tender', { wind: 0.04 });
    await E.tell([['n', 'Birk’s house. Shutters closed, no light. You sit on the floor with your backs against the door and listen to the drones pass over the roof, again and again, like someone patting their pockets for keys.']]);
    await E.say('birk', 'De tog Noor.', { en: 'They took Noor.' });
    await E.say('birk', 'Hun troede, skibet tog hende hjem.', { en: 'She thought the ship would take her home.', think: '“Hun troede”: she believed. Past tense. Already past tense.' });
    await E.say('birk', 'Mor er væk. Nu er Noor væk.', { en: 'Mum is gone. Now Noor is gone.' });
    await E.converse({
      who: 'birk', da: 'Mor er væk. Nu er Noor væk.', en: 'Mum is gone. Now Noor is gone.', pool: ['Du', 'er', 'ikke', 'alene', 'Jeg', 'mørke', 'væk'], ans: 'Du er ikke alene', silent: true,
      hint: 'The words you heard on the ship. The words her mother said to everyone.',
      judge: t => has(t, 'ikke alene') ? { ok: true, who: 'birk', da: '… Det sagde mor altid.', en: '… Mum always said that.', word: 'ikke alene' } : { ok: false, who: 'birk', da: '…', en: '…', fb: 'Say what the voice said: Du er ikke alene.' }
    });
    await E.tell([['n', 'Birk doesn’t say anything else. After a while her head rests against your shoulder, on the side where the crystal is, and the crystal is quiet, for once.']]);

    /* ---------- 9 · morning, and the council */
    WLD().WD.speed = 150;
    await fadeTo(async () => {
      WLD().enter({ map: 'town', tod: 'dawn', where: 'Kronby · Torvet', cast: [{ k: 'hero', wx: T.CAFE + 120 }, npc('holm', T.CAFE + 230, { flip: 1 }), npc('ruth', T.CAFE + 40), npc('kofi', T.CAFE - 30), npc('mateo', T.CAFE - 90), npc('birk', T.CAFE + 330, { flip: 1, look: 'holm' })] });
      cam(T.CAFE + 120, 0.98); E.mood('dawn', { wind: 0.02 });
    }, 1.6);
    await E.tell([['n', 'Morning. The square is full. Nobody slept. Ruth counts heads, and stops at one too few.']]);
    await E.say('holm', 'Hør! Kronbys råd siger: Fra i dag skal alle fremmede arbejde for byen.', { en: 'Listen! Kronby’s council says: from today all strangers must work for the town.', pre: 'Holm climbs onto the rim of the well with a scroll.' });
    await E.say('holm', 'Byen bygger et skjold. Et skjold af ord. Alle skal hjælpe.', { en: 'The town is building a shield. A shield of words. Everyone must help.', think: '“Et skjold af ord”: a shield of words. Of course. On this moon, even the walls are grammar. And apparently, tomorrow, I get a job.' });

    /* ---------- the ship */
    await fadeTo(async () => {
      setScene('ship', { feet: 664, maxLift: 200, where: 'Kurator-skibet', g: { progress: 68, anomaly: 1 }, cast: [{ id: 'vex', k: 'kurator', wx: 150, o: { point: 1 }, flip: 1 }, { id: 'plink', k: 'kurator', wx: 40, o: { small: 1, tablet: 1, robe: '#9fb39a', ph: 1.3 } }] });
      G.view = { x: 64, z: 1 }; E.mood('dread', { hum: 0.05 });
    }, 1.2);
    await E.tell([['a:plink', 'The swarm is back. One specimen collected.'], ['a:vex', 'The anomaly?'], ['a:plink', 'No. A young woman. Human. She keeps asking when the ship goes home.']]);
    await E.tell([['a:vex', 'Put her with the other one.'], ['a:plink', 'With… the voice?'], ['a:vex', 'Let them keep each other quiet.']]);
    E.hidePanel(); G.glitch = { t0: E.clock(), dur: 1.4 }; await E.wait(900);
    await E.tween(G, 'fade', 0.92, 1);
    await E.tell([['n', 'Somewhere deep in the ship, behind a door with no handle, two voices in the dark.'], ['d:noor', 'Hallo? Er der nogen?', 'Hello? Is anyone there?'], ['d:stemme', 'Ja. Du er ikke alene.', 'Yes. You are not alone.']]);
    await E.tell([['d:noor', 'Hvem er du?', 'Who are you?'], ['d:stemme', 'Jeg hedder Asta.', 'My name is Asta.']]);

    /* ---------- the end of the section, and of the chapter */
    S().prog.k1a3 = 1; S().day = 3; E.cpEnd();
    E.hidePanel();
    await Gm.endCard({
      k: 'Kapitel 1 · Afsnit 3', title: 'Bydel', line: 'You found a room, a street and a way through the dark. The swarm took Noor, and up on the ship, Asta has found her. Kapitel 1 is over. In Kapitel 2, Kronby puts you to work.',
      learned: [
        'Shops and places: <b>en bager → bageren</b>, <b>et apotek → apoteket</b>. New: en/et. Known: -en/-et.',
        'Where things are: <b>ved siden af</b>, <b>overfor</b>, <b>mellem</b>, <b>tæt på</b>, <b>ikke så langt fra</b>, <b>på hjørnet af</b> · <b>lige</b> makes it exact.',
        '<b>i</b> Rodgade (-gade, -stræde, a town) · <b>på</b> Mosevej (-vej, plads, torv).',
        '<b>den</b> (en-word) · <b>det</b> (et-word, a sentence, “it is”) · <b>de</b> (plural) · <b>der</b> (there, there is).',
        'Short answers: <b>Ja, det er jeg. Ja, det gør jeg. Jo, det har jeg.</b>',
        '<b>mange</b> + things you can count, <b>meget</b> + things you can’t · compounds: the last part decides en/et.',
        'The three a’s in <b>gade</b>, <b>alt</b> and <b>langt</b>, and how to write a letter: <b>Kære …</b> · <b>Mange hilsner</b>.'
      ]
    });
    E.next('k2a1');
  }

  E.chapter({ id: 'k1a3', k: 'k1', kTitle: 'Kapitel 1 · Ankomsten', title: 'Afsnit 3 · Bydel', label: 'Kapitel 1 · Bydel', run });
})();
