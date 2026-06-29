export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  // Australia
  { iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', name: 'Tullamarine', city: 'Melbourne', country: 'Australia' },
  { iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  { iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  { iata: 'ADL', name: 'Adelaide Airport', city: 'Adelaide', country: 'Australia' },
  { iata: 'CBR', name: 'Canberra Airport', city: 'Canberra', country: 'Australia' },
  { iata: 'OOL', name: 'Gold Coast Airport', city: 'Gold Coast', country: 'Australia' },
  { iata: 'CNS', name: 'Cairns Airport', city: 'Cairns', country: 'Australia' },
  { iata: 'DRW', name: 'Darwin Airport', city: 'Darwin', country: 'Australia' },
  { iata: 'HBA', name: 'Hobart Airport', city: 'Hobart', country: 'Australia' },
  { iata: 'TSV', name: 'Townsville Airport', city: 'Townsville', country: 'Australia' },
  { iata: 'NTL', name: 'Newcastle Airport', city: 'Newcastle', country: 'Australia' },
  { iata: 'MKY', name: 'Mackay Airport', city: 'Mackay', country: 'Australia' },
  // New Zealand
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
  { iata: 'CHC', name: 'Christchurch Airport', city: 'Christchurch', country: 'New Zealand' },
  { iata: 'WLG', name: 'Wellington Airport', city: 'Wellington', country: 'New Zealand' },
  { iata: 'ZQN', name: 'Queenstown Airport', city: 'Queenstown', country: 'New Zealand' },
  { iata: 'DUD', name: 'Dunedin Airport', city: 'Dunedin', country: 'New Zealand' },
  // Singapore & Malaysia
  { iata: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { iata: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'Malaysia' },
  { iata: 'PEN', name: 'Penang Intl', city: 'Penang', country: 'Malaysia' },
  { iata: 'BKI', name: 'Kota Kinabalu Intl', city: 'Kota Kinabalu', country: 'Malaysia' },
  // Thailand
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'DMK', name: 'Don Mueang Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'HKT', name: 'Phuket Intl', city: 'Phuket', country: 'Thailand' },
  { iata: 'CNX', name: 'Chiang Mai Intl', city: 'Chiang Mai', country: 'Thailand' },
  { iata: 'USM', name: 'Koh Samui Airport', city: 'Koh Samui', country: 'Thailand' },
  // Vietnam
  { iata: 'HAN', name: 'Noi Bai Intl', city: 'Hanoi', country: 'Vietnam' },
  { iata: 'SGN', name: 'Tan Son Nhat Intl', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { iata: 'DAD', name: 'Da Nang Intl', city: 'Da Nang', country: 'Vietnam' },
  // Indonesia
  { iata: 'CGK', name: 'Soekarno-Hatta Intl', city: 'Jakarta', country: 'Indonesia' },
  { iata: 'DPS', name: 'Ngurah Rai Intl', city: 'Bali', country: 'Indonesia' },
  { iata: 'SUB', name: 'Juanda Intl', city: 'Surabaya', country: 'Indonesia' },
  // Philippines
  { iata: 'MNL', name: 'Ninoy Aquino Intl', city: 'Manila', country: 'Philippines' },
  { iata: 'CEB', name: 'Mactan-Cebu Intl', city: 'Cebu', country: 'Philippines' },
  // Myanmar, Cambodia, Laos
  { iata: 'RGN', name: 'Yangon Intl', city: 'Yangon', country: 'Myanmar' },
  { iata: 'PNH', name: 'Phnom Penh Intl', city: 'Phnom Penh', country: 'Cambodia' },
  { iata: 'REP', name: 'Siem Reap Intl', city: 'Siem Reap', country: 'Cambodia' },
  { iata: 'VTE', name: 'Wattay Intl', city: 'Vientiane', country: 'Laos' },
  // Japan
  { iata: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'Japan' },
  { iata: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'KIX', name: 'Kansai Intl', city: 'Osaka', country: 'Japan' },
  { iata: 'ITM', name: 'Itami Airport', city: 'Osaka', country: 'Japan' },
  { iata: 'NGO', name: 'Chubu Centrair Intl', city: 'Nagoya', country: 'Japan' },
  { iata: 'CTS', name: 'New Chitose Airport', city: 'Sapporo', country: 'Japan' },
  { iata: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka', country: 'Japan' },
  { iata: 'OKA', name: 'Naha Airport', city: 'Okinawa', country: 'Japan' },
  // South Korea
  { iata: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'South Korea' },
  { iata: 'GMP', name: 'Gimpo Intl', city: 'Seoul', country: 'South Korea' },
  { iata: 'PUS', name: 'Gimhae Intl', city: 'Busan', country: 'South Korea' },
  // China
  { iata: 'PEK', name: 'Capital Intl', city: 'Beijing', country: 'China' },
  { iata: 'PKX', name: 'Daxing Intl', city: 'Beijing', country: 'China' },
  { iata: 'PVG', name: 'Pudong Intl', city: 'Shanghai', country: 'China' },
  { iata: 'SHA', name: 'Hongqiao Intl', city: 'Shanghai', country: 'China' },
  { iata: 'CAN', name: 'Baiyun Intl', city: 'Guangzhou', country: 'China' },
  { iata: 'SZX', name: "Bao'an Intl", city: 'Shenzhen', country: 'China' },
  { iata: 'CTU', name: 'Tianfu Intl', city: 'Chengdu', country: 'China' },
  { iata: 'KMG', name: 'Changshui Intl', city: 'Kunming', country: 'China' },
  { iata: 'XIY', name: 'Xianyang Intl', city: "Xi'an", country: 'China' },
  { iata: 'CKG', name: 'Jiangbei Intl', city: 'Chongqing', country: 'China' },
  // Hong Kong, Macau, Taiwan
  { iata: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'Hong Kong' },
  { iata: 'MFM', name: 'Macau Intl', city: 'Macau', country: 'Macau' },
  { iata: 'TPE', name: 'Taoyuan Intl', city: 'Taipei', country: 'Taiwan' },
  { iata: 'TSA', name: 'Songshan Airport', city: 'Taipei', country: 'Taiwan' },
  // India
  { iata: 'DEL', name: 'Indira Gandhi Intl', city: 'Delhi', country: 'India' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Intl', city: 'Mumbai', country: 'India' },
  { iata: 'BLR', name: 'Kempegowda Intl', city: 'Bangalore', country: 'India' },
  { iata: 'MAA', name: 'Chennai Intl', city: 'Chennai', country: 'India' },
  { iata: 'CCU', name: 'Netaji Subhash Chandra Bose Intl', city: 'Kolkata', country: 'India' },
  { iata: 'HYD', name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'India' },
  { iata: 'GOI', name: 'Goa Intl', city: 'Goa', country: 'India' },
  { iata: 'COK', name: 'Cochin Intl', city: 'Kochi', country: 'India' },
  // South Asia
  { iata: 'CMB', name: 'Bandaranaike Intl', city: 'Colombo', country: 'Sri Lanka' },
  { iata: 'KTM', name: 'Tribhuvan Intl', city: 'Kathmandu', country: 'Nepal' },
  { iata: 'MLE', name: 'Velana Intl', city: 'Malé', country: 'Maldives' },
  { iata: 'DAC', name: 'Shahjalal Intl', city: 'Dhaka', country: 'Bangladesh' },
  // Middle East
  { iata: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE' },
  { iata: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dhabi', country: 'UAE' },
  { iata: 'SHJ', name: 'Sharjah Intl', city: 'Sharjah', country: 'UAE' },
  { iata: 'DOH', name: 'Hamad Intl', city: 'Doha', country: 'Qatar' },
  { iata: 'KWI', name: 'Kuwait Intl', city: 'Kuwait City', country: 'Kuwait' },
  { iata: 'BAH', name: 'Bahrain Intl', city: 'Manama', country: 'Bahrain' },
  { iata: 'MCT', name: 'Muscat Intl', city: 'Muscat', country: 'Oman' },
  { iata: 'RUH', name: 'King Khalid Intl', city: 'Riyadh', country: 'Saudi Arabia' },
  { iata: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah', country: 'Saudi Arabia' },
  { iata: 'AMM', name: 'Queen Alia Intl', city: 'Amman', country: 'Jordan' },
  { iata: 'BEY', name: 'Rafic Hariri Intl', city: 'Beirut', country: 'Lebanon' },
  { iata: 'TLV', name: 'Ben Gurion Intl', city: 'Tel Aviv', country: 'Israel' },
  { iata: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'Egypt' },
  // Africa
  { iata: 'JNB', name: 'OR Tambo Intl', city: 'Johannesburg', country: 'South Africa' },
  { iata: 'CPT', name: 'Cape Town Intl', city: 'Cape Town', country: 'South Africa' },
  { iata: 'DUR', name: 'King Shaka Intl', city: 'Durban', country: 'South Africa' },
  { iata: 'NBO', name: 'Jomo Kenyatta Intl', city: 'Nairobi', country: 'Kenya' },
  { iata: 'ADD', name: 'Addis Ababa Bole Intl', city: 'Addis Ababa', country: 'Ethiopia' },
  { iata: 'LOS', name: 'Murtala Mohammed Intl', city: 'Lagos', country: 'Nigeria' },
  { iata: 'ACC', name: 'Kotoka Intl', city: 'Accra', country: 'Ghana' },
  { iata: 'CMN', name: 'Mohammed V Intl', city: 'Casablanca', country: 'Morocco' },
  { iata: 'TUN', name: 'Tunis-Carthage Intl', city: 'Tunis', country: 'Tunisia' },
  // UK & Ireland
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { iata: 'LGW', name: 'Gatwick', city: 'London', country: 'UK' },
  { iata: 'STN', name: 'Stansted', city: 'London', country: 'UK' },
  { iata: 'LTN', name: 'Luton', city: 'London', country: 'UK' },
  { iata: 'LCY', name: 'London City', city: 'London', country: 'UK' },
  { iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'UK' },
  { iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'UK' },
  { iata: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'UK' },
  { iata: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'UK' },
  { iata: 'BRS', name: 'Bristol Airport', city: 'Bristol', country: 'UK' },
  { iata: 'NCL', name: 'Newcastle Airport', city: 'Newcastle', country: 'UK' },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { iata: 'ORK', name: 'Cork Airport', city: 'Cork', country: 'Ireland' },
  // France
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { iata: 'ORY', name: 'Orly', city: 'Paris', country: 'France' },
  { iata: 'NCE', name: "Nice Côte d'Azur", city: 'Nice', country: 'France' },
  { iata: 'LYS', name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France' },
  { iata: 'MRS', name: 'Marseille Provence', city: 'Marseille', country: 'France' },
  // Netherlands, Belgium
  { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  // Germany
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { iata: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  { iata: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf', country: 'Germany' },
  { iata: 'HAM', name: 'Hamburg Airport', city: 'Hamburg', country: 'Germany' },
  { iata: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne', country: 'Germany' },
  // Switzerland & Austria
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
  { iata: 'VIE', name: 'Vienna Intl', city: 'Vienna', country: 'Austria' },
  // Spain & Portugal
  { iata: 'MAD', name: 'Adolfo Suárez Barajas', city: 'Madrid', country: 'Spain' },
  { iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain' },
  { iata: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', country: 'Spain' },
  { iata: 'PMI', name: 'Palma de Mallorca', city: 'Palma', country: 'Spain' },
  { iata: 'VLC', name: 'Valencia Airport', city: 'Valencia', country: 'Spain' },
  { iata: 'SVQ', name: 'Sevilla Airport', city: 'Seville', country: 'Spain' },
  { iata: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza', country: 'Spain' },
  { iata: 'LPA', name: 'Gran Canaria Airport', city: 'Las Palmas', country: 'Spain' },
  { iata: 'TFS', name: 'Tenerife South', city: 'Tenerife', country: 'Spain' },
  { iata: 'LIS', name: 'Lisbon Portela', city: 'Lisbon', country: 'Portugal' },
  { iata: 'OPO', name: 'Francisco de Sá Carneiro', city: 'Porto', country: 'Portugal' },
  { iata: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal' },
  { iata: 'FNC', name: 'Madeira Airport', city: 'Funchal', country: 'Portugal' },
  // Italy
  { iata: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy' },
  { iata: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy' },
  { iata: 'LIN', name: 'Linate Airport', city: 'Milan', country: 'Italy' },
  { iata: 'VCE', name: 'Marco Polo Airport', city: 'Venice', country: 'Italy' },
  { iata: 'BLQ', name: 'Guglielmo Marconi Airport', city: 'Bologna', country: 'Italy' },
  { iata: 'NAP', name: 'Naples Intl', city: 'Naples', country: 'Italy' },
  { iata: 'FLR', name: 'Peretola Airport', city: 'Florence', country: 'Italy' },
  { iata: 'CTA', name: 'Fontanarossa Airport', city: 'Catania', country: 'Italy' },
  // Greece
  { iata: 'ATH', name: 'Athens Intl', city: 'Athens', country: 'Greece' },
  { iata: 'SKG', name: 'Thessaloniki Airport', city: 'Thessaloniki', country: 'Greece' },
  { iata: 'HER', name: 'Heraklion Intl', city: 'Heraklion', country: 'Greece' },
  { iata: 'RHO', name: 'Diagoras Airport', city: 'Rhodes', country: 'Greece' },
  { iata: 'CFU', name: 'Ioannis Kapodistrias', city: 'Corfu', country: 'Greece' },
  { iata: 'JMK', name: 'Mykonos Airport', city: 'Mykonos', country: 'Greece' },
  { iata: 'JTR', name: 'Santorini Airport', city: 'Santorini', country: 'Greece' },
  // Turkey
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { iata: 'SAW', name: 'Sabiha Gökçen Intl', city: 'Istanbul', country: 'Turkey' },
  { iata: 'AYT', name: 'Antalya Airport', city: 'Antalya', country: 'Turkey' },
  { iata: 'ADB', name: 'Adnan Menderes Airport', city: 'Izmir', country: 'Turkey' },
  { iata: 'DLM', name: 'Dalaman Airport', city: 'Dalaman', country: 'Turkey' },
  { iata: 'BJV', name: 'Milas–Bodrum Airport', city: 'Bodrum', country: 'Turkey' },
  // Scandinavia
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { iata: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { iata: 'GOT', name: 'Gothenburg Landvetter', city: 'Gothenburg', country: 'Sweden' },
  { iata: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
  { iata: 'BGO', name: 'Bergen Airport', city: 'Bergen', country: 'Norway' },
  { iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
  { iata: 'KEF', name: 'Keflavík Intl', city: 'Reykjavik', country: 'Iceland' },
  // Eastern Europe & Baltics
  { iata: 'PRG', name: 'Václav Havel Airport', city: 'Prague', country: 'Czech Republic' },
  { iata: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { iata: 'KRK', name: 'John Paul II Airport', city: 'Krakow', country: 'Poland' },
  { iata: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungary' },
  { iata: 'OTP', name: 'Henri Coandă Intl', city: 'Bucharest', country: 'Romania' },
  { iata: 'SOF', name: 'Sofia Airport', city: 'Sofia', country: 'Bulgaria' },
  { iata: 'BEG', name: 'Nikola Tesla Airport', city: 'Belgrade', country: 'Serbia' },
  { iata: 'ZAG', name: 'Franjo Tuđman Airport', city: 'Zagreb', country: 'Croatia' },
  { iata: 'SPU', name: 'Split Airport', city: 'Split', country: 'Croatia' },
  { iata: 'DBV', name: 'Dubrovnik Airport', city: 'Dubrovnik', country: 'Croatia' },
  { iata: 'LJU', name: 'Ljubljana Jože Pučnik', city: 'Ljubljana', country: 'Slovenia' },
  { iata: 'RIX', name: 'Riga Intl', city: 'Riga', country: 'Latvia' },
  { iata: 'TLL', name: 'Lennart Meri Tallinn', city: 'Tallinn', country: 'Estonia' },
  { iata: 'VNO', name: 'Vilnius Airport', city: 'Vilnius', country: 'Lithuania' },
  // USA – Northeast
  { iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA' },
  { iata: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
  { iata: 'EWR', name: 'Newark Liberty Intl', city: 'Newark', country: 'USA' },
  { iata: 'BOS', name: 'Logan Intl', city: 'Boston', country: 'USA' },
  { iata: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia', country: 'USA' },
  { iata: 'DCA', name: 'Ronald Reagan National', city: 'Washington DC', country: 'USA' },
  { iata: 'IAD', name: 'Dulles Intl', city: 'Washington DC', country: 'USA' },
  { iata: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore', country: 'USA' },
  // USA – Southeast
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'USA' },
  { iata: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA' },
  { iata: 'FLL', name: 'Fort Lauderdale-Hollywood Intl', city: 'Fort Lauderdale', country: 'USA' },
  { iata: 'MCO', name: 'Orlando Intl', city: 'Orlando', country: 'USA' },
  { iata: 'TPA', name: 'Tampa Intl', city: 'Tampa', country: 'USA' },
  { iata: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte', country: 'USA' },
  { iata: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh', country: 'USA' },
  { iata: 'BNA', name: 'Nashville Intl', city: 'Nashville', country: 'USA' },
  { iata: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans', country: 'USA' },
  // USA – Midwest
  { iata: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA' },
  { iata: 'MDW', name: 'Chicago Midway Intl', city: 'Chicago', country: 'USA' },
  { iata: 'DTW', name: 'Detroit Metropolitan', city: 'Detroit', country: 'USA' },
  { iata: 'MSP', name: 'Minneapolis-St. Paul Intl', city: 'Minneapolis', country: 'USA' },
  { iata: 'STL', name: 'St. Louis Lambert Intl', city: 'St. Louis', country: 'USA' },
  { iata: 'MCI', name: 'Kansas City Intl', city: 'Kansas City', country: 'USA' },
  // USA – Texas & Southwest
  { iata: 'DFW', name: 'Dallas Fort Worth Intl', city: 'Dallas', country: 'USA' },
  { iata: 'DAL', name: 'Dallas Love Field', city: 'Dallas', country: 'USA' },
  { iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA' },
  { iata: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', country: 'USA' },
  { iata: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin', country: 'USA' },
  { iata: 'SAT', name: 'San Antonio Intl', city: 'San Antonio', country: 'USA' },
  { iata: 'PHX', name: 'Phoenix Sky Harbor Intl', city: 'Phoenix', country: 'USA' },
  { iata: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas', country: 'USA' },
  { iata: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'USA' },
  { iata: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City', country: 'USA' },
  // USA – West Coast
  { iata: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA' },
  { iata: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA' },
  { iata: 'OAK', name: 'Oakland Intl', city: 'Oakland', country: 'USA' },
  { iata: 'SJC', name: 'Norman Y. Mineta San Jose Intl', city: 'San Jose', country: 'USA' },
  { iata: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'USA' },
  { iata: 'PDX', name: 'Portland Intl', city: 'Portland', country: 'USA' },
  { iata: 'SAN', name: 'San Diego Intl', city: 'San Diego', country: 'USA' },
  { iata: 'BUR', name: 'Hollywood Burbank Airport', city: 'Burbank', country: 'USA' },
  { iata: 'SNA', name: 'John Wayne Airport', city: 'Orange County', country: 'USA' },
  // Hawaii
  { iata: 'HNL', name: 'Daniel K. Inouye Intl', city: 'Honolulu', country: 'USA' },
  { iata: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA' },
  { iata: 'KOA', name: 'Ellison Onizuka Kona Intl', city: 'Kona', country: 'USA' },
  { iata: 'LIH', name: 'Lihue Airport', city: 'Kauai', country: 'USA' },
  // Canada
  { iata: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto', country: 'Canada' },
  { iata: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada' },
  { iata: 'YUL', name: 'Montréal-Trudeau Intl', city: 'Montreal', country: 'Canada' },
  { iata: 'YYC', name: 'Calgary Intl', city: 'Calgary', country: 'Canada' },
  { iata: 'YOW', name: 'Ottawa Macdonald–Cartier Intl', city: 'Ottawa', country: 'Canada' },
  { iata: 'YEG', name: 'Edmonton Intl', city: 'Edmonton', country: 'Canada' },
  { iata: 'YHZ', name: 'Halifax Stanfield Intl', city: 'Halifax', country: 'Canada' },
  { iata: 'YWG', name: 'Winnipeg Richardson Intl', city: 'Winnipeg', country: 'Canada' },
  // Mexico & Latin America
  { iata: 'MEX', name: 'Benito Juárez Intl', city: 'Mexico City', country: 'Mexico' },
  { iata: 'CUN', name: 'Cancún Intl', city: 'Cancún', country: 'Mexico' },
  { iata: 'GDL', name: 'Miguel Hidalgo y Costilla Intl', city: 'Guadalajara', country: 'Mexico' },
  { iata: 'MTY', name: 'General Mariano Escobedo Intl', city: 'Monterrey', country: 'Mexico' },
  { iata: 'PVR', name: 'Licenciado Gustavo Díaz Ordaz Intl', city: 'Puerto Vallarta', country: 'Mexico' },
  { iata: 'SJD', name: 'Los Cabos Intl', city: 'Los Cabos', country: 'Mexico' },
  { iata: 'GRU', name: 'Guarulhos Intl', city: 'São Paulo', country: 'Brazil' },
  { iata: 'GIG', name: 'Galeão Intl', city: 'Rio de Janeiro', country: 'Brazil' },
  { iata: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'Chile' },
  { iata: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'Peru' },
  { iata: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'Colombia' },
  { iata: 'MDE', name: 'José María Córdova Intl', city: 'Medellín', country: 'Colombia' },
  { iata: 'UIO', name: 'Mariscal Sucre Intl', city: 'Quito', country: 'Ecuador' },
  // Caribbean
  { iata: 'MBJ', name: 'Sangster Intl', city: 'Montego Bay', country: 'Jamaica' },
  { iata: 'NAS', name: 'Lynden Pindling Intl', city: 'Nassau', country: 'Bahamas' },
  { iata: 'PUJ', name: 'Punta Cana Intl', city: 'Punta Cana', country: 'Dominican Republic' },
  { iata: 'SJU', name: 'Luis Muñoz Marín Intl', city: 'San Juan', country: 'Puerto Rico' },
  { iata: 'BGI', name: 'Grantley Adams Intl', city: 'Bridgetown', country: 'Barbados' },
  { iata: 'SXM', name: 'Princess Juliana Intl', city: 'Sint Maarten', country: 'Sint Maarten' },
  // Pacific
  { iata: 'PPT', name: "Faa'a Intl", city: 'Papeete', country: 'French Polynesia' },
  { iata: 'NAN', name: 'Nadi Intl', city: 'Nadi', country: 'Fiji' },
  { iata: 'APW', name: 'Faleolo Intl', city: 'Apia', country: 'Samoa' },
  { iata: 'GUM', name: 'Antonio B. Won Pat Intl', city: 'Hagåtña', country: 'Guam' },
  { iata: 'NAN', name: 'Nadi Intl', city: 'Nadi', country: 'Fiji' },
  { iata: 'VLI', name: 'Bauerfield Intl', city: 'Port Vila', country: 'Vanuatu' },
  { iata: 'HIR', name: 'Honiara Intl', city: 'Honiara', country: 'Solomon Islands' },
  { iata: 'TBU', name: "Fua'amotu Intl", city: "Nuku'alofa", country: 'Tonga' },
];

export function searchAirports(keyword: string, limit = 10): Airport[] {
  const q = keyword.toLowerCase().trim();
  if (!q) return [];

  const exact: Airport[] = [];
  const iataPrefix: Airport[] = [];
  const cityStart: Airport[] = [];
  const rest: Airport[] = [];
  const seen = new Set<string>();

  for (const a of AIRPORTS) {
    if (seen.has(a.iata)) continue;
    seen.add(a.iata);

    const iata = a.iata.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    const country = a.country.toLowerCase();

    if (iata === q) { exact.push(a); continue; }
    if (iata.startsWith(q)) { iataPrefix.push(a); continue; }
    if (city === q || city.startsWith(q)) { cityStart.push(a); continue; }
    if (city.includes(q) || name.includes(q) || country.includes(q)) { rest.push(a); continue; }
  }

  return [...exact, ...iataPrefix, ...cityStart, ...rest].slice(0, limit);
}
