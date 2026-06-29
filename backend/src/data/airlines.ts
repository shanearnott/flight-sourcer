export interface Airline {
  code: string;
  name: string;
  alliance: 'Star Alliance' | 'oneworld' | 'SkyTeam' | null;
  ffProgram: string | null;
  ffProgramCode: string | null;
  region: string;
}

export const AIRLINES: Airline[] = [
  // Star Alliance
  { code: 'UA', name: 'United Airlines', alliance: 'Star Alliance', ffProgram: 'MileagePlus', ffProgramCode: 'MP', region: 'Americas' },
  { code: 'AC', name: 'Air Canada', alliance: 'Star Alliance', ffProgram: 'Aeroplan', ffProgramCode: 'AERO', region: 'Americas' },
  { code: 'LH', name: 'Lufthansa', alliance: 'Star Alliance', ffProgram: 'Miles & More', ffProgramCode: 'MM', region: 'Europe' },
  { code: 'SQ', name: 'Singapore Airlines', alliance: 'Star Alliance', ffProgram: 'KrisFlyer', ffProgramCode: 'KF', region: 'Asia Pacific' },
  { code: 'NH', name: 'ANA', alliance: 'Star Alliance', ffProgram: 'ANA Mileage Club', ffProgramCode: 'AMC', region: 'Asia Pacific' },
  { code: 'TK', name: 'Turkish Airlines', alliance: 'Star Alliance', ffProgram: 'Miles&Smiles', ffProgramCode: 'MS', region: 'Europe' },
  { code: 'TG', name: 'Thai Airways', alliance: 'Star Alliance', ffProgram: 'Royal Orchid Plus', ffProgramCode: 'ROP', region: 'Asia Pacific' },
  { code: 'OS', name: 'Austrian Airlines', alliance: 'Star Alliance', ffProgram: 'Miles & More', ffProgramCode: 'MM', region: 'Europe' },
  { code: 'LX', name: 'SWISS', alliance: 'Star Alliance', ffProgram: 'Miles & More', ffProgramCode: 'MM', region: 'Europe' },
  { code: 'SK', name: 'SAS', alliance: 'Star Alliance', ffProgram: 'EuroBonus', ffProgramCode: 'EB', region: 'Europe' },
  { code: 'TP', name: 'TAP Air Portugal', alliance: 'Star Alliance', ffProgram: 'Miles&Go', ffProgramCode: 'MG', region: 'Europe' },
  { code: 'OZ', name: 'Asiana Airlines', alliance: 'Star Alliance', ffProgram: 'Asiana Club', ffProgramCode: 'AC', region: 'Asia Pacific' },
  { code: 'NZ', name: 'Air New Zealand', alliance: 'Star Alliance', ffProgram: 'Airpoints', ffProgramCode: 'AP', region: 'Asia Pacific' },
  { code: 'AI', name: 'Air India', alliance: 'Star Alliance', ffProgram: 'Flying Returns', ffProgramCode: 'FR', region: 'Asia Pacific' },
  { code: 'ET', name: 'Ethiopian Airlines', alliance: 'Star Alliance', ffProgram: 'ShebaMiles', ffProgramCode: 'SM', region: 'Africa' },
  { code: 'AV', name: 'Avianca', alliance: 'Star Alliance', ffProgram: 'LifeMiles', ffProgramCode: 'LM', region: 'Americas' },
  { code: 'CM', name: 'Copa Airlines', alliance: 'Star Alliance', ffProgram: 'ConnectMiles', ffProgramCode: 'CM', region: 'Americas' },
  { code: 'LO', name: 'LOT Polish Airlines', alliance: 'Star Alliance', ffProgram: 'Miles & More', ffProgramCode: 'MM', region: 'Europe' },
  { code: 'SN', name: 'Brussels Airlines', alliance: 'Star Alliance', ffProgram: 'Miles & More', ffProgramCode: 'MM', region: 'Europe' },
  { code: 'MS', name: 'EgyptAir', alliance: 'Star Alliance', ffProgram: 'EgyptAir Plus', ffProgramCode: 'EP', region: 'Africa' },
  { code: 'SA', name: 'South African Airways', alliance: 'Star Alliance', ffProgram: 'Voyager', ffProgramCode: 'VY', region: 'Africa' },
  { code: 'ZH', name: 'Shenzhen Airlines', alliance: 'Star Alliance', ffProgram: 'Air China PhoenixMiles', ffProgramCode: 'PM', region: 'Asia Pacific' },
  { code: 'CA', name: 'Air China', alliance: 'Star Alliance', ffProgram: 'PhoenixMiles', ffProgramCode: 'PM', region: 'Asia Pacific' },

  // oneworld
  { code: 'AA', name: 'American Airlines', alliance: 'oneworld', ffProgram: 'AAdvantage', ffProgramCode: 'AA', region: 'Americas' },
  { code: 'BA', name: 'British Airways', alliance: 'oneworld', ffProgram: 'Executive Club', ffProgramCode: 'EC', region: 'Europe' },
  { code: 'QF', name: 'Qantas', alliance: 'oneworld', ffProgram: 'Qantas Frequent Flyer', ffProgramCode: 'QFF', region: 'Asia Pacific' },
  { code: 'CX', name: 'Cathay Pacific', alliance: 'oneworld', ffProgram: 'Asia Miles', ffProgramCode: 'AM', region: 'Asia Pacific' },
  { code: 'AY', name: 'Finnair', alliance: 'oneworld', ffProgram: 'Finnair Plus', ffProgramCode: 'FP', region: 'Europe' },
  { code: 'IB', name: 'Iberia', alliance: 'oneworld', ffProgram: 'Iberia Plus', ffProgramCode: 'IP', region: 'Europe' },
  { code: 'JL', name: 'Japan Airlines', alliance: 'oneworld', ffProgram: 'JAL Mileage Bank', ffProgramCode: 'JMB', region: 'Asia Pacific' },
  { code: 'MH', name: 'Malaysia Airlines', alliance: 'oneworld', ffProgram: 'Enrich', ffProgramCode: 'EN', region: 'Asia Pacific' },
  { code: 'QR', name: 'Qatar Airways', alliance: 'oneworld', ffProgram: 'Privilege Club', ffProgramCode: 'PC', region: 'Middle East' },
  { code: 'RJ', name: 'Royal Jordanian', alliance: 'oneworld', ffProgram: 'Royal Plus', ffProgramCode: 'RP', region: 'Middle East' },
  { code: 'UL', name: 'SriLankan Airlines', alliance: 'oneworld', ffProgram: 'FlySmiLes', ffProgramCode: 'FS', region: 'Asia Pacific' },
  { code: 'AT', name: 'Royal Air Maroc', alliance: 'oneworld', ffProgram: 'Safar Flyer', ffProgramCode: 'SF', region: 'Africa' },
  { code: 'AS', name: 'Alaska Airlines', alliance: 'oneworld', ffProgram: 'Mileage Plan', ffProgramCode: 'MP', region: 'Americas' },

  // SkyTeam
  { code: 'DL', name: 'Delta Air Lines', alliance: 'SkyTeam', ffProgram: 'SkyMiles', ffProgramCode: 'SM', region: 'Americas' },
  { code: 'AF', name: 'Air France', alliance: 'SkyTeam', ffProgram: 'Flying Blue', ffProgramCode: 'FB', region: 'Europe' },
  { code: 'KL', name: 'KLM', alliance: 'SkyTeam', ffProgram: 'Flying Blue', ffProgramCode: 'FB', region: 'Europe' },
  { code: 'KE', name: 'Korean Air', alliance: 'SkyTeam', ffProgram: 'SKYPASS', ffProgramCode: 'SP', region: 'Asia Pacific' },
  { code: 'MU', name: 'China Eastern', alliance: 'SkyTeam', ffProgram: 'Eastern Miles', ffProgramCode: 'EM', region: 'Asia Pacific' },
  { code: 'AM', name: 'Aeromexico', alliance: 'SkyTeam', ffProgram: 'Club Premier', ffProgramCode: 'CP', region: 'Americas' },
  { code: 'AR', name: 'Aerolíneas Argentinas', alliance: 'SkyTeam', ffProgram: 'Aerolíneas Plus', ffProgramCode: 'AP', region: 'Americas' },
  { code: 'CI', name: 'China Airlines', alliance: 'SkyTeam', ffProgram: 'Dynasty Flyer', ffProgramCode: 'DF', region: 'Asia Pacific' },
  { code: 'CZ', name: 'China Southern', alliance: 'SkyTeam', ffProgram: 'Sky Pearl Club', ffProgramCode: 'SPC', region: 'Asia Pacific' },
  { code: 'GA', name: 'Garuda Indonesia', alliance: 'SkyTeam', ffProgram: 'GarudaMiles', ffProgramCode: 'GM', region: 'Asia Pacific' },
  { code: 'VN', name: 'Vietnam Airlines', alliance: 'SkyTeam', ffProgram: 'Lotusmiles', ffProgramCode: 'LM', region: 'Asia Pacific' },
  { code: 'KQ', name: 'Kenya Airways', alliance: 'SkyTeam', ffProgram: 'Asante Rewards', ffProgramCode: 'AR', region: 'Africa' },
  { code: 'AZ', name: 'ITA Airways', alliance: 'SkyTeam', ffProgram: 'Volare', ffProgramCode: 'VO', region: 'Europe' },
  { code: 'ME', name: 'Middle East Airlines', alliance: 'SkyTeam', ffProgram: 'Cedar Miles', ffProgramCode: 'CM', region: 'Middle East' },

  // Independent / Premium
  { code: 'EK', name: 'Emirates', alliance: null, ffProgram: 'Skywards', ffProgramCode: 'ES', region: 'Middle East' },
  { code: 'EY', name: 'Etihad Airways', alliance: null, ffProgram: 'Etihad Guest', ffProgramCode: 'EG', region: 'Middle East' },
  { code: 'VS', name: 'Virgin Atlantic', alliance: null, ffProgram: 'Flying Club', ffProgramCode: 'FC', region: 'Europe' },
  { code: 'WS', name: 'WestJet', alliance: null, ffProgram: 'WestJet Rewards', ffProgramCode: 'WR', region: 'Americas' },
  { code: 'B6', name: 'JetBlue', alliance: null, ffProgram: 'TrueBlue', ffProgramCode: 'TB', region: 'Americas' },
  { code: 'HA', name: 'Hawaiian Airlines', alliance: null, ffProgram: 'HawaiianMiles', ffProgramCode: 'HM', region: 'Americas' },
  { code: 'LA', name: 'LATAM Airlines', alliance: null, ffProgram: 'LATAM Pass', ffProgramCode: 'LP', region: 'Americas' },
  { code: 'G3', name: 'Gol', alliance: null, ffProgram: 'Smiles', ffProgramCode: 'SM', region: 'Americas' },
  { code: 'GF', name: 'Gulf Air', alliance: null, ffProgram: 'Falconflyer', ffProgramCode: 'FF', region: 'Middle East' },
  { code: 'PC', name: 'Pegasus Airlines', alliance: null, ffProgram: 'Pegasus BolBol', ffProgramCode: 'PB', region: 'Europe' },
  { code: 'TR', name: 'Scoot', alliance: null, ffProgram: 'KrisFlyer', ffProgramCode: 'KF', region: 'Asia Pacific' },
  { code: 'AK', name: 'AirAsia', alliance: null, ffProgram: 'airasia rewards', ffProgramCode: 'AAR', region: 'Asia Pacific' },
  { code: 'JQ', name: 'Jetstar', alliance: null, ffProgram: 'Qantas Frequent Flyer', ffProgramCode: 'QFF', region: 'Asia Pacific' },
  { code: '5J', name: 'Cebu Pacific', alliance: null, ffProgram: 'GetGo', ffProgramCode: 'GG', region: 'Asia Pacific' },

  // European LCCs
  { code: 'FR', name: 'Ryanair', alliance: null, ffProgram: null, ffProgramCode: null, region: 'Europe' },
  { code: 'U2', name: 'easyJet', alliance: null, ffProgram: 'Flight Club', ffProgramCode: 'FC', region: 'Europe' },
  { code: 'VY', name: 'Vueling', alliance: null, ffProgram: 'Punto', ffProgramCode: 'PT', region: 'Europe' },
  { code: 'W6', name: 'Wizz Air', alliance: null, ffProgram: null, ffProgramCode: null, region: 'Europe' },
  { code: 'HV', name: 'Transavia', alliance: null, ffProgram: null, ffProgramCode: null, region: 'Europe' },
  { code: 'XQ', name: 'SunExpress', alliance: null, ffProgram: null, ffProgramCode: null, region: 'Europe' },

  // US LCCs
  { code: 'WN', name: 'Southwest Airlines', alliance: null, ffProgram: 'Rapid Rewards', ffProgramCode: 'RR', region: 'Americas' },
  { code: 'F9', name: 'Frontier Airlines', alliance: null, ffProgram: 'Frontier Miles', ffProgramCode: 'FM', region: 'Americas' },
  { code: 'NK', name: 'Spirit Airlines', alliance: null, ffProgram: 'Free Spirit', ffProgramCode: 'FS', region: 'Americas' },
  { code: 'G4', name: 'Allegiant Air', alliance: null, ffProgram: null, ffProgramCode: null, region: 'Americas' },
];

export const ALLIANCES = ['Star Alliance', 'oneworld', 'SkyTeam'] as const;
export type Alliance = typeof ALLIANCES[number];

export function getAirlinesByAlliance(alliance: Alliance): Airline[] {
  return AIRLINES.filter(a => a.alliance === alliance);
}

export function getAirlineByCode(code: string): Airline | undefined {
  return AIRLINES.find(a => a.code === code);
}

export function getAirlinesByFFProgram(programCode: string): Airline[] {
  return AIRLINES.filter(a => a.ffProgramCode === programCode);
}
