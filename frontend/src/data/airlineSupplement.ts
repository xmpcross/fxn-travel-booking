// Hand-maintained supplementary data for the major carriers. Keyed by
// uppercase IATA code. Duffel's /air/airlines feed only gives us logo +
// name + IATA + conditions-of-carriage URL, so anything below (alliance,
// hubs, founded year, HQ country) comes from common reference data.
//
// Coverage is intentionally limited to the top ~50 commercial carriers
// that travellers are most likely to look up; anyone missing here just
// renders the Duffel-native hero without this extra panel. To extend,
// add another entry — no per-page wiring required.
//
// Maintenance notes:
//   - Founded year refers to the legal incorporation of the current
//     entity (so KLM = 1919, but ITA Airways = 2021, not Alitalia).
//   - Hubs are the carrier's primary operational bases, not every
//     focus city. Cap at three.
//   - Alliance reflects current full membership only. Suspended
//     members (e.g. Aeroflot post-2022) are listed without an alliance.

export type AirlineAlliance = 'Star Alliance' | 'oneworld' | 'SkyTeam'

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First'

export type AirlineSupplement = {
  alliance?: AirlineAlliance
  hubs?: Array<{ iata: string; name: string }>
  founded?: number
  country?: string
  headquarters?: string
  // ----- New fields (additional facts, enriched from originfacts.com
  // where applicable). Everything is optional so rendering degrades
  // gracefully for airlines without curated data. -----
  /** 3-letter ICAO airline code (e.g. "QFA" for Qantas). */
  icao?: string
  /** Radio callsign (e.g. "Qantas", "Speedbird"). */
  callsign?: string
  /** Homepage URL without protocol prefix (e.g. "qantas.com"). */
  website?: string
  /** Customer service phone (international format, e.g. "+61 2 9691 3636"). */
  phone?: string
  /**
   * Longer-form "About this airline" copy — 3–5 short paragraphs of public
   * background (history, network scope, fleet/cabin highlights, notable
   * notes). Rendered in a dedicated card on the detail page. Plain strings,
   * each element = one paragraph.
   */
  overview?: string[]
  /** Frequent-flyer programme name (e.g. "Qantas Frequent Flyer", "Skywards"). */
  loyaltyProgramme?: string
  /** Sign-up / programme home URL (full https://). Renders the programme name as a link. */
  loyaltyProgrammeUrl?: string
  /** Cabin classes the airline regularly sells. */
  cabinClasses?: CabinClass[]
  /** Approximate fleet size (aircraft count). */
  fleetSize?: number
  /** Aircraft families flown (e.g. ["Airbus A380", "Boeing 787"]). */
  fleetTypes?: string[]
  /** Major codeshare / partner airline IATA codes. */
  partners?: string[]
  /** Subsidiary airlines / brands. */
  subsidiaries?: Array<{ name: string; iata?: string }>
  /**
   * Optional originfacts.com slug. When present, the detail page renders a
   * "Read more" link to https://www.originfacts.com/airlines/{slug}. Defaults
   * to the airline name lowercased with hyphens if not specified.
   */
  originFactsSlug?: string
  /**
   * Aggregated customer review. Curated manually for the top airlines —
   * source is shown next to the score. score is on a 1.0–10.0 scale to match
   * the stay-search card convention.
   */
  review?: {
    score: number // 0–10
    count?: number
    source?: string // e.g. "Skytrax", "TripAdvisor"
  }
  /**
   * Baggage policy headlines (one row each — terse strings). Render as a
   * dl on the detail page. Always defer to the airline's CoC for the
   * definitive rules; this is a quick-reference summary.
   */
  baggagePolicy?: {
    cabin?: string
    checked?: string
    cabinDimensions?: string
    extraBagFee?: string
  }
  /**
   * "Recently booked with this airline" — curated placeholder examples
   * until a real bookings DB query is wired up. Each entry is rendered
   * as a small chip: "{origin} → {destination}" + relative timestamp.
   */
  sampleBookings?: Array<{
    origin: string
    destination: string
    when: string // human label e.g. "2 hours ago", "today"
  }>
}

