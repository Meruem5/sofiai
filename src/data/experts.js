// Ported verbatim from sofia-roster-tier2-animalt-hu.html — do not reword.
// All copy is Hungarian; the confidence breakdown numbers (including Anna's
// −6 penalty line) are intentional and part of the scripted demo.

export const SOFIA = {
  id: 'sofia',
  name: 'Sofia',
  role: 'AI asszisztens',
  greeting: 'Szia! Miben segíthetek?',
  readout: 'Kérdezz valamit, és megmutatom, mennyire vagyok biztos benne.',
}

export const EXPERTS = {
  tibor: {
    id: 'tibor', name: 'Tibor', role: 'stratégiai tanácsadó', hair: '#5C3A1E', cloth: '#C9791E',
    ask: 'Szófia, segíts már, mi az az üzleti modell canvas?', allowEscalation: true,
    hybrid: {
      pct: 62, tier: 'amber',
      caption: 'Sziasztok! Az AI-s találatok alapján az üzleti modell canvas egy egylapos stratégiai eszköz — de van róla saját anyagom is, ebből kiegészítem.',
      txt: ['Az üzleti modell canvas egy egylapos, kilenc blokkos eszköz, amivel gyorsan átlátod, hogyan teremt és szerez meg egy vállalkozás értéket.',
        'A vevőértékből két ág indul: az egyik a vevő azonosítását, elérését és a tőle érkező pénzáramokat mutatja, a másik az előállításhoz szükséges tevékenységeket, erőforrásokat és költségeket.'],
      srcs: [{ ic: '📄', t: 'Üzleti modell canvas — a kilenc blokk gyakorlatban', by: 'Tibor · stratégiai tanácsadó' }],
      breakdown: [['Szakterületi AI-alap', 28], ['Tibor publikált anyaga', 26], ['A források egyetértése', 8]],
    },
    human: {
      pct: 93, tier: 'green',
      caption: 'Ezt már a saját szavaimmal írtam le egy ügyfelemnek — felolvasom, amit neki mondtam.',
      txt: ['„Az üzleti modell egy logikai keretet ad, az üzleti terv viszont egy útvonalterv.',
        'Az mutatja be, hogy a jelenlegi helyzetünkből kiindulva, milyen intézkedéseken és fejlesztéseken keresztül juthatunk el egy célzott állapotba, jellemzően egy éves időszakban.”'],
      srcs: [{ ic: '💬', t: 'Tibor válasza egy ügyfélnek, élő chatből', by: 'Tibor · stratégiai tanácsadó' }],
      breakdown: [['Tibor saját, chatelt szövege', 93], ['AI kiegészítés', 0], ['Nincs mit ellenőrizni külső AI-val', 0]],
    },
  },
  balint: {
    id: 'balint', name: 'Kovács Bálint', role: 'vízvezeték-szerelő mester', hair: '#2E2A26', cloth: '#3E7EA0',
    ask: 'Csöpög a víz a mosogató alatt, mit tegyek?', allowEscalation: false,
    hybrid: {
      pct: 88, tier: 'green',
      caption: 'Szia! Ezt már korábban részletesen megírtam — ebből most összefoglalom a lényeget.',
      txt: ['A mosogató alatti szivárgás leggyakrabban három helyről jön: a szifon hollandi anyájáról, egy vízbekötés csatlakozásáról, vagy a mosogatószűrő tömítéséről.',
        'Törölj szárazra mindent, és tíz percig figyeld, hol jelenik meg újra a nedvesség — utána a csöpögő műanyag anyát elég kézzel egy negyed fordulattal meghúzni, csőfogó nélkül.'],
      srcs: [{ ic: '📄', t: 'Mosogató alatti szivárgás: ebben a sorrendben', by: 'Kovács Bálint · vízvezeték-szerelő mester' }],
      breakdown: [['Szakterületi AI-alap', 34], ['Bálint publikált anyaga', 41], ['A források egyetértése', 13]],
    },
  },
  anna: {
    id: 'anna', name: 'Dr. Balogh Anna', role: 'ügyvéd, bérleti jog', hair: '#5C2A2E', cloth: '#7C4FA3',
    ask: 'A főbérlő nem adja vissza a kauciót, és nem mondja meg, miért.', allowEscalation: false,
    hybrid: {
      pct: 79, tier: 'amber',
      caption: 'Ez valószínűleg megoldható tárgyalással, de mielőtt bármit aláírnál, van pár dolog, amit tisztázni kell — ebben segítek.',
      txt: ['A kaució a károk és az elmaradt bérleti díj fedezete, nem díj, amit a főbérlő a kulcsok őrzéséért kap. Az nyer, aki dokumentálta a lakás állapotát.',
        'Küldj egy írásos felszólítást, amiben tételes elszámolást kérsz a levonásokról, válaszadási határidővel — ez az első lépés, amit egy ügyvéd is kérni fog.'],
      srcs: [{ ic: '📄', t: 'Kaucióviták: mi dönti el őket valójában', by: 'Dr. Balogh Anna · ügyvéd, bérleti jog' }],
      breakdown: [['Szakterületi AI-alap', 30], ['Anna publikált anyaga', 36], ['A források egyetértése', 19], ['Helyi szabály, amit nem ellenőrzök', -6]],
    },
  },
}

// Tier label variants used in three different places in the UI.
export const TIER_READOUT = { red: 'alacsony biztonság', amber: 'közepes biztonság', green: 'magas biztonság' }
export const TIER_CHIP = { red: 'AI-alapú', amber: 'AI + szakértői anyag', green: 'szakértő saját szavai' }
export const TIER_SHORT = { red: 'alacsony', amber: 'közepes', green: 'magas' }
