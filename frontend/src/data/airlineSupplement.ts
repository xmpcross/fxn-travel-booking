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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 950,
    fleetTypes: ['Airbus A319', 'Airbus A320', 'Boeing 737 MAX', 'Boeing 757', 'Boeing 767', 'Boeing 777', 'Boeing 787'],
    partners: ['LH', 'AC', 'SQ', 'NH', 'NZ'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 215,
    fleetTypes: ['Airbus A320 family', 'Airbus A380', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'LH', 'SQ', 'AC'],
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
    cabinClasses: ['Economy', 'Business'],
    fleetSize: 440,
    fleetTypes: ['Airbus A319/320/321', 'Airbus A330', 'Airbus A350', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'LH', 'SQ', 'NH'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business'],
    fleetSize: 105,
    fleetTypes: ['Airbus A320 family', 'Airbus A321neo', 'Boeing 787-9', 'ATR 72'],
    partners: ['UA', 'AC', 'SQ', 'NH'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 970,
    fleetTypes: ['Airbus A319', 'Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'CX', 'QF', 'JL', 'IB'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 165,
    fleetTypes: ['Airbus A350', 'Boeing 737', 'Boeing 767', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'AA', 'QF', 'CX', 'IB'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 180,
    fleetTypes: ['Airbus A330', 'Airbus A350', 'Boeing 777', 'Boeing 747F'],
    partners: ['BA', 'AA', 'QF', 'JL'],
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
    cabinClasses: ['Economy', 'Business', 'First'],
    fleetSize: 230,
    fleetTypes: ['Airbus A320 family', 'Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['BA', 'AA', 'CX', 'IB', 'JL'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 980,
    fleetTypes: ['Airbus A220', 'Airbus A319/320/321', 'Airbus A330', 'Airbus A350', 'Boeing 717', 'Boeing 737', 'Boeing 757', 'Boeing 767'],
    partners: ['AF', 'KL', 'KE', 'VS', 'AM'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 215,
    fleetTypes: ['Airbus A220', 'Airbus A320 family', 'Airbus A330', 'Airbus A350', 'Boeing 777', 'Boeing 787'],
    partners: ['KL', 'DL', 'KE', 'VS'],
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
    cabinClasses: ['Economy', 'Premium Economy', 'Business'],
    fleetSize: 110,
    fleetTypes: ['Airbus A330', 'Boeing 737', 'Boeing 777', 'Boeing 787', 'Embraer 175/190'],
    partners: ['AF', 'DL', 'KE', 'VS'],
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
    cabinClasses: ['Economy', 'Business', 'First'],
    fleetSize: 90,
    fleetTypes: ['Airbus A320', 'Airbus A321neo', 'Airbus A350', 'Boeing 777', 'Boeing 787'],
    partners: ['AA', 'VA', 'AF', 'KL'],
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

export function getAirlineSupplement(iataCode: string | null | undefined): AirlineSupplement | null {
  if (!iataCode) return null
  return SUPPLEMENTS[iataCode.toUpperCase()] ?? null
}

export function getSupplementedIataCodes(): string[] {
  return Object.keys(SUPPLEMENTS)
}

export function hasSupplement(iataCode: string | null | undefined): boolean {
  return Boolean(iataCode && SUPPLEMENTS[iataCode.toUpperCase()])
}
