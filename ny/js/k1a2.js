/* Dumpet på Måne Syv · Kapitel 1 · Afsnit 2 · Hvor længe? */
(function () {
  'use strict';
  const E = window.E, A = window.Art, G = E.G, Gm = window.Games, K = window.K1;
  const S = () => E.S();
  const { setScene, fadeTo, go, has, cam, camFree, mem, CITIES, JOBS } = K;
  const WLD = () => window.World, T = A.TOWN;

  /* ---------------- voices and names */
  Object.assign(E.SPK, {
    ruth: { name: 'Ruth', sub: 'en af de faldne', voice: [0.88, 1.15] },
    noor: { name: 'Noor', sub: 'en af de faldne', voice: [1.08, 1.25] },
    mateo: { name: 'Mateo', sub: 'caféen på torvet', voice: [0.95, 0.85] },
    kofi: { name: 'Kofi', sub: 'musiker', voice: [1, 0.78] },
    seddel: { name: 'En seddel', sub: 'a note', voice: [0.95, 1.1] }
  });
  Object.assign(E.IRONY, {
    ruth: ['Skat, sig det bare sådan her:', 'Ruth pats your hand, the way you pat a slow but lovable dog.'],
    noor: ['Hurtigt, jeg skal pakke! Sig:', 'Noor doesn’t even look up from her bag.'],
    mateo: ['Min kaffe bliver kold. Sig:', 'Mateo sighs into his towel.'],
    kofi: ['Lyt til rytmen. Sig:', 'Kofi drums it for you, one beat per word.']
  });

  /* ---------------- every Danish word in this section can be tapped */
  E.addGloss({
    // time: when, and how long
    'hvornår': 'when? (a question)', 'da': 'when (one time, in the past)', 'når': 'when (in the future, or every time)', 'hvor længe': 'how long', 'længe': 'long (time)', 'for': 'for; because (for … siden = … ago)', 'om': 'about; in (om syv dage = in seven days)', 'i': 'in; for (i syv dage = for seven days)',
    'dag': 'day', 'dage': 'days', 'uge': 'week', 'uges': 'week’s', 'måned': 'month', 'måneder': 'months', 'måneds': 'month’s', 'år': 'year, years', 'tid': 'time', 'halvt': 'half', 'et halvt år': 'half a year', 'halvandet': 'one and a half', 'halvandet år': 'a year and a half', 'et par': 'a couple of', 'par': 'pair, couple',
    'i går': 'yesterday', 'i forgårs': 'the day before yesterday', 'i dag': 'today', 'i morgen': 'tomorrow', 'i nat': 'tonight; last night', 'hver morgen': 'every morning', 'hver': 'every',
    'for en dag siden': 'a day ago', 'for fem år siden': 'five years ago', 'for 23 år siden': '23 years ago', 'for tre år siden': 'three years ago', 'for et år siden': 'a year ago', 'for halvandet år siden': 'a year and a half ago', 'for syv dage siden': 'seven days ago', 'for en uge siden': 'a week ago', 'for over 20 år siden': 'more than 20 years ago', 'over': 'over, more than',
    'om syv dage': 'in seven days', 'om en uge': 'in a week', 'om en uges tid': 'in about a week', 'om et år': 'in a year', 'om et års tid': 'in about a year', 'om 23 år': 'in 23 years', 'års': 'year’s',
    'i syv dage': 'for seven days', 'i et år': 'for a year', 'i to år': 'for two years', 'i et par måneder': 'for a couple of months', 'i to et halvt år': 'for two and a half years', 'i en måneds tid': 'for about a month', 'i 23 år': 'for 23 years',
    'hele livet': 'all my life, my whole life', 'livet': 'the life', 'har været': 'has been, have been', 'været': 'been', 'har været her': 'have been here', 'siden i går': 'since yesterday',
    'det ved jeg ikke': 'I don’t know (that)', 'det ved jeg ikke endnu': 'I don’t know yet', 'det ved ingen': 'nobody knows', 'det kommer an på': 'it depends on', 'kommer an på': 'depends on', 'an': 'on (in: kommer an på = depends on)', 'endnu': 'yet, still',
    'fortid': 'the past', 'fremtid': 'the future', 'fortiden': 'the past', 'tidslinjen': 'the timeline', 'stempler': 'stamp(s) (with a stamp)', 'stemplet': 'the stamp',
    // the town
    'ankomsthallen': 'the arrivals hall', 'ankomstbogen': 'the arrivals book', 'bogen': 'the book', 'bog': 'book', 'tavlen': 'the board', 'tavle': 'board', 'råd': 'council; advice', 'kronbys råd': 'Kronby’s council', 'hus': 'house', 'et hus': 'a house', 'hallen': 'the hall', 'torvet': 'the square (market place)', 'caféen': 'the café', 'café': 'café', 'brønden': 'the well', 'kaffe': 'coffee', 'kaffen': 'the coffee', 'te': 'tea (also: the past ending -te)', 'regn': 'rain', 'regnen': 'the rain', 'regner': 'rains, is raining', 'det regner': 'it is raining', 'havet': 'the sea', 'hav': 'sea', 'maden': 'the food', 'familie': 'family', 'min familie': 'my family', 'gaden': 'the street', 'på gaden': 'in the street', 'musik': 'music', 'tromme': 'drum', 'trommen': 'the drum', 'tryk': 'stress, emphasis', 'trykket': 'the stress', 'toner': 'notes, tones', 'tre toner': 'three notes', 'notesbog': 'notebook', 'notesbogen': 'the notebook', 'seddel': 'note (a piece of paper)', 'en seddel': 'a note', 'kappe': 'cloak', 'kappen': 'the cloak', 'våd': 'wet', 'kisten': 'the chest', 'navnene': 'the names', 'navnet': 'the name', 'små ord': 'little words', 'de små ord': 'the little words',
    'den lange nat': 'the Long Night', 'lange': 'long (the …)', 'lang': 'long', 'faldne': 'fallen', 'de faldne': 'the fallen (people who fell from the sky)', 'faldt ned': 'fell down', 'faldet ned': 'fallen down', 'faldet': 'the fall; fallen', 'himlen': 'the sky', 'fra himlen': 'from the sky', 'ned fra himlen': 'down from the sky', 'jorden': 'the Earth', 'fra jorden': 'from the Earth', 'på jorden': 'on the Earth',
    'skotland': 'Scotland', 'valparaíso': 'Valparaíso (a port city in Chile)', 'glasgow': 'Glasgow', 'spansk': 'Spanish', 'tredive': 'thirty', 'seksten': 'sixteen', 'tyve': 'twenty',
    // people
    'ruth': 'Ruth (a name)', 'noor': 'Noor (a name)', 'mateo': 'Mateo (a name)', 'kofi': 'Kofi (a name)', 'veninde': 'friend (a woman)', 'bedste veninde': 'best friend (a woman)', 'den nye': 'the new one', 'nye': 'new (plural, the …)', 'alle nye': 'all new people', 'skat': 'darling, dear', 'løgner': 'liar', 'elev': 'student, pupil', 'musiker': 'musician', 'mange': 'many', 'de andre': 'the others', 'andre': 'other(s)', 'alle sammen': 'everyone, all of you',
    // verbs
    'savne': 'miss (someone, something)', 'savner': 'miss(es) (now)', 'savnede': 'missed', 'blive': 'stay; become', 'bliver': 'stays; becomes', 'bliv': 'stay!', 'bliv stille': 'stay still', 'rejser': 'travel(s); go(es)', 'rejser hjem': 'goes home, is going home', 'rejse hjem': 'go home, travel home', 'forsvandt': 'disappeared', 'forsvinder': 'disappears', 'lever': 'is alive, lives', 'henter': 'fetch(es), pick(s) up', 'henter vi': 'we fetch', 'leder efter': 'is looking for', 'sluk': 'turn off!', 'sluk lyset': 'turn off the light', 'behold': 'keep!', 'behold den': 'keep it', 'skjuler': 'hides', 'ville have': 'would want', 'sådan': 'like that, that way', 'ville have det sådan': 'would want it that way', 'hør': 'listen!', 'pakker': 'packs, is packing', 'pakke': 'pack', 'drikker': 'drinks', 'lytter': 'listen(s)', 'lyttede': 'listened', 'spillede': 'played', 'spiller': 'plays', 'tager': 'take(s)', 'tager os hjem': 'takes us home', 'hørte': 'heard', 'sætte': 'put', 'sætte dem tilbage': 'put them back', 'skrev': 'wrote', 'sorterer': 'sort(s)', 'mangler': 'is missing, lacks', 'tænk': 'think!', 'lyver': 'lie(s), tell(s) lies', 'start': 'start!', 'start med mig': 'start with me', 'spørg': 'ask!', 'spørg mig': 'ask me', 'spørg bare': 'just ask', 'fortæl': 'tell!', 'er sket': 'has happened', 'sket': 'happened', 'starter': 'start(s)', 'kalder os': 'call ourselves', 'jagede': 'hunted, chased', 'pakker sin taske': 'is packing her bag', 'gjorde': 'did', 'kan godt': 'can (really)', 'det kan jeg godt forstå': 'I can understand that', 'forstå': 'understand', 'viser': 'show(s)', 'gør': 'does, makes', 'gør lyset mørkt': 'makes the light dark',
    // small words
    'gerne': 'gladly (vil gerne = would like to)', 'stadig': 'still', 'også': 'also, too', 'altid': 'always', 'desværre': 'unfortunately', 'kun': 'only', 'nogle gange': 'sometimes', 'nogle': 'some', 'gange': 'times', 'efter': 'after', 'efter mig': 'after me', 'ingen': 'nobody, no one; no', 'aldrig': 'never', 'man': 'one, you, people', 'her er man aldrig alene': 'here you are never alone', 'ved': 'by, at; know(s)', 'ved brønden': 'by the well', 'ved havet': 'by the sea', 'ved ovnen': 'by the stove', 'ovnen': 'the stove', 'nå': 'well, so', 'ikke rigtigt': 'not really', 'meget': 'very, much', 'ja meget': 'yes, very', 'næsten som': 'almost like', 'én': 'one', 'én gang': 'once, one time', 'en gang': 'once', 'så': 'so, then', 'så kom her': 'then come here', 'tur': 'turn; trip', 'din tur': 'your turn', 'det er din tur': 'it’s your turn', 'nu er det din tur': 'now it’s your turn', 'noget': 'something', 'om noget': 'about something', 'bange': 'afraid', 'glad': 'happy, glad', 'glad for': 'happy with, glad about', 'glad for at være her': 'happy to be here', 'hurtigt': 'fast', 'rigtigt': 'right, correct', 'smukt': 'beautiful', 'stor': 'big', 'en stor en': 'a big one', 'mørkt': 'dark', 'det bliver mørkt': 'it gets dark', 'inde': 'inside', 'være inde': 'be inside', 'hos': 'at (someone’s place), with', 'hos holm': 'with Holm, at Holm’s', 'alene': 'alone', 'ikke alene': 'not alone', 'først': 'first', 'men først': 'but first', 'god': 'good', 'en god løgner': 'a good liar', 'lille': 'small, little', 'mere': 'more', 'mere end': 'more than', 'helt': 'completely', 'trist': 'sad', 'træt': 'tired',
    // games and labels
    'allerede': 'already', 'byen': 'the town', 'e': 'the vowel e', 'æ': 'the vowel æ', 'kold': 'cold', 'bliver kold': 'gets cold', 'læs': 'read!', 'læs tavlen': 'read the board', 'r': 'the letter r', 'med r': 'with an r', 'regnede': 'rained', 'rytmen': 'the rhythm', 'skriver': 'write(s), am writing', 'jeg skriver': 'I write, I’ll write',
    'plads': 'place, seat', 'på plads to': 'in second place', 'der er du': 'there you are', 'vide': 'know', 'hvad vil du vide': 'what do you want to know', 'præcis': 'exactly', 'det hele': 'all of it', 'hel': 'whole', 'hel igen': 'whole again', 'mærkelig': 'strange', 'dit job': 'your job', 'mit job': 'my job', 'din seng': 'your bed', 'min seng': 'my bed', 'kom her': 'come here', 'så er vi to': 'then there are two of us',
    'hvem skrev det': 'who wrote it', 'den våde bog': 'the wet book', 'notesbog': 'notebook', 'find nogen, der': 'find someone who', 'find nogen der': 'find someone who', 'nogen': 'someone, anyone', 'for langsomt': 'too slow', 'kernen': 'the Kernel (the crystal inside you)', 'der': 'who, that; there', 'skriv i ankomstbogen': 'write in the arrivals book', 'fællesskab': 'community'
  });

  /* ---------------- helpers */
  const hero = () => E.actor('hero');
  const look = (id, at) => { const a = E.actor(id); if (a) a.look = at; };
  const night = o => A.nightify(o, 0.25);
  const npc = (id, wx, x) => Object.assign({ id, k: 'npc', wx, o: Object.assign({}, A.NPC[id]), look: 'hero' }, x || {});
  // a character enters again: the old one (maybe hidden somewhere) is replaced
  const enterAs = (id, wx, x) => { G.cast = G.cast.filter(a => a.id !== id); G.cast.push(npc(id, wx, x)); };
  const stroll = (id, to, sp) => { E.hidePanel(); return WLD().walk(id, to, sp); };
  async function walk(o) { const h = hero(); if (h) h.look = null; camFree(); await go(o); }
  // the hero's own memories, from the wreck (or a default, if this section was opened first)
  const city = () => mem().city || CITIES[0], job = () => mem().job || JOBS[0];
  // when-sentences: is the verb in the right place after a når/da-sentence?
  function whenOrder(t) {
    const w = t.split(' '), sv = w.indexOf('savner');
    if (w[0] === 'da') return { bad: 'da is for one time in the past. You miss it again and again: **når**.' };
    if (w[0] === 'hvornår') return { bad: 'hvornår only asks. Here you answer: **når** …' };
    if (w[0] === 'når') {
      if (sv < 0) return { bad: 'And then? …, **savner jeg** …' };
      if (w[sv + 1] === 'jeg') return { ok: 'inv' };
      if (w[sv - 1] === 'jeg') return { bad: 'After a når-sentence the verb comes first: …, **savner jeg** det.' };
      return { bad: 'After the når-sentence: **savner jeg** …' };
    }
    if (w[0] === 'jeg' && w[1] === 'savner' && w.includes('når')) return { ok: 'norm' };
    return { bad: 'Start with **Når** …: Når jeg er alene, savner jeg …' };
  }

  async function run() {
    E.cpStart('k1a2-1');
    const s = S(), X = A.WX;
    if (!s.mem) s.mem = {};

    /* ---------- 1 · the gate, the same night */
    s.day = 1;
    setScene('world', {});
    WLD().enter({
      night: true, where: 'Måne Syv · Kronby',
      cast: [{ k: 'hero', wx: X.GATE_X - 24 }, { id: 'birk', k: 'npc', wx: X.GATE_X - 70, o: night(Object.assign({}, A.NPC.birk)), look: 'hero' }, { id: 'holm', k: 'npc', wx: X.GATE_X + 104, o: night(Object.assign({}, A.NPC.holm)), flip: 1, look: 'hero' }]
    });
    G.glow = 0.6; cam(X.GATE_X - 10, 1);
    E.mood('night', { wind: 0.03, crickets: 0.4 });
    G.fade = 1; E.tween(G, 'fade', 0, 1.6);
    await E.tell([
      ['n', 'Night falls on Kronby like a lid. The gate lanterns hiss. Birk is still holding the collar of the coat, as if letting go would make it disappear.'],
      ['t', '“Min mors frakke.” Her mother’s coat. I have been wearing a missing woman’s coat all day, and complaining about the sleeves.']
    ]);
    E.hidePanel(); E.SFX.drone(); E.mood('hunt', { wind: 0.04 });
    G.drone = { wx: X.GATE_X + 520, y: 150, len: 460, sweep: -0.3, alert: 0, sc: 1.6 };
    E.tween(G.drone, 'wx', X.GATE_X + 260, 3); E.tween(G.drone, 'y', 250, 3);
    await E.say('birk', 'Hør! En drone. En stor en.', { en: 'Listen! A drone. A big one.', pre: 'A hum comes over the treetops: low, heavy, patient. An amber eye opens in the dark.', think: '“En stor en”: a big one. Of course it’s a big one. They said they’d collect me at nightfall. They are punctual. Like a dentist.' });
    await E.say('holm', 'Porten! Ind, alle sammen! Ind!', { en: 'The gate! In, everyone! In!', think: '“Ind”: in. I know a command when I hear one.' });
    G.gateOpen = 0; E.SFX.door(); E.tween(G, 'gateOpen', 1, 0.8);
    const fast = await E.step(() => Gm.qte('Ind! · in', 2600, 'Birk shoves you toward the gate.'));
    E.tween(G.drone, 'wx', X.GATE_X + 60, 1.4); E.tween(G.drone, 'sweep', 0.2, 1.4);
    if (!fast) await E.tell([['n', 'Your feet don’t move. Birk grabs the coat with both hands and simply carries you through the gate, like a sack of very confused potatoes.'], ['t', 'Fear makes me freeze. Noted. Birk does not freeze. Also noted.']]);
    E.hidePanel(); WLD().walk('birk', X.GATE_X + 30, 260); await WLD().walk('hero', X.GATE_X + 20, 240);

    /* inside the palisade */
    WLD().enter({
      map: 'town', night: true, gateOpen: 0, where: 'Kronby · Porten',
      cast: [{ k: 'hero', wx: 300 }, npc('birk', 360, { o: night(Object.assign({}, A.NPC.birk)) }), npc('holm', 214, { o: night(Object.assign({}, A.NPC.holm)), flip: 0 })]
    });
    G.glow = 1; cam(250, 1); E.SFX.clang();
    G.drone = { wx: 120, y: 240, len: 420, sweep: 0.3, alert: 0, sc: 1.6 };
    E.tween(G.drone, 'wx', 260, 2.4); E.tween(G.drone, 'sweep', -0.15, 2.4);
    await E.tell([['n', 'The gate slams shut behind you. Above the palisade the drone stops, and hangs there, turning its amber eye slowly over the roofs.']]);
    await E.say('birk', 'Den leder efter dig. Du lyser! Sluk lyset!', { en: 'It is looking for you. You are glowing! Turn off the light!', think: '“Sluk lyset”: turn off the light. I don’t have a switch. I have a word. One word. I’ve been practising it in my head all evening, just in case.' });
    await E.converse({
      who: 'birk', da: 'Sluk lyset!', en: 'Turn off the light!', pool: ['mørke', 'lys', 'lyser', 'mørk', 'stille'], ans: 'mørke', noBurst: true,
      hint: 'The word Lav taught you at the lake: darkness.',
      judge: t => /\bm[øo]rke/.test(t) ? { ok: true, who: 'birk', da: 'Godt. Bliv stille.', en: 'Good. Stay still.' } : { ok: false, who: 'birk', da: has(t, 'lys') || has(t, 'lyser') ? 'Lys? Nej! Det modsatte!' : 'Mørke! Ikke mørk. Mørke!', en: has(t, 'lys') ? 'Light? No! The opposite!' : 'Darkness! Not dark. Darkness!' }
    });
    E.hidePanel(); E.SFX.ok(); await E.tween(G, 'glow', 0.12, 1.6);
    if (G.drone) { await E.tween(G.drone, 'sweep', 0.5, 1.6); E.tween(G.drone, 'y', 60, 3); await E.tween(G.drone, 'wx', 900, 3.4); } G.drone = null;
    E.mood('night', { wind: 0.02, crickets: 0.4 });
    await E.tell([['n', 'The amber eye passes over the roofs once more, slowly, like someone patting their pockets for keys. Then it rises, and is gone.']]);
    await E.say('holm', 'Den kommer igen.', { en: 'It will come again.', think: '“Den kommer igen.” It comes again. He says it the way people at home say the bus will come again: tiredly, and as a fact.' });
    const c1 = await E.choose({ who: 'holm', da: 'Den kommer igen.', en: 'It will come again.', opts: ['When?', 'How do you know?'] });
    await E.say('holm', ['Når Den Lange Nat kommer. Om syv dage.', 'Den kommer altid igen. Når Den Lange Nat kommer. Om syv dage.'][c1], { en: ['When the Long Night comes. In seven days.', 'It always comes again. When the Long Night comes. In seven days.'][c1], think: '“Om syv dage”: in seven days. “Den Lange Nat”: the Long Night. I don’t know what it is, but it has capital letters, and that is never good.' });
    E.mood('tender', { wind: 0.02, crickets: 0.3 });
    await E.say('birk', 'Mor forsvandt for fem år siden. En nat ligesom i nat.', { en: 'Mum disappeared five years ago. A night just like tonight.', pre: 'Birk looks up at the place where the drone was.', think: '“For fem år siden”: five years ago. Asta’s log said the drones took her. Birk says “forsvandt”: disappeared. A softer word. Daughters choose softer words.' });
    const c2 = await E.choose({ narr: 'You start to unbutton the coat.', opts: ['Give the coat back to Birk', 'Ask if you may keep it'] });
    await E.say('birk', 'Nej. Behold den. Den skjuler lyset. Mor ville have det sådan.', { en: 'No. Keep it. It hides the light. Mum would have wanted it that way.', think: ['“Behold den”: keep it. She says it fast, before she can change her mind.', 'She answers before I finish asking. “Behold den.” Keep it. Then she looks away, very interested in a lamp.'][c2] });
    await E.say('holm', 'Du kan sove i Ankomsthallen. Alle nye sover der.', { en: 'You can sleep in the arrivals hall. All new people sleep there.', think: '“Ankomsthallen”: the arrival hall. A dormitory for people who fell out of the sky. There’s a sentence I never expected to understand.' });
    await E.say('birk', 'Sov. I morgen taler vi.', { en: 'Sleep. Tomorrow we talk.', think: '“I morgen taler vi.” Tomorrow we talk. It sounds less like an invitation and more like a summons.' });
    look('birk', null); look('holm', null);
    WLD().walk('birk', 1500, 110).then(() => { const b = E.actor('birk'); if (b) b.hidden = true; });
    await walk({ to: T.HALL0 + 70, hint: 'Walk to the arrivals hall  ▶', lights: [[400, 62, 'nat', 'night'], [470, 150, 'syv', 'seven']] });

    /* ---------- 2 · morning in the arrivals hall */
    await fadeTo(async () => {
      WLD().enter({ map: 'town', tod: 'dawn', hallOpen: 1, where: 'Kronby · Ankomsthallen', cast: [{ k: 'hero', wx: 880 }, npc('ruth', 1160, { look: null, flip: 1 })] });
      cam(960, 1.05);
      E.mood('dawn', { birds: 0.2, wind: 0.01 });
    }, 1.4);
    await E.tell([
      ['n', 'You wake in a bunk under a turf roof. Morning light comes in sideways through the windows. Somewhere, a kettle is singing.'],
      ['t', 'For one wonderful second I think I am at home. Then I remember: moon, deer, drone, coat. I’ll take the kettle, though.']
    ]);
    await E.tell([
      ['n', 'You slept in Asta’s coat, and it is still damp from the lake. It smells faintly of pond. On the chest by your bunk lies a folded green cloak, and a note.'],
      ['d:seddel', 'Til den nye. Frakken er våd. Tag kappen. – Ruth', 'To the new one. The coat is wet. Take the cloak. – Ruth'],
      ['t', '“Kappen”: the cloak. I could be offended that a stranger has opinions about my clothes. I’m not. It’s warm.']
    ]);
    E.hidePanel(); s.day = 2; E.SFX.chime(); E.refreshHero(); E.castAnim(null);
    const ruth = E.actor('ruth'); ruth.look = 'hero';
    await stroll('ruth', 960, 70);
    await E.say('ruth', 'God morgen. Du sov længe.', { en: 'Good morning. You slept long.', pre: 'An old woman with a grey knot of hair comes over from the stove, carrying two cups.', think: '“Du sov længe.” You slept long. She says it like a grandmother: an accusation and a compliment at the same time.' });
    await E.say('ruth', 'Jeg hedder Ruth. Jeg kommer også fra Jorden.', { en: 'My name is Ruth. I also come from the Earth.', think: '“Jorden.” The Earth. She said the Earth. Another human. On the moon. Making tea.' });
    const c3 = await E.choose({ who: 'ruth', da: 'Jeg kommer også fra Jorden.', en: 'I also come from the Earth.', opts: ['From Earth? How did you get here?', 'Is one of those cups for me?'] });
    await E.say('ruth', ['Ligesom dig. Jeg faldt ned fra himlen. For 23 år siden.', 'Ja. Der er altid te. Jeg kom hertil for 23 år siden. Der var ingen te. Nu er der te.'][c3], { en: ['Just like you. I fell down from the sky. 23 years ago.', 'Yes. There is always tea. I came here 23 years ago. There was no tea. Now there is tea.'][c3], think: ['“For 23 år siden”: 23 years ago. The crystal hums it twice, as if it can’t believe it either.', 'Twenty-three years. “For 23 år siden.” I can’t keep a houseplant alive for twenty-three days.'][c3] });
    await E.say('ruth', 'Vi er mange. Vi kalder os de faldne.', { en: 'We are many. We call ourselves the fallen.', think: '“De faldne”: the fallen. Of course. The aliens drop the ones they don’t want, and the moon catches them. I was not the first piece of rubbish thrown overboard.' });
    await E.say('ruth', 'Her taler vi dansk. Også vi fra Jorden. Ordene passer på byen.', { en: 'Here we speak Danish. Even those of us from the Earth. The words protect the town.', think: '“Ordene passer på byen.” The words look after the town. So Danish isn’t just a language here. It’s a wall.' });

    /* Holm and the board */
    enterAs('holm', 470, { look: null });
    E.mood('gate', { birds: 0.15 });
    await stroll('holm', T.DESK - 44, 110); look('holm', 'hero');
    await E.say('holm', 'God morgen! Alle nye skal skrive i Ankomstbogen.', { en: 'Good morning! All new people must write in the arrivals book.', pre: 'The door bangs. Holm marches in with an enormous book under his arm and puts it on the desk like a crown on a cushion.', think: 'Ah. Paperwork. Day two. I’d recognise him anywhere.' });
    await E.say('holm', 'Men først: læs tavlen.', { en: 'But first: read the board.' });
    await walk({ to: T.BOARD - 30, hint: 'Walk to the board  ▶' });
    cam(T.BOARD - 40, 1.1);
    await E.step(() => Gm.teach({
      lab: 'Hvornår? Hvor længe?', sub: 'time', h: 'Three little words for time',
      html: `<p class="hint">Before you read, the crystal hums. Three little words, three directions in time:</p>
        <div class="book">
        <div><span><b lang="da">${E.fog('for … siden')}</b> back from now</span><i lang="da">${E.fog('Ruth kom hertil for 23 år siden.')}</i></div>
        <div><span><b lang="da">${E.fog('om …')}</b> forward from now</span><i lang="da">${E.fog('Den Lange Nat kommer om syv dage.')}</i></div>
        <div><span><b lang="da">${E.fog('i …')}</b> how long</span><i lang="da">${E.fog('Du kan sove her i syv dage.')}</i></div>
        <div><span lang="da">${E.fog('i går · i dag · i morgen')}</span><i>yesterday · today · tomorrow</i></div>
        <div><span lang="da">${E.fog('Jeg har været her i to dage.')}</span><i>how long, until now</i></div></div>
        <p class="hint">And when you don’t know: <b lang="da">${E.fog('Det ved jeg ikke endnu.')}</b> · <b lang="da">${E.fog('Det kommer an på …')}</b></p>`
    }));
    await E.step(() => Gm.readLog({
      lab: 'Tavlen', title: 'Til alle nye i Kronby', who: 'holm',
      text: 'Velkommen! Du er ikke den første. Mange kom hertil før dig.\nDu kan sove her i Ankomsthallen i syv dage. Så skal du finde et hus.\nSkriv dit navn i Ankomstbogen hos Holm. Han er her hver morgen.\nHar du spørgsmål? Spørg Ruth. Hun kom hertil for 23 år siden.\nPas på: Om syv dage kommer Den Lange Nat. Så skal alle være inde, når det bliver mørkt.\n– Kronbys råd',
      qs: [
        { q: 'Hvor længe kan du sove i Ankomsthallen?', da: true, opts: ['I syv dage.', 'For syv dage siden.', 'Om syv dage.'], a: 0, why: 'I syv dage: i + how long.', hint: 'How long? Look for i …' },
        { q: 'Hvornår kom Ruth hertil?', da: true, opts: ['For 23 år siden.', 'Om 23 år.', 'I 23 år.'], a: 0, why: 'For 23 år siden: back in the past.', hint: 'The past: for … siden.' },
        { q: 'Hvornår kommer Den Lange Nat?', da: true, opts: ['Om syv dage.', 'For syv dage siden.', 'I syv dage.'], a: 0, why: 'Om syv dage: forward, in the future.', hint: 'The future: om …' }
      ]
    }));
    await E.tell([['t', 'A board that tells me where to sleep, where to sign, and that something called the Long Night arrives in a week. It’s like the first day at a new job, if the job were survival.']]);

    /* the arrivals book */
    await walk({ to: T.DESK + 60, hint: '◀ Back to Holm’s desk' });
    look('hero', 'holm'); cam(T.DESK + 20, 1.12); G.bookOpen = 1; E.SFX.door();
    await E.converse({
      who: 'holm', da: 'Hvornår kom du hertil?', en: 'When did you come here?',
      pool: ['Jeg', 'kom', 'hertil', 'i går', 'for', 'en', 'dag', 'siden', 'om', 'i morgen'], ans: 'Jeg kom hertil i går',
      hint: 'The past: i går, or for en dag siden.',
      judge: t => {
        if (has(t, 'i morgen') || has(t, 'om')) return { ok: false, who: 'holm', da: 'I morgen? Du er her allerede.', en: 'Tomorrow? You are already here.', fb: 'The past: **i går**, or **for en dag siden**.' };
        if (has(t, 'i går') || has(t, 'i forgårs') || (has(t, 'for') && has(t, 'siden'))) return { ok: true, who: 'holm', da: 'I går. Jeg skriver: for en dag siden. Så er det også rigtigt i morgen.', en: 'Yesterday. I’ll write: a day ago. Then it is also right tomorrow.', word: 'i går', think: 'That is not how time works. I decide not to tell him. He has a stamp.' };
        return { ok: false, who: 'holm', da: 'Hvornår? I går? For en uge siden?', en: 'When? Yesterday? A week ago?', fb: 'Say when: Jeg kom hertil i går.' };
      }
    });
    await E.converse({
      who: 'holm', da: 'Hvor længe skal du være her?', en: 'How long will you be here?',
      pool: ['Det', 'ved', 'jeg', 'ikke', 'endnu', 'kommer', 'an', 'på', 'i', 'syv', 'dage', 'om'], ans: 'Det ved jeg ikke endnu',
      hint: 'You don’t know. The board told you: Det ved jeg ikke endnu.',
      judge: t => {
        if (has(t, 'det ved jeg ikke') || has(t, 'jeg ved det ikke') || has(t, 'jeg ved ikke')) return { ok: true, tag: 'ved', who: 'holm', da: 'Det ved ingen. Jeg skriver: Det ved {hun} ikke endnu.', en: 'Nobody knows. I write: {She} doesn’t know yet.', word: 'endnu', think: '“Det ved ingen”: nobody knows. Not the most comforting thing a man with a register has ever said.' };
        if (has(t, 'det jeg ved') || has(t, 'det jeg ikke ved')) return { ok: false, who: 'holm', da: 'Det ved jeg ikke. Verbet står på plads to.', en: 'Det ved jeg ikke. The verb stands in place two.', fb: '**Det** first, then the verb: **Det ved jeg ikke.**' };
        if (has(t, 'kommer an på')) return { ok: true, tag: 'an', who: 'holm', da: 'Det kommer an på … Godt. Jeg skriver: Det kommer an på.', en: 'It depends on … Good. I write: It depends.', word: 'kommer an på', think: 'He writes “it depends” in his official book, with total satisfaction. This man could make a career at home.' };
        if (has(t, 'i syv dage')) return { ok: true, tag: 'i', who: 'holm', da: 'I syv dage. Som tavlen siger. Jeg skriver det.', en: 'For seven days. As the board says. I write it.', word: 'i syv dage' };
        if (has(t, 'om syv dage')) return { ok: false, who: 'holm', da: 'Om syv dage? Det er hvornår. Jeg spurgte: hvor længe?', en: 'In seven days? That is when. I asked: how long?', fb: 'How long: **i** syv dage. Or: **Det ved jeg ikke endnu.**' };
        return { ok: false, who: 'holm', da: 'Hvor længe? I syv dage? Eller ved du det ikke?', en: 'How long? Seven days? Or don’t you know?', fb: 'Det ved jeg ikke endnu. · I syv dage.' };
      }
    });
    await E.say('holm', 'Nu sorterer vi bogen. Jeg læser. Du stempler. Hurtigt!', { en: 'Now we sort the book. I read. You stamp. Fast!', pre: 'Holm opens the book at the very first page and lifts a rubber stamp the size of a fist.', think: '“Hurtigt”: fast. He is enjoying this far too much.' });
    await E.step(() => Gm.sortCards({
      lab: 'Tidslinjen', who: 'holm', listen: true, ms: 6500,
      h: 'Holm reads a time from the book. Stamp it fast: the past, the future, or how long?',
      groups: [{ k: 'f', label: 'Fortid', small: 'the past' }, { k: 'n', label: 'Fremtid', small: 'the future' }, { k: 'l', label: 'Hvor længe', small: 'how long' }],
      items: [
        { w: 'for 23 år siden', g: 'f', en: '23 years ago' }, { w: 'om syv dage', g: 'n', en: 'in seven days' }, { w: 'i syv dage', g: 'l', en: 'for seven days' },
        { w: 'i går', g: 'f', en: 'yesterday' }, { w: 'om en uges tid', g: 'n', en: 'in about a week' }, { w: 'i et par måneder', g: 'l', en: 'for a couple of months' },
        { w: 'for halvandet år siden', g: 'f', en: 'a year and a half ago' }, { w: 'i morgen', g: 'n', en: 'tomorrow' }, { w: 'i to et halvt år', g: 'l', en: 'for two and a half years' },
        { w: 'i forgårs', g: 'f', en: 'the day before yesterday' }, { w: 'om et års tid', g: 'n', en: 'in about a year' }, { w: 'i en måneds tid', g: 'l', en: 'for about a month' }
      ]
    }));
    E.SFX.clang(); E.gainPower(4);
    await E.tell([['n', 'Holm slams the stamp down one last time, and looks at you with something dangerously close to respect.'], ['t', 'I have been stamping time for ten minutes. In the past, the future, and “how long”. Somewhere a philosopher is jealous.']]);

    /* ---------- 3 · the fallen ones: a notebook */
    await stroll('ruth', T.CHEST + 20, 90); look('ruth', 'hero'); E.mood('town', { birds: 0.2 });
    const book = { title: 'Find nogen, der …', rows: [{ l: 'kom hertil for over 20 år siden' }, { l: 'rejser hjem om syv dage' }, { l: 'savner havet, når det regner' }, { l: 'har været her i et år' }] };
    await E.say('ruth', 'Her er en notesbog. Find de andre faldne, og spørg dem.', { en: 'Here is a notebook. Find the other fallen ones, and ask them.', pre: 'Ruth hands you a little notebook. Someone has already written four lines in it.', think: '“Find nogen, der …”: find someone who … A scavenger hunt. With grammar. At least the stakes are low. Probably.' });
    await E.step(() => Gm.teach({ lab: 'Notesbog', sub: 'notebook', h: 'Find someone who …', html: Gm.noteHtml(book) + '<p class="hint">Ask people. When someone answers, write down what they said. Each line has one person.</p>', btn: 'Klar ▸' }));
    await E.say('ruth', 'Start med mig. Spørg!', { en: 'Start with me. Ask!' });
    await E.converse({
      who: 'ruth', da: 'Start med mig. Spørg!', en: 'Start with me. Ask!', silent: true,
      pool: ['Hvornår', 'kom', 'du', 'hertil', 'Hvor', 'længe', 'når', 'da'], ans: 'Hvornår kom du hertil',
      hint: 'Ask what Holm asked you: Hvornår kom du hertil?',
      judge: t => {
        if (has(t, 'hvornår') && has(t, 'kom')) return { ok: true, who: 'ruth', da: 'Jeg kom hertil for 23 år siden, da jeg var tredive.', en: 'I came here 23 years ago, when I was thirty.', word: 'hvornår' };
        if (has(t, 'hvor længe')) return { ok: false, who: 'ruth', da: 'Hvor længe? Hele livet, tror jeg. Men din notesbog vil vide: hvornår?', en: 'How long? All my life, I think. But your notebook wants to know: when?', fb: 'Ask: **Hvornår** kom du hertil?' };
        if (has(t, 'når') || has(t, 'da')) return { ok: false, who: 'ruth', da: 'Er det et spørgsmål? Spørg: hvornår?', en: 'Is that a question? Ask: when?', fb: 'A question takes **hvornår**.' };
        return { ok: false, who: 'ruth', da: 'Spørg: hvornår kom du …?', en: 'Ask: when did you …?' };
      }
    });
    await E.say('ruth', 'Asta kom et år efter mig. Hun var min bedste veninde.', { en: 'Asta came a year after me. She was my best friend.', think: 'Asta. Of course they knew each other. Twenty-three years on a small moon: everyone knows everyone. Like a village. A village with drones.' });
    await E.say('ruth', 'Hun forsvandt for fem år siden, da dronerne kom om natten.', { en: 'She disappeared five years ago, when the drones came at night.', think: '“Da dronerne kom”: when the drones came. “Da”. Another “when”. The crystal underlines it, like a teacher with a red pen.' });
    await E.step(() => Gm.noteFill(book, 0, { who: 'Ruth', line: 'Jeg kom hertil for 23 år siden.', q: 'Write it in the notebook. Which is right?', opts: ['Ruth · for 23 år siden', 'Ruth · om 23 år', 'Ruth · i 23 år'], a: 0, why: 'for … siden: 23 years back from now.', tips: { 1: 'om is forward, into the future. Ruth came in the past.', 2: 'i is how long. Holm asked when.' } }));
    book.rows[0].v = 'Ruth · for 23 år siden';
    await E.say('ruth', 'Noor er her i hallen. Mateo har caféen på torvet. Kofi er ved brønden.', { en: 'Noor is here in the hall. Mateo has the café on the square. Kofi is by the well.', think: 'A hall, a café, a well. A whole town of people who fell out of the sky, and they have a café. Of course they have a café.' });

    /* Noor */
    enterAs('noor', 1090, { look: null, flip: 1 });
    await walk({ to: 1030, hint: 'Find Noor in the hall  ▶', lights: [[880, 62, 'uge', 'week'], [960, 150, 'måned', 'month']] });
    look('noor', 'hero'); look('hero', 'noor'); cam(1060, 1.15);
    await E.say('noor', 'Hej! Du er den nye, ikke?', { en: 'Hi! You are the new one, right?', pre: 'A young woman with long dark hair is folding clothes into a bag on one of the bunks. Very neatly. Very fast.', think: '“Den nye”: the new one. I have a feeling I have been the new one before, somewhere. Everyone has.' });
    await E.converse({
      who: 'noor', da: 'Hvad vil du vide?', en: 'What do you want to know?',
      pool: ['Hvor', 'længe', 'skal', 'du', 'være', 'her', 'Hvornår', 'kom', 'hertil'], ans: 'Hvor længe skal du være her',
      hint: 'Your notebook: rejser hjem om syv dage. Ask what Holm asked: Hvor længe skal du være her?',
      judge: t => {
        if (has(t, 'hvor længe')) return { ok: true, who: 'noor', da: 'Ikke længe! Jeg rejser hjem, når skibet kommer. Om syv dage!', en: 'Not long! I am going home when the ship comes. In seven days!', word: 'hvor længe' };
        if (has(t, 'hvornår') && has(t, 'kom')) return { ok: false, who: 'noor', da: 'For halvandet år siden. Men spørg også: hvor længe?', en: 'A year and a half ago. But ask too: how long?', fb: 'Your notebook wants: **Hvor længe** skal du være her?' };
        return { ok: false, who: 'noor', da: 'Hvad? Spørg igen.', en: 'What? Ask again.' };
      }
    });
    await E.tell([['t', '“Jeg rejser hjem, når skibet kommer”: I am going home when the ship comes. The ship. The one that came for me last night. She is packing for it.']]);
    const c4 = await E.choose({ who: 'noor', da: 'Om syv dage!', en: 'In seven days!', opts: ['The ship? The Kurator ship?', 'Who told you that?'] });
    await E.say('noor', ['Ja! Skibet tager os hjem. Det siger alle.', 'Det siger alle. På torvet. Skibet tager os hjem.'][c4], { en: ['Yes! The ship takes us home. Everyone says so.', 'Everyone says so. On the square. The ship takes us home.'][c4], think: 'Everyone says so. On the square. That is how rumours work at home too. Only at home they’re about celebrities, not alien ships.' });
    await E.say('noor', 'Jeg kom hertil for halvandet år siden. Jeg savner min familie. Og maden.', { en: 'I came here a year and a half ago. I miss my family. And the food.', think: '“Savner”: the crystal hums softly: miss. She misses her family. And the food. “Halvandet”: one and a half. Danish counts halves in a way that makes my head itch.' });
    await E.step(() => Gm.noteFill(book, 1, { who: 'Noor', line: 'Jeg rejser hjem, når skibet kommer. Om syv dage!', q: 'Write it in the notebook. Which is right?', opts: ['Noor · om syv dage', 'Noor · for syv dage siden', 'Noor · i syv dage'], a: 0, why: 'om: forward, in the future.', tips: { 1: 'for … siden is the past. Noor hasn’t left yet.', 2: 'i is how long. When does she go?' } }));
    book.rows[1].v = 'Noor · om syv dage';

    /* Mateo, on the square */
    enterAs('mateo', T.CAFE - 30, { look: null, flip: 1 });
    await fadeTo(async () => { G.tod = 'day'; }, 0.5);
    await walk({ to: T.CAFE - 92, hint: 'Out to the square: find Mateo  ▶', lights: [[1330, 62, 'savne', 'miss'], [1420, 150, 'halvandet', 'one and a half'], [1500, 62, 'havet', 'the sea']] });
    look('mateo', 'hero'); look('hero', 'mateo'); cam(T.CAFE - 60, 1.05); E.mood('town', { birds: 0.3 });
    await E.say('mateo', 'Velkommen! Kaffe? Den er god. Næsten som på Jorden.', { en: 'Welcome! Coffee? It’s good. Almost like on Earth.', pre: 'Outside a little café, a man in a green waistcoat is wiping tables. He has a beard, a towel over one shoulder and the face of someone who has argued with many suppliers.', think: '“Næsten som på Jorden.” Almost like on Earth. That “næsten” is doing a lot of work.' });
    await E.converse({
      who: 'mateo', da: 'Spørg bare.', en: 'Just ask.',
      pool: ['Hvad', 'savner', 'du', 'savne', 'Hvor', 'længe', 'jeg'], ans: 'Hvad savner du',
      hint: 'Your notebook: savner havet. Ask: Hvad savner du?',
      judge: t => {
        if (has(t, 'hvad') && has(t, 'savner') && has(t, 'du') && !has(t, 'jeg')) return { ok: true, who: 'mateo', da: 'Havet. Jeg boede ved havet i Valparaíso. Når det regner her, savner jeg havet.', en: 'The sea. I lived by the sea in Valparaíso. When it rains here, I miss the sea.', word: 'savner' };
        if (has(t, 'savne') && !has(t, 'savner')) return { ok: false, who: 'mateo', da: 'Savne? Nu: savner. Med r.', en: 'Savne? Now: savner. With an r.', fb: 'Now, in the present: **savner** (-r).' };
        if (has(t, 'jeg savner')) return { ok: false, who: 'mateo', da: 'Du savner? Nej, spørg mig: hvad savner du?', en: 'You miss? No, ask me: what do you miss?' };
        return { ok: false, who: 'mateo', da: 'Spørg: hvad savner du?', en: 'Ask: what do you miss?' };
      }
    });
    await E.tell([['t', '“Når det regner, savner jeg havet”: when it rains, I miss the sea. “Når” again, and this time it comes back every time it rains. Like rain.']]);
    await E.say('mateo', 'Hvor længe skal jeg være her? Det ved jeg ikke. Det kommer an på min café.', { en: 'How long will I be here? I don’t know. It depends on my café.', think: '“Det kommer an på”: it depends on. He’ll stay as long as the café needs him. I respect that more than most life plans I’ve heard.' });
    await E.step(() => Gm.noteFill(book, 2, { who: 'Mateo', line: 'Når det regner her, savner jeg havet.', q: 'Write it in the notebook. Which is right?', opts: ['Mateo · når det regner', 'Mateo · da det regnede', 'Mateo · hvornår det regner'], a: 0, why: 'når: every time it happens.', tips: { 1: 'da is one time in the past. Mateo misses the sea every time it rains.', 2: 'hvornår only asks questions.' } }));
    book.rows[2].v = 'Mateo · når det regner';

    /* Kofi, by the well */
    enterAs('kofi', T.WELL + 30, { look: null, flip: 1 });
    await walk({ to: T.WELL - 40, hint: 'Find Kofi by the well  ▶', lights: [[1720, 62, 'blive', 'stay'], [1790, 150, 'længe', 'long']] });
    look('kofi', 'hero'); look('hero', 'kofi'); cam(T.WELL - 6, 1.1);
    await E.say('kofi', 'Hej! Jeg er Kofi. Ruth siger, du har en notesbog. Spørg mig om noget!', { en: 'Hi! I’m Kofi. Ruth says you have a notebook. Ask me something!', pre: 'By the well stands a man in a mustard coat, tapping a little drum. Every time he hits it, the water in the well shivers.', think: 'News travels fast in a town with one café.' });
    const ko = await E.converse({
      who: 'kofi', da: 'Spørg mig om noget!', en: 'Ask me something!', silent: true,
      pool: ['Hvor', 'længe', 'har', 'du', 'været', 'her', 'Hvornår', 'kom', 'hertil', 'skal'], ans: 'Hvor længe har du været her',
      hint: 'Your notebook: har været her i et år. Ask: Hvor længe har du været her?',
      judge: t => {
        if (has(t, 'hvor længe') && has(t, 'været')) return { ok: true, tag: 'hl', who: 'kofi', da: 'Jeg har været her i et år.', en: 'I have been here for a year.', word: 'været' };
        if (has(t, 'hvornår') && has(t, 'kom')) return { ok: true, tag: 'hv', who: 'kofi', da: 'For et år siden. Så jeg har været her i et år.', en: 'A year ago. So I have been here for a year.', word: 'hvornår' };
        if (has(t, 'hvor længe') && has(t, 'skal')) return { ok: true, tag: 'sk', who: 'kofi', da: 'Hele livet! Jeg har været her i et år, og jeg bliver her.', en: 'All my life! I have been here for a year, and I am staying here.', word: 'hele livet' };
        return { ok: false, who: 'kofi', da: 'Hvad? Spørg om tid! Hvor længe … ?', en: 'What? Ask about time! How long …?' };
      }
    });
    await E.say('kofi', 'Og jeg vil gerne blive her. Hele livet!', { en: 'And I would like to stay here. All my life!', think: '“Hele livet”: his whole life. He says it with a drum roll. Someone on this moon is actually happy. Suspicious. I like him.' });
    await E.say('kofi', 'På Jorden spillede jeg på gaden. Ingen lyttede. Her lytter alle.', { en: 'On Earth I played in the street. Nobody listened. Here everyone listens.' });
    await E.step(() => Gm.noteFill(book, 3, { who: 'Kofi', line: 'Jeg har været her i et år.', q: 'Write it in the notebook. Which is right?', opts: ['Kofi · i et år', 'Kofi · for et år', 'Kofi · om et år'], a: 0, why: 'har været her i …: how long, up to now.', tips: { 1: 'for et år alone means nothing here. It needs siden: for et år siden.', 2: 'om is the future. He is already here.' } }));
    book.rows[3].v = 'Kofi · i et år';
    E.gainPower(5);
    await E.tell([['t', 'Four people. Four kinds of “when”. My crystal is sorting them by itself, like a librarian with a grudge.']]);
    await E.step(() => Gm.teach({
      lab: 'Tre slags “når”', sub: 'when', h: 'English has one “when”. Danish has three.',
      html: `<div class="book">
        <div><span><b lang="da">${E.fog('hvornår?')}</b> asks</span><i lang="da">${E.fog('Hvornår kom du hertil?')}</i></div>
        <div><span><b lang="da">${E.fog('da')}</b> one time, in the past</span><i lang="da">${E.fog('Asta forsvandt, da dronerne kom.')}</i></div>
        <div><span><b lang="da">${E.fog('når')}</b> in the future</span><i lang="da">${E.fog('Noor rejser hjem, når skibet kommer.')}</i></div>
        <div><span><b lang="da">${E.fog('når')}</b> every time</span><i lang="da">${E.fog('Når det regner, savner Mateo havet.')}</i></div></div>
        <p class="hint">And look: when a <b lang="da">${E.fog('når')}</b>- or <b lang="da">${E.fog('da')}</b>-sentence comes first, the verb comes next, before the subject, just like after <b lang="da">${E.fog('før')}</b>: <span lang="da">${E.fog('Når det regner, savner jeg havet.')}</span></p>`
    }));
    await E.step(() => Gm.gapChoice({
      lab: 'Hvornår, da eller når?', h: 'Which “when” goes in the gap?',
      keys: [{ id: 'hv', da: 'hvornår', plus: 'asks' }, { id: 'da', da: 'da', plus: 'once, in the past' }, { id: 'na', da: 'når', plus: 'future / every time' }],
      tips: { hv: 'hvornår only asks. Is this a question?', da: 'da is for one time in the past. Is it?', na: 'når is for the future, or for every time. Is it?' },
      items: Gm.shuffle([
        { a: '', b: 'kom Kofi hertil?', k: 'hv', en: 'When did Kofi come here?', why: 'A question: hvornår.' },
        { a: 'Ruth var tredive,', b: 'hun faldt ned.', k: 'da', en: 'Ruth was thirty when she fell.', why: 'One time, in the past: da.' },
        { a: 'Noor rejser hjem,', b: 'skibet kommer.', k: 'na', en: 'Noor is going home when the ship comes.', why: 'In the future: når.' },
        { a: '', b: 'det regner, savner Mateo havet.', k: 'na', en: 'When it rains, Mateo misses the sea.', why: 'Every time it rains: når.' },
        { a: '', b: 'skal du hjem?', k: 'hv', en: 'When are you going home?', why: 'A question: hvornår.' },
        { a: 'Jeg lyste,', b: 'jeg faldt i søen.', k: 'da', en: 'I glowed when I fell into the lake.', why: 'One time, in the past: da.' },
        { a: 'Kofi spiller,', b: 'han er glad.', k: 'na', en: 'Kofi plays when he is happy.', why: 'Every time he is happy: når.' },
        { a: '', b: 'Asta forsvandt, var Birk seksten.', k: 'da', en: 'When Asta disappeared, Birk was sixteen.', why: 'One time, in the past: da. And then the verb first: var Birk.' }
      ])
    }));

    /* ---------- 4 · Birk, and the voice */
    await fadeTo(async () => { G.tod = 'afternoon'; }, 0.6);
    E.mood('tender', { birds: 0.1, wind: 0.02 });
    enterAs('birk', T.WELL - 380, { look: null });
    await stroll('birk', T.WELL - 110, 120); look('birk', 'hero'); look('hero', 'birk'); cam(T.WELL - 60, 1.1);
    await E.say('birk', 'Der er du.', { en: 'There you are.', pre: 'Birk comes across the square. She has not slept. Her spear has a new scratch, and so does she.' });
    const c5 = await E.choose({ narr: 'There is something you haven’t told anyone.', opts: ['Tell her about the voice on the ship', 'Ask about her mother first'] });
    if (c5 === 1) await E.say('birk', 'Mor? Hun er væk. Hvorfor spørger du?', { en: 'Mum? She is gone. Why do you ask?' });
    await E.tell([['n', 'You tell her about the ship. The light, the cold, the tall ones talking like dentists. And the voice: a woman’s voice, cracked, in a language you didn’t know yet.']]);
    await E.converse({
      who: 'birk', da: 'En stemme? Hvad sagde den?', en: 'A voice? What did it say?',
      pool: ['Du', 'er', 'ikke', 'alene', 'Jeg', 'mørke', 'stille', 'her'], ans: 'Du er ikke alene',
      hint: 'On the ship, before the fall, the voice said: you are not alone.',
      judge: t => has(t, 'ikke alene') ? { ok: true, who: 'birk', da: '… Det sagde mor altid. Til alle nye.', en: '… Mum always said that. To all new people.' } : has(t, 'alene') ? { ok: false, who: 'birk', da: 'Alene? Nej. Tænk. Hvad sagde den?', en: 'Alone? No. Think. What did it say?', fb: 'It said you were **not** alone.' } : { ok: false, who: 'birk', da: 'Hvad sagde den? Præcis.', en: 'What did it say? Exactly.' }
    });
    E.mood('dread', { wind: 0.02 });
    await E.tell([['t', '“Det sagde mor altid.” Mum always said that. To all the new ones. Oh. Oh no. The voice on the ship is Asta.']]);
    await E.converse({
      who: 'birk', da: 'Hvornår hørte du den?', en: 'When did you hear it?',
      pool: ['Da', 'Når', 'Hvornår', 'jeg', 'var', 'er', 'på', 'skibet'], ans: 'Da jeg var på skibet',
      hint: 'One time, in the past: da. Da jeg var på skibet.',
      judge: t => {
        if (has(t, 'da') && has(t, 'var')) return { ok: true, who: 'birk', da: 'På skibet. Så lever hun.', en: 'On the ship. Then she is alive.', word: 'da' };
        if (has(t, 'når') || has(t, 'hvornår')) return { ok: false, who: 'birk', da: 'Når? Det er sket. Én gang. Da.', en: 'When? It has happened. Once. Da.', fb: 'One time, in the past: **da**.' };
        if (has(t, 'er') && !has(t, 'var')) return { ok: false, who: 'birk', da: 'Er du på skibet nu? Nej. Du var.', en: 'Are you on the ship now? No. You were.', fb: 'Past: **var**.' };
        return { ok: false, who: 'birk', da: 'Hvornår? Sig det hele: da jeg …', en: 'When? Say all of it: when I …' };
      }
    });
    E.SFX.heart(); G.shake = { t0: E.clock(), dur: 0.4, amp: 0.3 };
    await E.say('birk', 'Om syv dage kommer skibet. Så henter vi hende.', { en: 'In seven days the ship comes. Then we fetch her.', pre: 'Birk’s hand closes around her spear.', think: '“Så henter vi hende.” Then we fetch her. Not “we try”. Not “maybe”. Fetch. Like picking up a parcel.' });
    enterAs('ruth', T.WELL - 420, { look: null });
    await stroll('ruth', T.WELL - 170, 90); look('ruth', 'birk');
    await E.say('ruth', 'Birk. Ingen kommer tilbage fra skibet.', { en: 'Birk. Nobody comes back from the ship.' });
    await E.say('birk', 'Mor gjorde. Én gang.', { en: 'Mum did. Once.', think: 'Asta stole a ship once. Her daughter has clearly inherited the attitude.' });
    await E.say('ruth', 'Og så tog de hende igen.', { en: 'And then they took her again.', narr: 'Nobody says anything. Kofi’s drum has stopped.' });
    const c6 = await E.choose({ who: 'birk', da: 'Om syv dage.', en: 'In seven days.', opts: ['I’ll help you.', 'Seven days isn’t much time.'] });
    await E.say('birk', ['Du? Du kan næsten ikke tale dansk. … Men du lærer hurtigt. Det gjorde mor også.', 'Nej. Så vi starter nu.'][c6], { en: ['You? You can hardly speak Danish. … But you learn fast. So did Mum.', 'No. So we start now.'][c6], think: ['Recruited by a woman with a spear, for a rescue on an alien ship, because of my vocabulary. My CV is getting strange.', '“Så vi starter nu.” So we start now. She doesn’t say what we start. I suspect it involves grammar.'][c6] });
    E.hidePanel(); E.tween(G, 'rain', 1, 2.5); E.mood('night', { wind: 0.05 });
    await E.say('ruth', 'Regn! Ind, alle sammen!', { en: 'Rain! In, everyone!', pre: 'The sky over the square goes grey. A fat drop lands on Ruth’s nose, then another one on yours.' });

    /* ---------- 5 · the wet book */
    await fadeTo(async () => {
      WLD().enter({ map: 'town', tod: 'afternoon', hallOpen: 1, where: 'Kronby · Ankomsthallen', cast: [{ k: 'hero', wx: T.DESK + 60 }, npc('holm', T.DESK - 44), npc('ruth', T.CHEST + 60, { look: 'holm' }), npc('kofi', T.BOARD + 40, { flip: 1, look: 'holm' })] });
      G.rain = 0.3; G.bookOpen = 1; look('hero', 'holm'); cam(T.DESK + 30, 1.12);
      E.mood('tense', { wind: 0.04 });
    }, 1);
    await E.say('holm', 'Nej, nej, nej! Regnen kom ind. Bogen er våd!', { en: 'No, no, no! The rain came in. The book is wet!', pre: 'Holm is holding the arrivals book the way other people hold a hurt cat.' });
    await E.say('holm', 'De små ord er væk. Ikke, også, gerne … Kan du sætte dem tilbage?', { en: 'The little words are gone. Ikke, også, gerne … Can you put them back?', think: 'The rain ate the little words. Only the little words. This moon has a very specific sense of humour.' });
    await E.step(() => Gm.teach({
      lab: 'Små ord', sub: 'where the little words go', h: 'ikke, også, gerne, stadig, altid …',
      html: `<div class="book">
        <div><span>A normal sentence: right <b>after the verb</b></span><i lang="da">${E.fog('Noor vil gerne rejse hjem.')}</i></div>
        <div><span>After <b lang="da">${E.fog('fordi, da, når, at')}</b>: <b>before the verb</b></span><i lang="da">${E.fog('…, fordi hun gerne vil rejse hjem.')}</i></div>
        <div><span>Verb first? Then the little word waits <b>after the subject</b></span><i lang="da">${E.fog('Når det regner, savner Mateo altid havet.')}</i></div></div>
        <p class="hint">The little words: <span lang="da">${E.fog('ikke · også · gerne · stadig · altid · desværre · kun · nogle gange')}</span></p>`
    }));
    await E.step(() => Gm.placeWord({
      lab: 'Den våde bog', tip: 'A normal sentence: right after the verb. After fordi, da, når or at: before the verb.',
      items: [
        { w: 'Noor vil rejse hjem.', word: 'gerne', at: 2, en: 'Noor would like to go home.', why: 'A normal sentence: gerne right after the verb vil.' },
        { w: 'Hun pakker, fordi hun vil rejse hjem.', word: 'gerne', at: 4, en: 'She is packing because she would like to go home.', why: 'A fordi-sentence: gerne before the verb vil.' },
        { w: 'Ruth savner regnen i Skotland.', word: 'stadig', at: 2, en: 'Ruth still misses the rain in Scotland.', why: 'A normal sentence: stadig right after the verb savner.' },
        { w: 'Asta kommer tilbage.', word: 'ikke', at: 2, en: 'Asta is not coming back.', why: 'A normal sentence: ikke after the verb. (Ruth wrote this one. Birk would tear the page out.)' },
        { w: 'Han er glad, fordi han kan lave kaffe.', word: 'også', at: 5, en: 'He is happy because he can also make coffee.', why: 'A fordi-sentence: også before the verb kan.' },
        { w: 'Birk siger, at hun er bange.', word: 'ikke', at: 4, en: 'Birk says that she is not afraid.', why: 'An at-sentence: ikke before the verb er.' },
        { w: 'Når det regner, savner Mateo havet.', word: 'altid', at: 5, en: 'When it rains, Mateo always misses the sea.', why: 'The verb came first (savner Mateo), so altid waits after the subject.' }
      ]
    }));
    await E.say('holm', 'Navnene er også væk! Hvem skrev det?', { en: 'The names are gone too! Who wrote it?', think: 'A whodunnit. Holm’s book is a crime scene, and the crime is weather.' });
    const ENTRY = (t) => `<div class="memory"><div class="who">Ankomstbogen</div><p class="da" lang="da">${E.fog(t)}</p></div>`;
    const WHO = ['Noor', 'Ruth', 'Mateo', 'Kofi'];
    await E.step(() => Gm.chooseOne({ lab: 'Hvem skrev det?', sub: 'who wrote it', html: ENTRY('Jeg kom hertil for halvandet år siden. Jeg savner min familie og maden. Jeg rejser hjem, når skibet kommer.'), opts: WHO, a: 0, why: 'For halvandet år siden, and home when the ship comes: Noor.', tip: 'Look in your notebook: who goes home when the ship comes?' }));
    await E.step(() => Gm.chooseOne({ lab: 'Hvem skrev det?', sub: 'who wrote it', html: ENTRY('Jeg har været her i tre år. Når det regner, savner jeg havet. Hvor længe skal jeg være her? Det kommer an på min café.'), opts: WHO, a: 2, why: 'The sea, the rain, the café: Mateo.', tip: 'Who has a café?' }));
    await E.step(() => Gm.chooseOne({ lab: 'Hvem skrev det?', sub: 'who wrote it', html: ENTRY('Jeg faldt ned for 23 år siden, da jeg var tredive. Asta kom et år efter mig.'), opts: WHO, a: 1, why: '23 years ago, and a year before Asta: Ruth.', tip: 'Who came more than twenty years ago?' }));
    E.gainPower(4);
    await E.say('holm', 'Tak! Bogen er hel igen. Nu mangler den kun én: dig.', { en: 'Thanks! The book is whole again. Now it only lacks one: you.', think: 'Of course. Every story on this moon ends with me filling in a form.' });

    /* ---------- 6 · evening at Mateo's café */
    await fadeTo(async () => {
      WLD().enter({
        map: 'town', tod: 'dusk', dusk: 0.85, where: 'Kronby · Torvet',
        cast: [{ k: 'hero', wx: T.CAFE + 10 }, npc('mateo', T.CAFE - 40), npc('ruth', T.CAFE - 110), npc('noor', T.CAFE + 80, { flip: 1 }), npc('kofi', T.CAFE + 150, { flip: 1 }), npc('birk', T.CAFE + 210, { flip: 1, look: null })]
      });
      cam(T.CAFE + 50, 0.98); G.rain = 0;
      E.mood('town', { crickets: 0.3 });
    }, 1.2);
    await E.tell([['n', 'Evening. The rain has stopped, and the square smells of wet stone and coffee. The fallen ones sit outside Mateo’s café under the lamps, the way people at home sit outside on the first warm evening of the year.'], ['t', 'Nobody here has the same home. All of them have the same moon. It makes a strange kind of family.']]);
    await E.say('kofi', 'Dansk er musik. Lyt: i, e, æ. Tre toner.', { en: 'Danish is music. Listen: i, e, æ. Three notes.', pre: 'Kofi sets his drum on his knee.', think: '“Tre toner”: three notes. He’s going to make me sing vowels in public. On my second day.' });
    await E.step(() => Gm.sortCards({
      lab: 'Tre toner', who: 'kofi', listen: true,
      h: 'Kofi sings a word. Which vowel do you hear?',
      groups: [{ k: 'i', label: 'blive', small: '[i]' }, { k: 'e', label: 'hende', small: '[e]' }, { k: 'ae', label: 'længe', small: '[æ]' }],
      items: [
        { w: 'blive', g: 'i', en: 'stay' }, { w: 'vi', g: 'i', en: 'we' }, { w: 'tid', g: 'i', en: 'time' },
        { w: 'hende', g: 'e', en: 'her' }, { w: 'ikke', g: 'e', en: 'not', why: 'ikke sounds like “ekke”.' }, { w: 'hertil', g: 'e', en: 'here (to here)', why: 'the stress is on -til, and it sounds like “tel”.' },
        { w: 'længe', g: 'ae', en: 'long' }, { w: 'fem', g: 'ae', en: 'five' }, { w: 'hjem', g: 'ae', en: 'home' }
      ]
    }));
    await E.say('kofi', 'Og trommen viser trykket. Lyt!', { en: 'And the drum shows the stress. Listen!', think: '“Trykket”: the stress. Not the emotional kind. Although.' });
    await E.step(() => Gm.stressTap({
      lab: 'Trommen', h: 'A verb gives its stress away to the word it belongs with: a place, a direction, a thing. Which word takes the drum beat?',
      tip: 'The verb gives its stress away. Look for the place, the direction or the thing right after it.',
      items: [
        { w: 'Noor rejser hjem om syv dage.', at: 2, en: 'Noor is going home in seven days.', why: 'hjem is a direction: it takes the stress from rejser.' },
        { w: 'Mateo flyttede til Kronby for tre år siden.', at: 3, en: 'Mateo moved to Kronby three years ago.', why: 'Kronby is a place: it takes the stress from flyttede.' },
        { w: 'Kofi spiller musik på torvet.', at: 2, en: 'Kofi plays music on the square.', why: 'musik is the thing he plays: it takes the stress.' },
        { w: 'Ruth drikker te hver morgen.', at: 2, en: 'Ruth drinks tea every morning.', why: 'te is the thing she drinks: it takes the stress.' },
        { w: 'om en uges tid', at: 2, en: 'in about a week', why: 'tid is weak here: the stress stays on uges.' }
      ]
    }));
    await E.say('mateo', 'Nå, {navn}. Er du glad for at være her?', { en: 'So, {navn}. Are you happy to be here?', pre: 'Mateo puts a cup in front of you. It smells almost exactly like coffee.' });
    const c7 = await E.choose({ who: 'mateo', da: 'Er du glad for at være her?', en: 'Are you happy to be here?', da_opts: true, shuffle: true, opts: ['Ja, meget!', 'Ja, men jeg savner mit liv.', 'Nej, ikke rigtigt.'] });
    await E.say('mateo', ['Efter to dage? Du er en god løgner.', 'Det kan jeg godt forstå.', 'Ærligt. Det kan jeg godt forstå.'][c7], { en: ['After two days? You are a good liar.', 'I can understand that.', 'Honest. I can understand that.'][c7], think: ['“En god løgner”: a good liar. From a man who sells something that is almost coffee.', '“Det kan jeg godt forstå.” I can understand that. Everyone at this table can.', '“Ærligt.” Honest. On this moon, honesty seems to be worth more than coffee.'][c7] });
    const cy = city(), cyN = E.norm(cy.da);
    const miss = await E.converse({
      who: 'noor', da: 'Hvad savner du?', en: 'What do you miss?',
      pool: ['Jeg', 'savner', cy.da, 'mit', 'job', 'min', 'seng', 'savne', 'du'], ans: `Jeg savner ${cy.da}`,
      hint: 'Jeg savner … (your city, your job, your bed).',
      judge: t => {
        if (has(t, 'jeg savner')) {
          const tag = has(t, cyN) ? 'city' : has(t, 'mit job') ? 'job' : has(t, 'min seng') ? 'bed' : 'own';
          return { ok: true, tag, who: 'noor', da: { city: `${cy.da}. Det kan jeg godt forstå.`, job: 'Dit job? Du er mærkelig. Men det kan jeg godt forstå.', bed: 'Din seng! Ja. Jeg savner også min seng.', own: 'Det kan jeg godt forstå.' }[tag], en: { city: `${cy.da}. I can understand that.`, job: 'Your job? You are strange. But I can understand that.', bed: 'Your bed! Yes. I miss my bed too.', own: 'I can understand that.' }[tag], word: 'savner' };
        }
        if (has(t, 'savne')) return { ok: false, who: 'noor', da: 'Savne? Nu: jeg savner.', en: 'Savne? Now: I miss.', fb: 'Now: **savner** (-r).' };
        return { ok: false, who: 'noor', da: 'Hvad savner du? Jeg savner …', en: 'What do you miss? I miss …' };
      }
    });
    const m = { city: `A street in ${cy.da} after rain. The smell of a bakery. A bus that doesn’t wait for anyone. Then it’s gone, like a word on the tip of your tongue.`, job: (job().m || 'Your old work, and the people in it.') + ' Then it’s gone again.', bed: 'Your own bed. The dip in the mattress exactly your shape. The phone glowing on the nightstand. Three unread messages.', own: `A street in ${cy.da}. Someone laughing in a kitchen. Then it’s gone.` }[(miss && miss.tag) || 'own'];
    await E.tell([['m', m], ['t', 'I miss a life I can only half remember. It’s a special kind of missing. Like a song with the words gone. Except the washing-powder jingle. That one, my brain kept.']]);
    await E.converse({
      who: 'mateo', da: 'Og hvornår savner du det?', en: 'And when do you miss it?',
      pool: ['Når', 'jeg', 'er', 'alene,', 'savner', 'jeg', 'det', 'det', 'regner,', 'Da', 'mørkt,'], ans: 'Når jeg er alene, savner jeg det',
      hint: 'Every time: når. Når jeg er alene, savner jeg det. The verb comes right after the når-sentence.',
      judge: t => {
        const r = whenOrder(t);
        if (!r.ok) return { ok: false, who: 'mateo', da: 'Hm? Når …, savner jeg …', en: 'Hm? When …, I miss …', fb: r.bad };
        const k = has(t, 'regner') ? 'rain' : has(t, 'mørkt') ? 'dark' : 'alone';
        return { ok: true, who: 'mateo', da: { rain: 'Når det regner? Så er vi to. Kom her, når det regner.', dark: 'Når det er mørkt … Her er det mørkt hver nat. Så kom her.', alone: 'Når du er alene … Så kom her. Her er man aldrig alene.' }[k], en: { rain: 'When it rains? Then there are two of us. Come here when it rains.', dark: 'When it is dark … Here it is dark every night. So come here.', alone: 'When you are alone … Then come here. Here you are never alone.' }[k], word: 'når' };
      }
    });
    await E.tell([['t', 'Everyone on this moon keeps telling me some version of “you are not alone”. I’m starting to think it isn’t a coincidence. I’m starting to think it’s a password.']]);

    /* ---------- 7 · the book, at night */
    await fadeTo(async () => {
      WLD().enter({ map: 'town', night: true, hallOpen: 1, where: 'Kronby · Ankomsthallen', cast: [{ k: 'hero', wx: T.DESK + 60 }, npc('holm', T.DESK - 44, { o: night(Object.assign({}, A.NPC.holm)) })] });
      G.bookOpen = 1; G.glow = 0.2; look('hero', 'holm'); cam(T.DESK + 30, 1.15);
      E.mood('night', { crickets: 0.4 });
    }, 1.2);
    await E.say('holm', 'Nu er det din tur. Skriv i Ankomstbogen.', { en: 'Now it’s your turn. Write in the arrivals book.', pre: 'Late. The hall is full of sleeping people. Holm has waited up, with a candle and the book.', think: 'He waited up. For paperwork. I am oddly touched.' });
    const cyP = (cy.p || 'i') + ' ' + cy.da;
    const model = `Jeg kom hertil i går. Jeg faldt i søen, da en drone jagede mig. Hvor længe skal jeg være her? Det ved jeg ikke endnu. Det kommer an på skibet. Når det regner, savner jeg ${cy.da}.`;
    const entry = await E.step(() => Gm.writeTask({
      lab: 'Ankomstbogen', sub: 'the arrivals book', ph: 'Jeg kom hertil …', model, modelWho: 'Holm’s example',
      hint: `Write three sentences or more: when you came, how long you will stay, and what you miss. (You lived ${cyP}.)`,
      checks: [
        { f: (r, l) => /\bfor\b.*\bsiden\b/.test(l) || / i går | i forgårs /.test(l), t: () => 'When you came: i går, or for … siden' },
        { f: (r, l) => / i (en|et|to|tre|fire|fem|seks|syv|et par|halvandet) | om | når | ved jeg ikke | ved det ikke | kommer an på | hele livet /.test(l), t: () => 'How long: i …, om …, når …, or Det ved jeg ikke endnu' },
        { f: (r, l) => / savner /.test(l), t: () => 'What you miss: savner' },
        { f: r => (r.match(/[.!?](\s|$)/g) || []).length >= 3, t: () => 'At least three sentences' }
      ],
      warn: (r, l) => / savne /.test(l) ? 'savne → savner (now, with -r)' : /\bom\b[^.!?]*\bsiden\b/i.test(r) ? 'om … siden? The past is for … siden.' : / det jeg ved /.test(l) ? 'Det ved jeg ikke: the verb comes second.' : ''
    }));
    mem().arrival = entry; E.save();
    E.SFX.scan(); E.SFX.clang(); E.gainPower(10); E.castAnim('godkendt');
    await E.tell([['n', 'Holm reads it slowly, moving his lips, the way some people read love letters.'], ['d:holm', entry, '']]);
    await E.say('holm', 'Godkendt! Velkommen til Kronby, {navn}.', { en: 'Approved! Welcome to Kronby, {navn}.', think: 'Welcome. Officially. On the second day. With a stamp. I think I might cry, and I blame the stamp.' });

    /* ---------- 8 · the crystal, and the ship */
    E.hidePanel(); E.mood('dread', { hum: 0.03 });
    await E.tell([['n', 'Later, in your bunk, your shoulder starts to burn. Under the skin, the crystal has grown again. You can feel it, like a tooth coming in.'], ['t', 'It’s counting. Something inside me is counting, and I don’t know what happens when it gets to a hundred.']]);
    E.hidePanel(); G.glow = 0.7;
    await E.step(() => Gm.crystalMeter(64, 68, 'Kernen'));
    await fadeTo(async () => {
      setScene('ship', { feet: 664, maxLift: 200, where: 'Kurator-skibet', g: { progress: 68, anomaly: 1 }, cast: [{ id: 'vex', k: 'kurator', wx: 150, o: { point: 1 }, flip: 1 }, { id: 'plink', k: 'kurator', wx: 40, o: { small: 1, tablet: 1, robe: '#9fb39a', ph: 1.3 } }] });
      G.view = { x: 64, z: 1 };
      E.mood('dread', { hum: 0.05 });
    }, 1.2);
    await E.tell([['a:plink', 'Sixty-eight percent. It grew again, Vex. Without the chamber.'], ['a:vex', 'Then it is feeding.'], ['a:plink', 'On what?'], ['a:vex', 'On words. That town is teaching it.']]);
    await E.tell([['a:plink', 'The Long Night is in seven days. We collect then, as planned?'], ['a:vex', 'No. Send the swarm tomorrow night. Put the town to sleep.']]);
    await E.tell([['a:plink', '…The whole swarm. For one specimen.'], ['a:vex', 'For one anomaly.']]);
    E.hidePanel(); G.glitch = { t0: E.clock(), dur: 1.2 }; await E.wait(800);

    /* ---------- the end of the section */
    S().prog.k1a2 = 1; E.cpEnd();
    E.hidePanel(); await E.tween(G, 'fade', 0.7, 1.2);
    await Gm.endCard({
      k: 'Kapitel 1 · Afsnit 2', title: 'Hvor længe?', line: 'You met the fallen ones. You found out that the voice on the ship is Asta, and that she is alive. And tomorrow night, the whole swarm is coming.',
      learned: [
        '<b>for … siden</b> (back in the past), <b>om …</b> (forward, in the future), <b>i …</b> (how long) · i går, i morgen.',
        '<b>hvornår?</b> asks · <b>da</b> one time in the past · <b>når</b> in the future, or every time.',
        'After a når- or da-sentence, the verb comes first: <span>Når det regner, savner jeg havet.</span>',
        'The little words (ikke, også, gerne, stadig, altid) stand <b>after the verb</b>, but <b>before it</b> after fordi, da, når and at.',
        '<b>Det ved jeg ikke endnu.</b> · <b>Det kommer an på …</b> · <b>Jeg savner …</b> · <b>Hvor længe har du været her?</b>',
        'The vowels in <b>blive</b>, <b>hende</b> and <b>længe</b>, and how a verb gives its stress away: rejser <b>hjem</b>.'
      ]
    });
    E.next('k1a3');
  }

  E.chapter({ id: 'k1a2', k: 'k1', kTitle: 'Kapitel 1 · Ankomsten', title: 'Afsnit 2 · Hvor længe?', label: 'Kapitel 1 · Hvor længe?', run });
})();