const SUPPLEMENTS: Record<string, AirlineSupplement> = {
  // ---- Star Alliance ----
  LH: {
    alliance: 'Star Alliance',
    hubs: [
      { iata: 'FRA', name: 'Frankfurt' },
      { iata: 'MUC', name: 'Munich' },
    ],
    founded: 1955,
    country: 'Germany',
    headquarters: 'Cologne',
    icao: 'DLH',
    callsign: 'Lufthansa',
    website: 'lufthansa.com',
    phone: '+49 69 86 799 799',
    loyaltyProgramme: 'Miles & More',
    loyaltyProgrammeUrl: 'https://www.miles-and-more.com/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 280,
    fleetTypes: ['Airbus A320 family', 'Airbus A330', 'Airbus A340', 'Airbus A350', 'Airbus A380', 'Boeing 747', 'Boeing 787'],
    partners: ['UA', 'AC', 'SQ', 'NH', 'TK', 'TG'],
    subsidiaries: [
      { name: 'Swiss', iata: 'LX' },
      { name: 'Austrian Airlines', iata: 'OS' },
      { name: 'Brussels Airlines', iata: 'SN' },
      { name: 'Eurowings', iata: 'EW' },
    ],
    overview: [
      'Lufthansa is the flag carrier of Germany and the largest airline in Europe by fleet size, headquartered in Cologne with twin hubs at Frankfurt Airport (FRA) and Munich Airport (MUC). Founded in 1955 (the post-war successor to the pre-war Deutsche Luft Hansa), Lufthansa anchors the Lufthansa Group which also owns Swiss, Austrian Airlines, Brussels Airlines, and Eurowings.',
      'The mainline fleet spans the Airbus A320 family for European short-haul, Airbus A340 / A350, Boeing 747-8 (Lufthansa is the largest 747 operator), Boeing 787 Dreamliner, and the Airbus A380 (returning to service after a brief pandemic-era retirement). The carrier offers four cabin classes — Economy, Premium Economy, Business, and First — on long-haul.',
      'Lufthansa is a founding member of Star Alliance (1997) and operates joint ventures with United, Air Canada, ANA, and Singapore Airlines. The Frankfurt hub is among the most heavily-connected airports in Europe, and Munich provides a secondary southern European gateway.',
      'Miles & More is the airline\'s loyalty programme — shared with the wider Lufthansa Group and many partners. Lufthansa\'s First Class is one of the few remaining "true First" products on a European carrier, complete with dedicated First Class terminals at Frankfurt and Munich.',
    ],
    review: { score: 7.6, count: 52000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 8kg cabin bag + 1 personal item',
      checked: 'Economy 23kg, Premium 23kg ×2, Business 32kg ×2, First 32kg ×3',
      cabinDimensions: '55 × 40 × 23 cm',
      extraBagFee: 'From EUR 65 per additional bag',
    },
    sampleBookings: [
      { origin: 'FRA', destination: 'JFK', when: '40 minutes ago' },
      { origin: 'MUC', destination: 'BKK', when: 'today' },
    ],
  },
  UA: {
    alliance: 'Star Alliance',
    hubs: [
      { iata: 'ORD', name: 'Chicago O’Hare' },
      { iata: 'EWR', name: 'Newark' },
      { iata: 'SFO', name: 'San Francisco' },
    ],
    founded: 1926,
    country: 'United States',
    headquarters: 'Chicago, IL',
    icao: 'UAL',
    callsign: 'United',
    website: 'united.com',
    phone: '+1 800 864 8331',
    loyaltyProgramme: 'MileagePlus',
    loyaltyProgrammeUrl: 'https://www.united.com/mileageplus',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 950,
    fleetTypes: ['Airbus A319', 'Airbus A320', 'Boeing 737 MAX', 'Boeing 757', 'Boeing 767', 'Boeing 777', 'Boeing 787'],
    partners: ['LH', 'AC', 'SQ', 'NH', 'NZ'],
    overview: [
      'United Airlines is one of the "Big Three" US legacy carriers, headquartered in Chicago, Illinois. Founded in 1926 as part of the early US airmail system, today United operates one of the most extensive global route networks of any airline, with hubs at Chicago O\'Hare, Newark, San Francisco, Houston, Denver, Washington Dulles and Los Angeles.',
      'The fleet ranges from Airbus A319 / A320 narrow-bodies and Boeing 737 MAX on domestic and short-haul, through Boeing 757 and 767 on transatlantic, to Boeing 777-300ER and 787-9/-10 Dreamliners on long-haul. Polaris business class is United\'s flagship long-haul product.',
      'United is a founding member of the Star Alliance (1997) and operates joint ventures with Lufthansa, Air Canada, ANA and Singapore Airlines to extend reach across Europe, Asia, and the Pacific. The carrier serves more international destinations from US gateways than any other US airline.',
      'MileagePlus is United\'s loyalty programme — points earn on revenue (not miles flown), with status tiers from Premier Silver through Premier 1K and Global Services. The programme is one of the most-redeemed in the world thanks to deep Star Alliance partner availability.',
    ],
    review: { score: 7.2, count: 71000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × cabin bag + 1 personal item (Basic Economy: personal item only)',
      checked: 'First checked bag from USD 35; Premier/Business: free',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From USD 45 per additional bag',
    },
    sampleBookings: [
      { origin: 'SFO', destination: 'HKG', when: '2 hours ago' },
      { origin: 'EWR', destination: 'LHR', when: 'today' },
    ],
  },
  AC: {
    alliance: 'Star Alliance',
    hubs: [
      { iata: 'YYZ', name: 'Toronto Pearson' },
      { iata: 'YUL', name: 'Montréal–Trudeau' },
      { iata: 'YVR', name: 'Vancouver' },
    ],
    founded: 1937,
    country: 'Canada',
    headquarters: 'Saint-Laurent, QC',
  },
  NH: {
    alliance: 'Star Alliance',
    hubs: [
      { iata: 'HND', name: 'Tokyo Haneda' },
      { iata: 'NRT', name: 'Tokyo Narita' },
    ],
    founded: 1952,
    country: 'Japan',
    headquarters: 'Tokyo',
    icao: 'ANA',
    callsign: 'All Nippon',
    website: 'ana.co.jp',
    phone: '+81 3 6741 1120',
    loyaltyProgramme: 'ANA Mileage Club',
    loyaltyProgrammeUrl: 'https://www.ana.co.jp/en/jp/amc/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 215,
    fleetTypes: ['Airbus A320 family', 'Airbus A380', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'LH', 'SQ', 'AC'],
    overview: [
      'All Nippon Airways (ANA) is the largest airline in Japan, founded in 1952. Operating from twin hubs at Tokyo Haneda and Tokyo Narita, ANA serves a vast domestic network across Japan plus long-haul international routes to North America, Europe, Asia, and Oceania.',
      'The fleet spans Boeing 787-8 / 787-9 / 787-10 Dreamliners (ANA was launch customer), Boeing 777-300ER and 777-9, Airbus A320 family on domestic, and the iconic Airbus A380 painted as "Flying Honu" sea turtles for Tokyo–Honolulu service. The Boeing 737-800 covers shorter Japan routes.',
      'ANA is a member of Star Alliance (since 1999) and a long-time codeshare partner of United Airlines and Lufthansa. The carrier consistently ranks at the top of Skytrax World Airline Awards for service quality and cabin product, and "The Room" — its Business cabin on the 777-300ER — is widely cited as one of the best in the industry.',
      'ANA Mileage Club is the loyalty programme — earn miles on revenue flying and a wide partner network. ANA also operates low-cost subsidiary Peach Aviation (MM) which serves point-to-point leisure routes across Japan and parts of Asia.',
    ],
    review: { score: 8.9, count: 39000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 10kg cabin bag + 1 personal item',
      checked: 'Economy 23kg ×2, Premium 23kg ×2, Business 32kg ×2, First 32kg ×3',
      cabinDimensions: '55 × 40 × 25 cm',
      extraBagFee: 'From JPY 5,000 per additional bag',
    },
    sampleBookings: [
      { origin: 'HND', destination: 'LAX', when: '1 hour ago' },
      { origin: 'NRT', destination: 'LHR', when: 'today' },
    ],
  },
  SQ: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'SIN', name: 'Singapore Changi' }],
    founded: 1972,
    country: 'Singapore',
    headquarters: 'Singapore',
    icao: 'SIA',
    callsign: 'Singapore',
    website: 'singaporeair.com',
    phone: '+65 6223 8888',
    loyaltyProgramme: 'KrisFlyer',
    loyaltyProgrammeUrl: 'https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 145,
    fleetTypes: ['Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'NH', 'LH', 'AC', 'VS'],
    subsidiaries: [
      { name: 'Scoot', iata: 'TR' },
    ],
    overview: [
      'Singapore Airlines is the flag carrier of Singapore, founded in 1972 when Malaysia–Singapore Airlines was split between the two countries. Operating from a single mega-hub at Singapore Changi Airport — repeatedly voted the world\'s best — the airline built a reputation as the benchmark for premium long-haul cabin product and service.',
      'The fleet is all wide-body: Airbus A350-900 (including the ultra-long-range variant used for the world\'s longest commercial flight, SIN–JFK), Airbus A380, Boeing 777-300ER and Boeing 787-10. Singapore Airlines was the first operator of both the A380 and the 787-10, reflecting its long-running role as a launch customer for new wide-body types.',
      'Service classes range from Economy through Premium Economy, Business and First, with the Suites cabin on the A380 representing the airline\'s top tier — a private double-bed enclosure that defines the segment. SQ is a founding member of Star Alliance (1997) and partners closely with United, Lufthansa and other carriers across the network.',
      'KrisFlyer is the loyalty programme; the group also operates low-cost subsidiary Scoot, which serves point-to-point leisure routes within Asia and on selected medium-haul markets. The full group flies under one of the most coveted reputations in commercial aviation — consistently top of the Skytrax World Airline Awards.',
    ],
    review: { score: 9.2, count: 76000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg cabin bag + 1 personal item',
      checked: 'Economy 30kg, Premium 35kg, Business 40kg, Suites 50kg',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From SGD 80 per additional bag',
    },
    sampleBookings: [
      { origin: 'SIN', destination: 'SYD', when: '1 hour ago' },
      { origin: 'SIN', destination: 'LHR', when: '3 hours ago' },
    ],
  },
  TG: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'BKK', name: 'Bangkok Suvarnabhumi' }],
    founded: 1960,
    country: 'Thailand',
    headquarters: 'Bangkok',
  },
  TK: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'IST', name: 'Istanbul' }],
    founded: 1933,
    country: 'Türkiye',
    headquarters: 'Istanbul',
    icao: 'THY',
    callsign: 'Turkair',
    website: 'turkishairlines.com',
    phone: '+90 850 333 0 849',
    loyaltyProgramme: 'Miles&Smiles',
    loyaltyProgrammeUrl: 'https://www.turkishairlines.com/en-int/miles-and-smiles/',
    cabinClasses: ['Economy', 'Business'],
    fleetSize: 440,
    fleetTypes: ['Airbus A319/320/321', 'Airbus A330', 'Airbus A350', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'LH', 'SQ', 'NH'],
    overview: [
      'Turkish Airlines is the flag carrier of Türkiye, founded in 1933. From its mega-hub at Istanbul Airport (IST) — which moved from the older Atatürk Airport in 2019 — the carrier serves more countries than any other airline in the world, reaching over 340 destinations across six continents.',
      'The fleet is one of the most diverse of any major carrier: Airbus A319 / A320 / A321 family and Boeing 737 (including MAX 8 / 9) for short-haul, Boeing 777-300ER, Airbus A330-300 and A350-900 / -1000 for long-haul, and Boeing 787-9 Dreamliners. The single Istanbul hub and central geography give Turkish a uniquely efficient transit network for one-stop connections.',
      'Turkish is a member of Star Alliance (since 2008) and operates extensive codeshare arrangements with United, Lufthansa, and other partners. The carrier has used its hub geography to build connections between Europe / Africa and Asia / Oceania that other long-haul carriers can\'t match on price or frequency.',
      'Miles&Smiles is the loyalty programme — status tiers from Classic to Elite Plus, with redemptions across Star Alliance and a growing co-branded card portfolio. Turkish\'s long-haul Business cabin features the celebrated "Flying Chef" service.',
    ],
    review: { score: 7.9, count: 29000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 8kg cabin bag + 1 personal item',
      checked: 'Economy 30kg, Business 40kg (international routes)',
      cabinDimensions: '55 × 40 × 23 cm',
      extraBagFee: 'From USD 50 per additional bag',
    },
    sampleBookings: [
      { origin: 'IST', destination: 'JFK', when: '1 hour ago' },
      { origin: 'IST', destination: 'SIN', when: 'today' },
    ],
  },
  NZ: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'AKL', name: 'Auckland' }],
    founded: 1940,
    country: 'New Zealand',
    headquarters: 'Auckland',
    icao: 'ANZ',
    callsign: 'New Zealand',
    website: 'airnewzealand.com',
    phone: '+64 9 357 3000',
    loyaltyProgramme: 'Airpoints',
    loyaltyProgrammeUrl: 'https://www.airnewzealand.com/airpoints',
    cabinClasses: ['Economy', 'Premium Economy', 'Business'],
    fleetSize: 105,
    fleetTypes: ['Airbus A320 family', 'Airbus A321neo', 'Boeing 787-9', 'ATR 72'],
    partners: ['UA', 'AC', 'SQ', 'NH'],
    overview: [
      'Air New Zealand is the flag carrier of New Zealand, founded in 1940 as Tasman Empire Airways Limited (TEAL). Headquartered in Auckland with its main hub at Auckland Airport (AKL), the carrier connects the country to Australia, the Pacific Islands, Asia, North America, and the United Kingdom.',
      'The long-haul fleet is centred on Boeing 787-9 Dreamliners and an order book for 787-10s, complemented by the iconic Skycouch™ — a row of three Economy seats that converts into a flat surface for families or couples. Short-haul is flown by Airbus A320 family and A321neo, with regional services on ATR 72-600 turboprops via Air New Zealand Link.',
      'Air New Zealand is a Star Alliance member (since 1999) and partners with United, Singapore Airlines, ANA, and Air Canada to extend reach beyond Auckland. The carrier punches well above its weight in product innovation — Skycouch, Premium Economy "Spaceseat", and Business Premier all originated here.',
      'Airpoints is the frequent-flyer programme, with Silver, Gold, Elite, and Elite Priority One status. Air New Zealand consistently ranks among the world\'s top airlines for safety (AirlineRatings) and on-time performance.',
    ],
    review: { score: 8.3, count: 22000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg cabin bag + 1 personal item',
      checked: 'Seat-only fares: paid; Economy/Premium/Business: included by fare',
      cabinDimensions: '118 cm total dimensions',
      extraBagFee: 'From NZD 30 per additional bag',
    },
    sampleBookings: [
      { origin: 'AKL', destination: 'LAX', when: '30 minutes ago' },
      { origin: 'AKL', destination: 'SYD', when: 'today' },
    ],
  },
  OZ: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'ICN', name: 'Seoul Incheon' }],
    founded: 1988,
    country: 'South Korea',
    headquarters: 'Seoul',
  },
  LX: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'ZRH', name: 'Zurich' }],
    founded: 2002,
    country: 'Switzerland',
    headquarters: 'Basel',
  },
  OS: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'VIE', name: 'Vienna' }],
    founded: 1957,
    country: 'Austria',
    headquarters: 'Vienna',
  },
  BR: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'TPE', name: 'Taipei Taoyuan' }],
    founded: 1989,
    country: 'Taiwan',
    headquarters: 'Taoyuan City',
  },
  CA: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'PEK', name: 'Beijing Capital' }],
    founded: 1988,
    country: 'China',
    headquarters: 'Beijing',
  },
  SK: {
    alliance: 'Star Alliance',
    hubs: [
      { iata: 'CPH', name: 'Copenhagen' },
      { iata: 'ARN', name: 'Stockholm Arlanda' },
      { iata: 'OSL', name: 'Oslo' },
    ],
    founded: 1946,
    country: 'Sweden / Denmark / Norway',
    headquarters: 'Solna',
  },
  TP: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'LIS', name: 'Lisbon' }],
    founded: 1945,
    country: 'Portugal',
    headquarters: 'Lisbon',
  },
  MS: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'CAI', name: 'Cairo' }],
    founded: 1932,
    country: 'Egypt',
    headquarters: 'Cairo',
  },
  ET: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'ADD', name: 'Addis Ababa' }],
    founded: 1945,
    country: 'Ethiopia',
    headquarters: 'Addis Ababa',
  },
  A3: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'ATH', name: 'Athens' }],
    founded: 1987,
    country: 'Greece',
    headquarters: 'Athens',
  },
  LO: {
    alliance: 'Star Alliance',
    hubs: [{ iata: 'WAW', name: 'Warsaw' }],
    founded: 1929,
    country: 'Poland',
    headquarters: 'Warsaw',
  },

  // ---- oneworld ----
  AA: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'DFW', name: 'Dallas/Fort Worth' },
      { iata: 'CLT', name: 'Charlotte' },
      { iata: 'MIA', name: 'Miami' },
    ],
    founded: 1930,
    country: 'United States',
    headquarters: 'Fort Worth, TX',
    icao: 'AAL',
    callsign: 'American',
    website: 'aa.com',
    phone: '+1 800 433 7300',
    loyaltyProgramme: 'AAdvantage',
    loyaltyProgrammeUrl: 'https://www.aa.com/aadvantage',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 970,
    fleetTypes: ['Airbus A319', 'Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'CX', 'QF', 'JL', 'IB'],
    overview: [
      'American Airlines is the largest US airline measured by fleet size, revenue, and scheduled passengers carried, headquartered in Fort Worth, Texas. Tracing its roots to 1930, the carrier has grown through a series of mergers — most recently with US Airways in 2013 — into a national network anchored on hubs at Dallas/Fort Worth, Charlotte, Miami, Chicago O\'Hare, and Phoenix.',
      'The mainline fleet is one of the most diverse of any US carrier: Airbus A319, A320 and A321 (including the long-range A321XLR on order for transatlantic), Boeing 737-800 and 737 MAX 8 for domestic and short international, and Boeing 777-200ER, 777-300ER and 787-8/-9 wide-bodies for long-haul. Regional flying is contracted to American Eagle subsidiaries.',
      'American is a founding member of the oneworld alliance and a core partner in the transatlantic joint business with British Airways, Iberia and Finnair. The carrier connects to over 350 destinations across the Americas, Europe, the Middle East and Asia through its alliance and codeshare network.',
      'AAdvantage is the airline\'s frequent-flyer programme, one of the oldest in commercial aviation (founded 1981) and one of the largest by membership. The programme offers status tiers from Gold through Executive Platinum and a long list of redemption partners across oneworld and beyond.',
    ],
    review: { score: 7.0, count: 65000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × cabin bag + 1 personal item (Basic Economy: personal item only)',
      checked: 'First checked bag from USD 35; First/Business: 2 free',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From USD 45 per additional bag',
    },
    sampleBookings: [
      { origin: 'DFW', destination: 'LHR', when: '1 hour ago' },
      { origin: 'MIA', destination: 'JFK', when: 'today' },
    ],
  },
  BA: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'LHR', name: 'London Heathrow' },
      { iata: 'LGW', name: 'London Gatwick' },
    ],
    founded: 1974,
    country: 'United Kingdom',
    headquarters: 'London',
    icao: 'BAW',
    callsign: 'Speedbird',
    website: 'britishairways.com',
    phone: '+44 203 250 0145',
    loyaltyProgramme: 'British Airways Executive Club',
    loyaltyProgrammeUrl: 'https://www.britishairways.com/en-gb/executive-club',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 280,
    fleetTypes: ['Airbus A320 family', 'Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['AA', 'IB', 'QF', 'CX', 'JL'],
    overview: [
      'British Airways is the flag carrier of the United Kingdom, formed in 1974 through the merger of BOAC (long-haul) and BEA (short-haul), with operations centred on London Heathrow Terminal 5 and a smaller presence at London Gatwick and London City. The "Speedbird" callsign carries on the long Imperial Airways heritage that pre-dates the modern entity by half a century.',
      'BA\'s fleet spans the Airbus A320 family for European short-haul, the A350 and A380 plus Boeing 777 and 787 wide-bodies for long-haul. The carrier is a founding member of the oneworld alliance and a core partner in the transatlantic joint business with American Airlines, Iberia and Finnair — a key driver of capacity between London and major US cities.',
      'Cabin classes span Euro Traveller and Club Europe on short-haul, and World Traveller (Economy), World Traveller Plus (Premium Economy), Club World (Business) and First on long-haul. The First cabin survives as one of the few remaining "true First" products on a Western airline, and the recently introduced Club Suites mark a generational upgrade to the Business product.',
      'Frequent flyers earn Avios and tier points through the British Airways Executive Club, a programme deeply integrated with the oneworld alliance and with the Avios family of partner schemes (Iberia Plus, Qatar Privilege Club, etc.). BA is part of the International Airlines Group (IAG), which also owns Iberia, Aer Lingus, Vueling and LEVEL.',
    ],
    review: { score: 7.5, count: 56000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 23kg cabin bag + 1 personal item (most fares)',
      checked: 'Economy from 23kg, Business 32kg, First 32kg ×2',
      cabinDimensions: '56 × 45 × 25 cm',
      extraBagFee: 'From GBP 65 per additional bag',
    },
    sampleBookings: [
      { origin: 'LHR', destination: 'JFK', when: '20 minutes ago' },
      { origin: 'LHR', destination: 'SYD', when: '2 hours ago' },
    ],
  },
  QF: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'SYD', name: 'Sydney' },
      { iata: 'MEL', name: 'Melbourne' },
    ],
    founded: 1920,
    country: 'Australia',
    headquarters: 'Sydney',
    icao: 'QFA',
    callsign: 'Qantas',
    website: 'qantas.com',
    phone: '+61 2 9691 3636',
    loyaltyProgramme: 'Qantas Frequent Flyer',
    loyaltyProgrammeUrl: 'https://www.qantas.com/au/en/frequent-flyer.html',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 130,
    fleetTypes: ['Airbus A330', 'Airbus A380', 'Boeing 737', 'Boeing 787-9'],
    partners: ['BA', 'CX', 'AA', 'JL', 'EK'],
    subsidiaries: [
      { name: 'QantasLink' },
      { name: 'Jetstar', iata: 'JQ' },
    ],
    overview: [
      'Qantas Airways is the flag carrier of Australia and one of the world\'s oldest continuously operating airlines, founded in 1920 in regional Queensland as Queensland and Northern Territory Aerial Services — the source of its iconic abbreviation. From those bush-flying origins the carrier grew into a global long-haul network anchored in Sydney and Melbourne, today serving the Pacific, Asia, the Middle East, North America and Europe.',
      'The mainline operation flies a wide-body and narrow-body mix — Airbus A380 and A330 family on its premium international trunk routes, Boeing 787-9 Dreamliners on ultra-long-haul services from Perth to London and beyond, and Boeing 737s on dense domestic and short-haul international networks. Qantas Freight extends the brand into dedicated cargo with its own fleet.',
      'Qantas is a founding member of the oneworld alliance (1999), partnering closely with British Airways, Cathay Pacific, American Airlines and Japan Airlines, alongside a long-standing bilateral deal with Emirates. Its Project Sunrise initiative targets nonstop services from east-coast Australia to London and New York using Airbus A350-1000s, reshaping how the airline connects the southern hemisphere to the rest of the world.',
      'The group operates two airline brands under its corporate roof: full-service Qantas mainline and the low-cost subsidiary Jetstar, plus regional carrier QantasLink. Travellers earn and redeem points through the Qantas Frequent Flyer programme, which has become one of the largest loyalty schemes in the Asia-Pacific region.',
    ],
    review: { score: 8.4, count: 47200, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg carry-on + 1 personal item',
      checked: 'Economy 23kg, Business 40kg (international)',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From AUD 80 per additional bag',
    },
    sampleBookings: [
      { origin: 'SYD', destination: 'LHR', when: '2 hours ago' },
      { origin: 'MEL', destination: 'LAX', when: 'today' },
      { origin: 'BNE', destination: 'SIN', when: '4 hours ago' },
    ],
  },
  JL: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'HND', name: 'Tokyo Haneda' },
      { iata: 'NRT', name: 'Tokyo Narita' },
    ],
    founded: 1951,
    country: 'Japan',
    headquarters: 'Tokyo',
    icao: 'JAL',
    callsign: 'Japan Air',
    website: 'jal.co.jp',
    phone: '+81 3 5460 0511',
    loyaltyProgramme: 'JAL Mileage Bank',
    loyaltyProgrammeUrl: 'https://www.jal.co.jp/jp/en/jmb/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 165,
    fleetTypes: ['Airbus A350', 'Boeing 737', 'Boeing 767', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'AA', 'QF', 'CX', 'IB'],
    overview: [
      'Japan Airlines (JAL) is one of Japan\'s two major airlines, founded in 1951 as the country\'s first post-war commercial carrier. Headquartered in Tokyo with hubs at Tokyo Haneda and Tokyo Narita, JAL operates a global network reaching North America, Europe, Asia, and Oceania.',
      'The fleet is anchored on the Airbus A350-900 / A350-1000 (which replaced retired 777-200s on domestic and international long-haul) plus Boeing 787-8 / 787-9 Dreamliners, Boeing 777-300ER, Boeing 767, and Boeing 737-800 for shorter routes. JAL was the worldwide launch customer for the A350-1000.',
      'JAL is a member of the oneworld alliance (since 2007) and partners closely with American Airlines, British Airways, Qantas, and Cathay Pacific. The carrier operates Japan\'s flag-carrier responsibilities on prestige long-haul routes and is a regular Skytrax service-quality award winner.',
      'JAL Mileage Bank is the frequent-flyer programme, with status from Crystal through Diamond JMB. JAL\'s "Sky Suite" Business cabin and First Class on the 777 / A350 are widely regarded as exemplars of Japanese hospitality in the air.',
    ],
    review: { score: 8.7, count: 36000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 10kg cabin bag + 1 personal item',
      checked: 'Economy 23kg ×2, Premium 23kg ×2, Business 32kg ×3, First 32kg ×3',
      cabinDimensions: '55 × 40 × 25 cm',
      extraBagFee: 'From JPY 5,000 per additional bag',
    },
    sampleBookings: [
      { origin: 'HND', destination: 'SFO', when: '2 hours ago' },
      { origin: 'NRT', destination: 'JFK', when: 'today' },
    ],
  },
  CX: {
    alliance: 'oneworld',
    hubs: [{ iata: 'HKG', name: 'Hong Kong' }],
    founded: 1946,
    country: 'Hong Kong',
    headquarters: 'Hong Kong',
    icao: 'CPA',
    callsign: 'Cathay',
    website: 'cathaypacific.com',
    phone: '+852 2747 3333',
    loyaltyProgramme: 'Cathay (Asia Miles)',
    loyaltyProgrammeUrl: 'https://www.cathaypacific.com/cx/en_HK/cathay-membership.html',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 180,
    fleetTypes: ['Airbus A330', 'Airbus A350', 'Boeing 777', 'Boeing 747F'],
    partners: ['BA', 'AA', 'QF', 'JL'],
    overview: [
      'Cathay Pacific is the flag carrier of Hong Kong, founded in 1946 by an American and an Australian aviator who started flying surplus military DC-3s out of Shanghai. From its dedicated terminal at Hong Kong International Airport (HKG), Cathay built a reputation as one of Asia\'s premier long-haul carriers.',
      'The passenger fleet centres on the Airbus A350-900 / A350-1000 and Boeing 777-300ER for long-haul, with the Airbus A330 family on regional Asia routes. Cathay Pacific Cargo operates a Boeing 747-8F freighter fleet — one of the largest dedicated air-cargo operations in the world.',
      'Cathay is a member of the oneworld alliance (since 1999) and partners closely with British Airways, Qantas, American Airlines, and Japan Airlines. Hong Kong\'s geographic position makes Cathay one of the most efficient one-stop connections between Europe / Australasia and East Asia.',
      'Cathay (Asia Miles) is the airline\'s loyalty programme — Diamond, Gold, Silver, and Green tier status. Cathay\'s Business cabin and First Class on the 777 are perennial Skytrax category winners, and the airline operates one of the most extensive lounge networks in Asia.',
    ],
    review: { score: 8.5, count: 44000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg cabin bag + 1 personal item',
      checked: 'Economy 30kg, Premium 35kg, Business 40kg, First 50kg',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From HKD 600 per additional bag',
    },
    sampleBookings: [
      { origin: 'HKG', destination: 'LHR', when: '1 hour ago' },
      { origin: 'HKG', destination: 'SYD', when: 'today' },
    ],
  },
  IB: {
    alliance: 'oneworld',
    hubs: [{ iata: 'MAD', name: 'Madrid' }],
    founded: 1927,
    country: 'Spain',
    headquarters: 'Madrid',
  },
  AY: {
    alliance: 'oneworld',
    hubs: [{ iata: 'HEL', name: 'Helsinki' }],
    founded: 1923,
    country: 'Finland',
    headquarters: 'Vantaa',
  },
  LA: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'SCL', name: 'Santiago' },
      { iata: 'LIM', name: 'Lima' },
      { iata: 'GRU', name: 'São Paulo Guarulhos' },
    ],
    founded: 2012,
    country: 'Chile',
    headquarters: 'Santiago',
  },
  QR: {
    alliance: 'oneworld',
    hubs: [{ iata: 'DOH', name: 'Doha Hamad' }],
    founded: 1993,
    country: 'Qatar',
    headquarters: 'Doha',
    icao: 'QTR',
    callsign: 'Qatari',
    website: 'qatarairways.com',
    phone: '+974 4023 0000',
    loyaltyProgramme: 'Privilege Club',
    loyaltyProgrammeUrl: 'https://www.qatarairways.com/en/privilegeclub.html',
    cabinClasses: ['Economy', 'Business', 'First'],
    fleetSize: 230,
    fleetTypes: ['Airbus A320 family', 'Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'AA', 'CX', 'IB', 'JL'],
    overview: [
      'Qatar Airways is the flag carrier of Qatar, founded in 1993 and re-launched in 1997 under the current corporate structure. The carrier operates from its mega-hub at Hamad International Airport (DOH) in Doha — one of the world\'s most modern airport complexes — connecting more than 170 destinations across six continents.',
      'The fleet is one of the most modern in commercial aviation: Airbus A350-900 / A350-1000 (Qatar was the world\'s launch customer), Boeing 777-300ER and the upcoming 777-9, Boeing 787-8 / 787-9 Dreamliners, plus the Airbus A380 and A320 family for regional. Qatar Airways Cargo operates a substantial fleet of dedicated freighters separately.',
      'Qatar is a member of the oneworld alliance (since 2013) and partners with British Airways, American Airlines, Cathay Pacific, Iberia, and Japan Airlines. The carrier\'s global expansion has been one of the most aggressive in modern aviation history — only one stop in Doha required for most long-haul routings.',
      'Privilege Club is the Qsuite-eligible loyalty programme. Qatar Airways\' Qsuite Business cabin — featuring sliding doors, double beds, and quad-seat "family" configurations — is widely cited as the best Business product in the world and a perennial Skytrax category winner.',
    ],
    review: { score: 9.0, count: 68000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg cabin bag + 1 personal item',
      checked: 'Economy 25kg–35kg, Business 40kg, First 50kg',
      cabinDimensions: '50 × 37 × 25 cm',
      extraBagFee: 'From USD 100 per additional bag',
    },
    sampleBookings: [
      { origin: 'DOH', destination: 'LHR', when: '1 hour ago' },
      { origin: 'DOH', destination: 'SIN', when: 'today' },
    ],
  },
  AS: {
    alliance: 'oneworld',
    hubs: [
      { iata: 'SEA', name: 'Seattle' },
      { iata: 'ANC', name: 'Anchorage' },
    ],
    founded: 1932,
    country: 'United States',
    headquarters: 'SeaTac, WA',
  },
  MH: {
    alliance: 'oneworld',
    hubs: [{ iata: 'KUL', name: 'Kuala Lumpur' }],
    founded: 1972,
    country: 'Malaysia',
    headquarters: 'Sepang',
  },
  AT: {
    alliance: 'oneworld',
    hubs: [{ iata: 'CMN', name: 'Casablanca' }],
    founded: 1957,
    country: 'Morocco',
    headquarters: 'Casablanca',
  },
  RJ: {
    alliance: 'oneworld',
    hubs: [{ iata: 'AMM', name: 'Amman Queen Alia' }],
    founded: 1963,
    country: 'Jordan',
    headquarters: 'Amman',
  },
  UL: {
    alliance: 'oneworld',
    hubs: [{ iata: 'CMB', name: 'Colombo' }],
    founded: 1979,
    country: 'Sri Lanka',
    headquarters: 'Katunayake',
  },

  // ---- SkyTeam ----
  DL: {
    alliance: 'SkyTeam',
    hubs: [
      { iata: 'ATL', name: 'Atlanta' },
      { iata: 'DTW', name: 'Detroit' },
      { iata: 'MSP', name: 'Minneapolis–St. Paul' },
    ],
    founded: 1928,
    country: 'United States',
    headquarters: 'Atlanta, GA',
    icao: 'DAL',
    callsign: 'Delta',
    website: 'delta.com',
    phone: '+1 800 221 1212',
    loyaltyProgramme: 'SkyMiles',
    loyaltyProgrammeUrl: 'https://www.delta.com/skymiles',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 980,
    fleetTypes: ['Airbus A220', 'Airbus A319/320/321', 'Airbus A330', 'Airbus A350', 'Boeing 717', 'Boeing 737', 'Boeing 757', 'Boeing 767'],
    partners: ['AF', 'KL', 'KE', 'VS', 'AM'],
    overview: [
      'Delta Air Lines is one of the largest airlines in the world, headquartered in Atlanta, Georgia. Founded in 1925 as a crop-dusting outfit in Macon, Georgia, Delta has evolved through a century of growth and mergers — most recently with Northwest Airlines in 2008 — into a global carrier operating from hubs at Atlanta, Detroit, Minneapolis/St. Paul, New York JFK & LaGuardia, Salt Lake City, Los Angeles, Seattle, and Boston.',
      'Delta operates the most diverse mainline fleet of any US airline, blending Airbus and Boeing types across short, medium, and long-haul missions. The Airbus A220 and A321neo power short-haul; the A330-900neo and A350-900 anchor long-haul; and Boeing 717s, 737s, 757s, and 767s round out the mix. Delta One is the flagship long-haul business cabin.',
      'Delta is a founding member of SkyTeam (2000) and operates joint ventures with Air France-KLM, Korean Air, LATAM, and Virgin Atlantic. The carrier consistently ranks among the most operationally reliable major airlines for on-time performance and completion factor.',
      'SkyMiles is the airline\'s frequent-flyer programme — revenue-based earning, Medallion status from Silver to Diamond, and a partner ecosystem that spans SkyTeam, Virgin Atlantic, and a deep co-branded card portfolio with American Express.',
    ],
    review: { score: 8.0, count: 82000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × cabin bag + 1 personal item (Basic Economy: personal item only on certain routes)',
      checked: 'First checked bag from USD 35; Delta One / Premium Select: 2 free',
      cabinDimensions: '56 × 36 × 23 cm',
      extraBagFee: 'From USD 45 per additional bag',
    },
    sampleBookings: [
      { origin: 'ATL', destination: 'LHR', when: '30 minutes ago' },
      { origin: 'JFK', destination: 'LAX', when: 'today' },
    ],
  },
  AF: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'CDG', name: 'Paris Charles de Gaulle' }],
    founded: 1933,
    country: 'France',
    headquarters: 'Tremblay-en-France',
    icao: 'AFR',
    callsign: 'Airfrans',
    website: 'airfrance.com',
    phone: '+33 9 69 39 36 54',
    loyaltyProgramme: 'Flying Blue',
    loyaltyProgrammeUrl: 'https://www.flyingblue.com/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 215,
    fleetTypes: ['Airbus A220', 'Airbus A320 family', 'Airbus A330', 'Airbus A350', 'Boeing 777', 'Boeing 787'],
    partners: ['KL', 'DL', 'KE', 'VS'],
    overview: [
      'Air France is the flag carrier of France, founded in 1933 and today the largest airline of the Air France-KLM Group. Operations centre on Paris Charles de Gaulle (CDG), Europe\'s third-busiest hub by passenger numbers, with a smaller presence at Paris Orly for domestic and regional flights.',
      'The long-haul fleet is dominated by the Airbus A350-900 and Boeing 777-300ER, supplemented by Boeing 787-9 Dreamliners and the older 777-200ER. Short-haul European routes use Airbus A220-300, A320 family, and Embraer 190 / 195 jets — one of the most modern European narrow-body fleets thanks to the A220 rollout.',
      'Air France is a founding member of the SkyTeam alliance (2000) and operates the largest transatlantic joint venture in the world together with KLM, Delta, and Virgin Atlantic. The group reaches over 300 destinations across 100+ countries through this combined network.',
      'Flying Blue is the shared frequent-flyer programme of Air France and KLM, with status tiers from Explorer through Platinum. La Première is Air France\'s flagship First cabin — among the most exclusive in commercial aviation, available on selected ultra-long-haul routes.',
    ],
    review: { score: 7.4, count: 38000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 12kg cabin bag + 1 personal item',
      checked: 'Economy 23kg, Premium 23kg ×2, Business 32kg ×2, First 32kg ×3',
      cabinDimensions: '55 × 35 × 25 cm',
      extraBagFee: 'From EUR 70 per additional bag',
    },
    sampleBookings: [
      { origin: 'CDG', destination: 'JFK', when: '1 hour ago' },
      { origin: 'CDG', destination: 'SIN', when: 'today' },
    ],
  },
  KL: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'AMS', name: 'Amsterdam Schiphol' }],
    founded: 1919,
    country: 'Netherlands',
    headquarters: 'Amstelveen',
    icao: 'KLM',
    callsign: 'KLM',
    website: 'klm.com',
    phone: '+31 20 474 7747',
    loyaltyProgramme: 'Flying Blue',
    loyaltyProgrammeUrl: 'https://www.flyingblue.com/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business'],
    fleetSize: 110,
    fleetTypes: ['Airbus A330', 'Boeing 737', 'Boeing 777', 'Boeing 787', 'Embraer 175/190'],
    partners: ['AF', 'DL', 'KE', 'VS'],
    overview: [
      'KLM Royal Dutch Airlines is the oldest operating airline in the world under its original name, founded in 1919. The flag carrier of the Netherlands operates from a single mega-hub at Amsterdam Schiphol, one of Europe\'s busiest connecting airports.',
      'KLM\'s long-haul fleet is centred on the Boeing 787-9 / 787-10 Dreamliners and Boeing 777-200ER / 300ER. Short-haul European routes are flown by Boeing 737s and Embraer 175 / 190 jets operated by subsidiary KLM Cityhopper. The retired Boeing 747 "Queen of the Skies" had been a KLM signature aircraft for over 50 years.',
      'KLM merged with Air France in 2004 to form the Air France-KLM Group, while preserving its independent brand and Amsterdam base. The group is a founding member of SkyTeam and forms the world\'s largest transatlantic joint venture alongside Delta and Virgin Atlantic.',
      'Flying Blue is the joint Air France-KLM frequent-flyer programme. KLM\'s World Business Class is the long-haul Business cabin product. The airline is recognised for sustainability initiatives including SAF (sustainable aviation fuel) blending and the Fly Responsibly programme.',
    ],
    review: { score: 7.8, count: 41000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 12kg cabin bag + 1 personal item',
      checked: 'Economy 23kg, Premium Comfort 23kg ×2, Business 32kg ×2',
      cabinDimensions: '55 × 35 × 25 cm',
      extraBagFee: 'From EUR 70 per additional bag',
    },
    sampleBookings: [
      { origin: 'AMS', destination: 'JFK', when: '45 minutes ago' },
      { origin: 'AMS', destination: 'KUL', when: 'today' },
    ],
  },
  MU: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'PVG', name: 'Shanghai Pudong' }],
    founded: 1988,
    country: 'China',
    headquarters: 'Shanghai',
  },
  KE: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'ICN', name: 'Seoul Incheon' }],
    founded: 1969,
    country: 'South Korea',
    headquarters: 'Seoul',
  },
  GA: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'CGK', name: 'Jakarta Soekarno–Hatta' }],
    founded: 1949,
    country: 'Indonesia',
    headquarters: 'Tangerang',
  },
  VS: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'LHR', name: 'London Heathrow' }],
    founded: 1984,
    country: 'United Kingdom',
    headquarters: 'Crawley',
  },
  AZ: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'FCO', name: 'Rome Fiumicino' }],
    founded: 2021,
    country: 'Italy',
    headquarters: 'Fiumicino',
  },
  VN: {
    alliance: 'SkyTeam',
    hubs: [
      { iata: 'HAN', name: 'Hanoi Noi Bai' },
      { iata: 'SGN', name: 'Ho Chi Minh Tan Son Nhat' },
    ],
    founded: 1956,
    country: 'Vietnam',
    headquarters: 'Hanoi',
  },
  AM: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'MEX', name: 'Mexico City' }],
    founded: 1934,
    country: 'Mexico',
    headquarters: 'Mexico City',
  },
  SV: {
    alliance: 'SkyTeam',
    hubs: [
      { iata: 'JED', name: 'Jeddah' },
      { iata: 'RUH', name: 'Riyadh' },
    ],
    founded: 1945,
    country: 'Saudi Arabia',
    headquarters: 'Jeddah',
  },
  CI: {
    alliance: 'SkyTeam',
    hubs: [{ iata: 'TPE', name: 'Taipei Taoyuan' }],
    founded: 1959,
    country: 'Taiwan',
    headquarters: 'Taoyuan City',
  },

  // ---- Major unaffiliated carriers ----
  EK: {
    hubs: [{ iata: 'DXB', name: 'Dubai' }],
    founded: 1985,
    country: 'United Arab Emirates',
    headquarters: 'Dubai',
    icao: 'UAE',
    callsign: 'Emirates',
    website: 'emirates.com',
    phone: '+971 600 555 555',
    loyaltyProgramme: 'Skywards',
    loyaltyProgrammeUrl: 'https://www.emirates.com/english/skywards/',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 250,
    fleetTypes: ['Airbus A380', 'Boeing 777-300ER', 'Boeing 777-200LR', 'Airbus A350'],
    partners: ['QF', 'JL', 'KE', 'AS'],
    overview: [
      'Emirates is the flag carrier of the United Arab Emirates, founded in October 1985 with start-up capital from the Dubai government. From two leased aircraft on routes to Karachi and Mumbai, the carrier grew into one of the largest long-haul airlines in the world, with Dubai International Airport (Terminal 3) as its single mega-hub.',
      'The fleet is anchored around two wide-body workhorses: the Airbus A380 — Emirates operates the largest A380 fleet of any airline — and the Boeing 777 family, supplemented by an emerging Airbus A350 contingent. The all-wide-body strategy reflects the airline\'s long-haul-only focus and its premium-heavy three-class (Economy, Business, First) and four-class (with Premium Economy) configurations.',
      'Emirates is not a member of any of the three global alliances. Instead it operates a deep bilateral partnership with Qantas covering Australia–Europe routings, plus codeshare agreements with Japan Airlines, Korean Air, Alaska Airlines and others to extend its network beyond Dubai. The Skywards programme is its in-house frequent-flyer scheme.',
      'In-cabin product is a regular Skytrax category winner — onboard showers and a private bar in First Class on the A380, ice in-flight entertainment with thousands of channels, and chauffeur transfers for premium-cabin passengers. The carrier is also the principal sponsor of the Emirates Stadium, a recognisable global brand asset.',
    ],
    review: { score: 8.6, count: 89000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg carry-on (Economy) / 1 × 12kg (Business+)',
      checked: 'Economy 30kg, Business 40kg, First 50kg',
      cabinDimensions: '55 × 38 × 20 cm',
      extraBagFee: 'From USD 100 per additional bag',
    },
    sampleBookings: [
      { origin: 'DXB', destination: 'LHR', when: '1 hour ago' },
      { origin: 'DXB', destination: 'JFK', when: '3 hours ago' },
      { origin: 'DXB', destination: 'SYD', when: 'today' },
    ],
  },
  EY: {
    hubs: [{ iata: 'AUH', name: 'Abu Dhabi' }],
    founded: 2003,
    country: 'United Arab Emirates',
    headquarters: 'Abu Dhabi',
    icao: 'ETD',
    callsign: 'Etihad',
    website: 'etihad.com',
    phone: '+971 600 555 666',
    loyaltyProgramme: 'Etihad Guest',
    loyaltyProgrammeUrl: 'https://www.etihad.com/en/etihad-guest',
    cabinClasses: ['Economy', 'Business', 'First'],
    fleetSize: 90,
    fleetTypes: ['Airbus A320', 'Airbus A321neo', 'Airbus A350', 'Boeing 777', 'Boeing 787'],
    partners: ['AA', 'VA', 'AF', 'KL'],
    overview: [
      'Etihad Airways is the flag carrier of the United Arab Emirates and the national airline of Abu Dhabi, founded in 2003 — younger than its Dubai-based neighbour Emirates but with a distinctly different premium-focused strategy. The carrier operates from Abu Dhabi International Airport (AUH).',
      'The fleet centres on the Boeing 787-9 / 787-10 Dreamliner and the Airbus A350-1000, with the Boeing 777-300ER and Airbus A321neo for medium-haul. Etihad retired its Airbus A380 fleet in the early 2020s as it refocused on right-sized wide-bodies.',
      'Etihad is not a member of any of the three major alliances. Instead it operates a series of bilateral codeshare partnerships with American Airlines, Virgin Australia, Air France-KLM, and others to extend reach beyond its Abu Dhabi hub. The carrier has aggressively pursued long-haul premium leisure traffic.',
      'Etihad Guest is the loyalty programme. The airline\'s flagship "The Residence" — a multi-room private suite on the A380 (and now on selected long-haul aircraft) — set a new benchmark for premium air travel when launched. Business Studio and First Apartment products on the 787 are also industry highlights.',
    ],
    review: { score: 8.2, count: 26000, source: 'Skytrax' },
    baggagePolicy: {
      cabin: '1 × 7kg cabin bag + 1 personal item (Economy) / 1 × 12kg (Business+)',
      checked: 'Economy 23kg–35kg by fare, Business 40kg, First 50kg',
      cabinDimensions: '50 × 40 × 25 cm',
      extraBagFee: 'From USD 90 per additional bag',
    },
    sampleBookings: [
      { origin: 'AUH', destination: 'LHR', when: '2 hours ago' },
      { origin: 'AUH', destination: 'SYD', when: 'today' },
    ],
  },
  FR: {
    hubs: [
      { iata: 'DUB', name: 'Dublin' },
      { iata: 'STN', name: 'London Stansted' },
    ],
    founded: 1984,
    country: 'Ireland',
    headquarters: 'Swords, Dublin',
  },
  U2: {
    hubs: [
      { iata: 'LTN', name: 'London Luton' },
      { iata: 'LGW', name: 'London Gatwick' },
    ],
    founded: 1995,
    country: 'United Kingdom',
    headquarters: 'Luton',
  },
  W6: {
    hubs: [{ iata: 'BUD', name: 'Budapest' }],
    founded: 2003,
    country: 'Hungary',
    headquarters: 'Budapest',
  },
  JQ: {
    hubs: [
      { iata: 'MEL', name: 'Melbourne' },
      { iata: 'SYD', name: 'Sydney' },
    ],
    founded: 2003,
    country: 'Australia',
    headquarters: 'Melbourne',
  },
  VA: {
    hubs: [
      { iata: 'BNE', name: 'Brisbane' },
      { iata: 'SYD', name: 'Sydney' },
    ],
    founded: 2000,
    country: 'Australia',
    headquarters: 'Bowen Hills, QLD',
  },
  DY: {
    hubs: [{ iata: 'OSL', name: 'Oslo' }],
    founded: 1993,
    country: 'Norway',
    headquarters: 'Fornebu',
  },
  AK: {
    hubs: [{ iata: 'KUL', name: 'Kuala Lumpur' }],
    founded: 1993,
    country: 'Malaysia',
    headquarters: 'Sepang',
  },
  '6E': {
    hubs: [
      { iata: 'DEL', name: 'Delhi' },
      { iata: 'BOM', name: 'Mumbai' },
    ],
    founded: 2006,
    country: 'India',
    headquarters: 'Gurugram',
  },
  AI: {
    hubs: [
      { iata: 'BOM', name: 'Mumbai' },
      { iata: 'DEL', name: 'Delhi' },
    ],
    founded: 1932,
    country: 'India',
    headquarters: 'New Delhi',
  },
  WN: {
    hubs: [{ iata: 'DAL', name: 'Dallas Love Field' }],
    founded: 1967,
    country: 'United States',
    headquarters: 'Dallas, TX',
  },
  B6: {
    hubs: [
      { iata: 'JFK', name: 'New York JFK' },
      { iata: 'BOS', name: 'Boston' },
    ],
    founded: 1998,
    country: 'United States',
    headquarters: 'Long Island City, NY',
  },
  NK: {
    hubs: [{ iata: 'FLL', name: 'Fort Lauderdale' }],
    founded: 1983,
    country: 'United States',
    headquarters: 'Miramar, FL',
  },
  F9: {
    hubs: [{ iata: 'DEN', name: 'Denver' }],
    founded: 1994,
    country: 'United States',
    headquarters: 'Denver, CO',
  },
  WS: {
    hubs: [{ iata: 'YYC', name: 'Calgary' }],
    founded: 1996,
    country: 'Canada',
    headquarters: 'Calgary, AB',
  },
}

