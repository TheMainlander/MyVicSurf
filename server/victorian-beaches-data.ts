// Victorian Beaches Database - Comprehensive data from Wikipedia research
// This data includes beach type classification and detailed information

export const victorianBeachesData = [
  // Surf Coast Region - Premier surfing beaches
  {
    name: "Bells Beach",
    latitude: -38.367,
    longitude: 144.283,
    description: "World-famous surf break home to the Rip Curl Pro Bells Beach competition since 1962. One of the best right-hand point breaks in Australia.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bells_Beach_2009.jpg/1280px-Bells_Beach_2009.jpg",
    region: "Surf Coast",
    difficulty: "advanced",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "toilets", "walking_tracks"],
    accessInfo: "5km southwest of Torquay via Bells Beach Road. Well-maintained access road to cliff-top viewing area.",
    bestConditions: "Southwest swell 4-8ft, northwest offshore winds. Best in winter months (May-September).",
    hazards: ["strong_currents", "rocks", "experienced_surfers_only"],
    externalId: "bells-beach-vic",
    apiSource: "open-meteo"
  },
  
  {
    name: "Jan Juc",
    latitude: -38.365,
    longitude: 144.308,
    description: "Consistent surf beach with 1.2km of golden sand between Rocky Point and Bird Rock. Popular alternative to crowded Torquay beaches.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Jan_Juc_surf_beach.JPG/1280px-Jan_Juc_surf_beach.JPG",
    region: "Surf Coast",
    difficulty: "intermediate",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "toilets", "showers", "lifeguards_summer"],
    accessInfo: "Direct access via Jan Juc Road. 100-car sealed parking area.",
    bestConditions: "Southwest to southeast swell, northwest to northeast winds. Works year-round.",
    hazards: ["rips", "shallow_sand_bars", "underwater_rocks"],
    externalId: "jan-juc-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Torquay Point",
    latitude: -38.331,
    longitude: 144.321,
    description: "Beginner-friendly surf beach with gentle, consistent waves. Protected reef and point break suitable for learning.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Torquay_Front_Beach.jpg/1280px-Torquay_Front_Beach.jpg",
    region: "Surf Coast",
    difficulty: "beginner",
    beachType: "both",
    beachCategory: "family_beach",
    facilities: ["parking", "toilets", "cafe", "surf_schools", "lifeguards"],
    accessInfo: "Central Torquay via The Esplanade. Multiple access points and parking areas.",
    bestConditions: "Small to medium southwest swell, light offshore winds. Works on all tides.",
    hazards: ["crowds", "beginners"],
    externalId: "torquay-point-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Winkipop",
    latitude: -38.373,
    longitude: 144.289,
    description: "High-performance right-hand reef break adjacent to Bells Beach. Offers longer rides and works in more diverse conditions.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Winki_Pop%2C_Victoria%2C_Australia_%2835728698534%29.jpg/1280px-Winki_Pop%2C_Victoria%2C_Australia_%2835728698534%29.jpg",
    region: "Surf Coast",
    difficulty: "expert",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "walking_tracks"],
    accessInfo: "Access via Bells Beach Road, then walk along coastal track. No direct vehicle access.",
    bestConditions: "Any size southwest swell, any wind direction, any tide. Very consistent.",
    hazards: ["rocks", "very_crowded", "experienced_surfers_only"],
    externalId: "winkipop-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Point Impossible Beach",
    latitude: -38.31306,
    longitude: 144.36500,
    description: "Broad white sand surf beach with excellent waves. Also designated as a legal clothing-optional beach.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Point_Impossible_Beach.jpg/1280px-Point_Impossible_Beach.jpg",
    region: "Surf Coast",
    difficulty: "intermediate",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "toilets", "dune_protection"],
    accessInfo: "Via The Esplanade, Torquay. Gravel car park behind beach dunes.",
    bestConditions: "Southwest to southeast swell, northwest winds. Good beach break conditions.",
    hazards: ["nude_beach_area", "dune_erosion"],
    externalId: "point-impossible-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Thirteenth Beach",
    latitude: -38.2829,
    longitude: 144.4441,
    description: "4.5km stretch popular with surfers of all abilities. Diverse waves and breaks along the entire beach length.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Thirteenth_Beach_looking_towards_Breamlea%2C_Victoria.jpg/1280px-Thirteenth_Beach_looking_towards_Breamlea%2C_Victoria.jpg",
    region: "Bellarine Peninsula",
    difficulty: "intermediate",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "lifeguards_summer", "surf_club"],
    accessInfo: "West of Barwon Heads via Thirteenth Beach Road. Multiple access points along beach.",
    bestConditions: "Southwest swell, northwest winds. Consistent year-round surf.",
    hazards: ["dangerous_surf", "rips", "professional_surfers"],
    externalId: "thirteenth-beach-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Southside Beach", 
    latitude: -38.374,
    longitude: 144.285,
    description: "Clothing-optional beach near Torquay with good surf conditions. Less crowded alternative to main Torquay beaches.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Southside_Beach_Torquay.jpg/1280px-Southside_Beach_Torquay.jpg",
    region: "Surf Coast",
    difficulty: "intermediate",
    beachType: "surf",
    beachCategory: "surf_beach",
    facilities: ["parking", "walking_tracks"],
    accessInfo: "Access via Bells Beach Road, then coastal walking track.",
    bestConditions: "Southwest swell, northwest winds. Works best on medium to larger swells.",
    hazards: ["nude_beach_area", "rocks", "remote_location"],
    externalId: "southside-beach-vic",
    apiSource: "open-meteo"
  },

  // Port Phillip Bay - Protected swimming beaches
  {
    name: "St Kilda Beach",
    latitude: -37.8672,
    longitude: 144.9736,
    description: "Melbourne's most famous beach with protected bay swimming, foreshore attractions, and gentle waves.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/St_Kilda_Beach_Melbourne.jpg/1280px-St_Kilda_Beach_Melbourne.jpg",
    region: "Port Phillip Bay",
    difficulty: "beginner",
    beachType: "swimming",
    beachCategory: "family_beach",
    facilities: ["parking", "toilets", "cafes", "amusement_park", "marina", "public_transport"],
    accessInfo: "Accessible via St Kilda train station and trams. Multiple parking areas along foreshore.",
    bestConditions: "Protected bay conditions suitable for swimming year-round. Small waves only.",
    hazards: ["crowds", "pollution", "marine_stingers_summer"],
    externalId: "st-kilda-beach-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Altona Beach",
    latitude: -37.8709,
    longitude: 144.8234,
    description: "Protected bay beach popular with families. Shallow water and gentle conditions ideal for swimming.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Altona_Beach_Melbourne.jpg/1280px-Altona_Beach_Melbourne.jpg",
    region: "Port Phillip Bay",
    difficulty: "beginner",
    beachType: "swimming",
    beachCategory: "family_beach",
    facilities: ["parking", "toilets", "playground", "picnic_areas", "public_transport"],
    accessInfo: "Via Altona train station or direct car access via The Esplanade.",
    bestConditions: "Calm protected bay. Excellent for families with young children.",
    hazards: ["industrial_proximity", "shallow_water"],
    externalId: "altona-beach-vic",
    apiSource: "open-meteo"
  },

  {
    name: "Mentone Beach",
    latitude: -37.9834,
    longitude: 145.0612,
    description: "Protected bayside beach with good swimming conditions and colorful beach boxes. Family-friendly amenities.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mentone_Beach_boxes.jpg/1280px-Mentone_Beach_boxes.jpg",
    region: "Port Phillip Bay",
    difficulty: "beginner",
    beachType: "swimming",
    beachCategory: "family_beach",
    facilities: ["parking", "toilets", "cafes", "beach_boxes", "public_transport"],
    accessInfo: "Mentone train station is 500m from beach. Street parking and small car parks available.",
    bestConditions: "Protected bay conditions. Calm water ideal for swimming and paddling.",
    hazards: ["blue_bottle_jellyfish_summer", "crowds_summer"],
    externalId: "mentone-beach-vic",
    apiSource: "open-meteo"
  },

  // Mornington Peninsula
  {
    name: "Safety Beach",
    latitude: -38.3167,
    longitude: 144.9167,
    description: "Protected bay beach with excellent family facilities. Calm conditions perfect for children and swimming.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Safety_Beach_Mornington.jpg/1280px-Safety_Beach_Mornington.jpg",
    region: "Mornington Peninsula",
    difficulty: "beginner",
    beachType: "swimming",
    beachCategory: "family_beach",
    facilities: ["parking", "toilets", "playground", "cafes", "lifeguards_summer"],
    accessInfo: "Direct access via Safety Beach Road. Large parking areas and foreshore reserves.",
    bestConditions: "Very protected bay location. Excellent swimming conditions year-round.",
    hazards: ["blue_bottles_summer", "crowds_summer"],
    externalId: "safety-beach-vic",
    apiSource: "open-meteo"
  },

  {
    name: "St Andrews Beach",
    latitude: -38.5167,
    longitude: 144.8833,
    description: "Ocean beach on Mornington Peninsula with both surf and swimming areas. Diverse conditions for various activities.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/St_Andrews_Beach_Mornington.jpg/1280px-St_Andrews_Beach_Mornington.jpg",
    region: "Mornington Peninsula",
    difficulty: "intermediate",
    beachType: "both",
    beachCategory: "ocean_beach",
    facilities: ["parking", "toilets", "surf_patrol"],
    accessInfo: "Via Boneo Road to St Andrews Beach Road. Beach access via walking tracks.",
    bestConditions: "Southwest swell for surfing, protected areas for swimming. Seasonal variations.",
    hazards: ["rips", "strong_winds", "remote_sections"],
    externalId: "st-andrews-beach-vic",
    apiSource: "open-meteo"
  },

  // Gippsland Region
  {
    name: "Ninety Mile Beach",
    latitude: -38.1833,
    longitude: 147.1667,
    description: "Longest uninterrupted beach in Australia stretching 90 miles along Gippsland coast. Excellent fishing and walking.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ninety_Mile_Beach_Gippsland.jpg/1280px-Ninety_Mile_Beach_Gippsland.jpg",
    region: "Gippsland",
    difficulty: "intermediate",
    beachType: "both",
    beachCategory: "ocean_beach",
    facilities: ["multiple_access_points", "camping", "fishing"],
    accessInfo: "Multiple access points via Princes Highway. Various towns along the beach provide facilities.",
    bestConditions: "Consistent surf conditions. Good for fishing and beach walking. Variable swimming conditions.",
    hazards: ["remote_sections", "strong_currents", "limited_rescue_services"],
    externalId: "ninety-mile-beach-vic",
    apiSource: "open-meteo"
  },

  // Geelong Region
  {
    name: "Eastern Beach",
    latitude: -38.1479,
    longitude: 144.3661,
    description: "Historic Geelong waterfront beach with Art Deco features, swimming enclosure, and promenade. Protected bay conditions.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Eastern_Beach_Geelong.jpg/1280px-Eastern_Beach_Geelong.jpg",
    region: "Geelong",
    difficulty: "beginner",
    beachType: "swimming",
    beachCategory: "protected_bay",
    facilities: ["parking", "toilets", "cafes", "swimming_enclosure", "promenade", "historic_features"],
    accessInfo: "Central Geelong via Eastern Beach Road. Adjacent to Geelong CBD with excellent public transport.",
    bestConditions: "Very protected bay conditions. Ideal for swimming with enclosed swimming area.",
    hazards: ["crowds_summer", "blue_bottles_occasional"],
    externalId: "eastern-beach-geelong",
    apiSource: "open-meteo"
  }
];