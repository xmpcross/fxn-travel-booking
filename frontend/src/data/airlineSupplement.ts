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
    loyaltyProgramme: 'KrisFlyer',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 145,
    fleetTypes: ['Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['UA', 'NH', 'LH', 'AC', 'VS'],
    subsidiaries: [
      { name: 'Scoot', iata: 'TR' },
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
    loyaltyProgramme: 'British Airways Executive Club',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 280,
    fleetTypes: ['Airbus A320 family', 'Airbus A350', 'Airbus A380', 'Boeing 777', 'Boeing 787'],
    partners: ['AA', 'IB', 'QF', 'CX', 'JL'],
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
    loyaltyProgramme: 'Qantas Frequent Flyer',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 130,
    fleetTypes: ['Airbus A330', 'Airbus A380', 'Boeing 737', 'Boeing 787-9'],
    partners: ['BA', 'CX', 'AA', 'JL', 'EK'],
    subsidiaries: [
      { name: 'QantasLink' },
      { name: 'Jetstar', iata: 'JQ' },
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
    loyaltyProgramme: 'Skywards',
    cabinClasses: ['Economy', 'Premium Economy', 'Business', 'First'],
    fleetSize: 250,
    fleetTypes: ['Airbus A380', 'Boeing 777-300ER', 'Boeing 777-200LR', 'Airbus A350'],
    partners: ['QF', 'JL', 'KE', 'AS'],
  },
  EY: {
    hubs: [{ iata: 'AUH', name: 'Abu Dhabi' }],
    founded: 2003,
    country: 'United Arab Emirates',
    headquarters: 'Abu Dhabi',
    icao: 'ETD',
    callsign: 'Etihad',
    website: 'etihad.com',
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