// Auto-generated supplements (separate file) backfill the hand-curated set.
// Per-airline merge is field-level so the sparse hand entries (e.g. the
// original 6E with just hubs/founded/country/HQ) keep their authoritative
// values while picking up overview/fleet/partners/loyalty from the
// generated entry. Hand-curated fields ALWAYS win on conflict.
import { GENERATED_SUPPLEMENTS } from './airlineSupplement.generated'

const ALL_SUPPLEMENT_KEYS = new Set([
  ...Object.keys(GENERATED_SUPPLEMENTS),
  ...Object.keys(SUPPLEMENTS),
])

function lookupMerged(iata: string): AirlineSupplement | null {
  const gen = GENERATED_SUPPLEMENTS[iata]
  const hand = SUPPLEMENTS[iata]
  if (!gen && !hand) return null
  return { ...(gen ?? {}), ...(hand ?? {}) }
}

export function getAirlineSupplement(iataCode: string | null | undefined): AirlineSupplement | null {
  if (!iataCode) return null
  return lookupMerged(iataCode.toUpperCase())
}

export function getSupplementedIataCodes(): string[] {
  return Array.from(ALL_SUPPLEMENT_KEYS)
}

export function hasSupplement(iataCode: string | null | undefined): boolean {
  if (!iataCode) return false
  const upper = iataCode.toUpperCase()
  return upper in GENERATED_SUPPLEMENTS || upper in SUPPLEMENTS
}
