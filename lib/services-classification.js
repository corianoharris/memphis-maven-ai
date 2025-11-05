/**
 * Memphis City Services Classification System
 * Categorizes user requests and determines appropriate service routing
 */

const serviceCategories = {
  // Category definitions with priorities and routing rules
  emergency: {
    priority: 1,
    requiresImmediateHuman: true,
    description: "Life-threatening or urgent situations requiring immediate response",
    examples: ["medical emergency", "fire", "flood", "gas leak", "downed power lines"],
    services: ["911", "Emergency Services", "Utility Emergency Response"]
  },
  
  urgent_city_services: {
    priority: 2,
    requiresHuman: true,
    description: "Urgent city services requiring human intervention",
    examples: ["pothole causing traffic hazard", "broken traffic light", "flooded road"],
    services: ["311", "Public Works Emergency", "Traffic Management"]
  },
  
  non_urgent_city_services: {
    priority: 3,
    requiresHuman: false,
    description: "Non-urgent city services that can be handled digitally",
    examples: ["report pothole", "streetlight repair", "park maintenance"],
    services: ["311 Online Portal", "Self-Service Tools", "Automated Ticketing"]
  },
  
  community_resources: {
    priority: 4,
    requiresHuman: false,
    description: "Community assistance and social services",
    examples: ["food assistance", "housing help", "utility assistance", "employment services"],
    services: ["211", "Community Partners", "Social Services"]
  },
  
  general_information: {
    priority: 5,
    requiresHuman: false,
    description: "General information and contact details",
    examples: ["city hall hours", "park locations", "public transportation", "recycling info"],
    services: ["City Website", "Public Information", "Automated Responses"]
  },
  
  civic_engagement: {
    priority: 6,
    requiresHuman: false,
    description: "Civic participation and local advocacy",
    examples: ["city council meetings", "volunteer opportunities", "community events"],
    services: ["Civic Portal", "Community Calendar", "Volunteer Coordination"]
  }
};

/**
 * Intent classification patterns
 */
const intentPatterns = {
  emergency: {
    keywords: ["emergency", "urgent", "immediately", "danger", "safety", "fire", "medical", "accident", "flood"],
    escalation_required: true,
    response_time: "immediate"
  },
  
  pothole_report: {
    keywords: ["pothole", "hole", "street", "road", "damage", "crater"],
    services: ["311"],
    response_time: "3-5 business days",
    anonymous_allowed: true
  },
  
  streetlight_issue: {
    keywords: ["streetlight", "street light", "light out", "dark", "lighting"],
    services: ["311"],
    response_time: "24-48 hours",
    anonymous_allowed: true
  },
  
  trash_service: {
    keywords: ["trash", "garbage", "recycling", "bulk pickup", "collection"],
    services: ["311", "Public Works"],
    response_time: "same day to 3 days",
    anonymous_allowed: true
  },
  
  food_assistance: {
    keywords: ["food", "pantry", "hunger", "meals", "assistance"],
    services: ["211"],
    response_time: "immediate information",
    anonymous_allowed: true
  },
  
  housing_assistance: {
    keywords: ["housing", "rent", "eviction", "shelter", "apartment"],
    services: ["211"],
    response_time: "immediate screening",
    anonymous_allowed: true
  },
  
  utility_assistance: {
    keywords: ["utility", "electric", "gas", "water", "bill", "disconnection"],
    services: ["211", "Utility Companies"],
    response_time: "immediate referral",
    anonymous_allowed: true
  },
  
  civic_meeting: {
    keywords: ["council", "meeting", "public hearing", "civic", "government"],
    services: ["Civic Portal"],
    response_time: "calendar information",
    anonymous_allowed: true
  },
  
  volunteer_opportunity: {
    keywords: ["volunteer", "community service", "help", "donate", "participate"],
    services: ["Volunteer Coordination"],
    response_time: "immediate information",
    anonymous_allowed: true
  }
};

/**
 * Location-based service mapping for Memphis
 */
const memphisLocationServices = {
  zipCodes: {
    "38103": { district: "Downtown", services: "Full city services" },
    "38104": { district: "Cooper-Young", services: "Full city services" },
    "38105": { district: "Medical District", services: "Full city services" },
    "38106": { district: "South Memphis", services: "Full city services" },
    "38107": { district: "Frayser", services: "Full city services" },
    "38108": { district: "Berclair", services: "Full city services" },
    "38109": { district: "Whitehaven", services: "Full city services" },
    "38111": { district: "University", services: "Full city services" },
    "38112": { district: "Midtown", services: "Full city services" },
    "38114": { district: "Orange Mound", services: "Full city services" },
    "38115": { district: "East Memphis", services: "Full city services" },
    "38116": { district: "Raleigh", services: "Full city services" },
    "38117": { district: "Germantown", services: "Full city services" },
    "38118": { district: "Hickory Hill", services: "Full city services" },
    "38119": { district: "Colonial Heights", services: "Full city services" },
    "38120": { district: "River Oaks", services: "Full city services" },
    "38125": { district: "Southwind", services: "Full city services" },
    "38126": { district: "South Main", services: "Full city services" },
    "38127": { district: "North Memphis", services: "Full city services" },
    "38128": { district: "Cordova", services: "Full city services" },
    "38131": { district: "Southeast Memphis", services: "Full city services" },
    "38132": { district: "Oakhaven", services: "Full city services" },
    "38133": { district: "Bartlett", services: "Full city services" },
    "38134": { district: "Bartlett", services: "Full city services" },
    "38135": { district: "Bartlett", services: "Full city services" },
    "38138": { district: "Germantown", services: "Full city services" },
    "38139": { district: "Germantown", services: "Full city services" },
    "38141": { district: "Southeast Memphis", services: "Full city services" }
  }
};

/**
 * Service hours and availability
 */
const serviceAvailability = {
  "311": {
    phone: "24/7",
    online: "24/7",
    walk_ins: "Mon-Fri 8AM-5PM"
  },
  "211": {
    phone: "24/7", 
    online: "24/7",
    text: "Text your ZIP code to 898-211"
  },
  "Emergency Services": {
    phone: "24/7",
    emergency: "911"
  },
  "City Council": {
    phone: "Mon-Fri 8AM-5PM",
    online: "24/7"
  },
  "Civic Events": {
    online: "24/7",
    phone: "Event specific"
  }
};

/**
 * Analyze user input and classify intent
 */
function classifyIntent(userInput, context = {}) {
  const input = userInput.toLowerCase();
  
  // Check for emergency indicators first
  if (intentPatterns.emergency.keywords.some(keyword => input.includes(keyword))) {
    return {
      category: "emergency",
      intent: "emergency",
      requiresHuman: true,
      anonymousAllowed: false,
      urgency: "critical",
      suggestedAction: "Transfer to emergency services",
      services: ["911"]
    };
  }
  
  // Check other intent patterns
  for (const [intentName, pattern] of Object.entries(intentPatterns)) {
    if (intentName === "emergency") continue; // Already checked
    
    const matches = pattern.keywords.filter(keyword => input.includes(keyword));
    if (matches.length > 0) {
      return {
        category: getCategoryForIntent(intentName),
        intent: intentName,
        requiresHuman: pattern.requiresHuman || false,
        anonymousAllowed: pattern.anonymousAllowed || true,
        urgency: "normal",
        confidence: matches.length / pattern.keywords.length,
        suggestedAction: getSuggestedAction(intentName),
        services: pattern.services || [],
        responseTime: pattern.responseTime
      };
    }
  }
  
  // Default classification for unrecognized intents
  return {
    category: "general_information",
    intent: "general_inquiry",
    requiresHuman: false,
    anonymousAllowed: true,
    urgency: "low",
    confidence: 0.1,
    suggestedAction: "Provide general information",
    services: ["City Website"]
  };
}

/**
 * Get category for intent
 */
function getCategoryForIntent(intentName) {
  for (const [category, config] of Object.entries(serviceCategories)) {
    if (config.examples && config.examples.some(example => 
        intentName.toLowerCase().includes(example.toLowerCase().split(' ')[0]))) {
      return category;
    }
  }
  
  // Map specific intents to categories
  const intentToCategory = {
    emergency: "emergency",
    pothole_report: "non_urgent_city_services",
    streetlight_issue: "non_urgent_city_services", 
    trash_service: "non_urgent_city_services",
    food_assistance: "community_resources",
    housing_assistance: "community_resources",
    utility_assistance: "community_resources",
    civic_meeting: "civic_engagement",
    volunteer_opportunity: "civic_engagement"
  };
  
  return intentToCategory[intentName] || "general_information";
}

/**
 * Get suggested action for intent
 */
function getSuggestedAction(intentName) {
  const actions = {
    emergency: "Connect to emergency services immediately",
    pothole_report: "Report through 311 online form",
    streetlight_issue: "Report through 311 online form", 
    trash_service: "Provide schedule and contact information",
    food_assistance: "Connect to 211 food resources",
    housing_assistance: "Connect to 211 housing services",
    utility_assistance: "Connect to 211 utility assistance",
    civic_meeting: "Provide meeting schedule and participation info",
    volunteer_opportunity: "Connect to volunteer coordination",
    general_inquiry: "Provide relevant information and resources"
  };
  
  return actions[intentName] || "Provide appropriate guidance";
}

/**
 * Get location-based service information
 */
function getLocationServices(zipCode) {
  return memphisLocationServices.zipCodes[zipCode] || {
    district: "Memphis",
    services: "Full city services"
  };
}

/**
 * Check service availability
 */
function getServiceAvailability(serviceName) {
  return serviceAvailability[serviceName] || {
    phone: "Business hours",
    online: "24/7"
  };
}

/**
 * Service Classification System Class
 * Wrapper class for the service classification functionality
 */
class ServiceClassificationSystem {
  constructor() {
    this.serviceCategories = serviceCategories;
    this.intentPatterns = intentPatterns;
    this.locationServices = memphisLocationServices;
    this.serviceAvailabilities = serviceAvailability;
  }

  /**
   * Classify a service request
   */
  classifyServiceRequest(userInput, context = {}) {
    return classifyIntent(userInput, context);
  }

  /**
   * Get location-based services
   */
  getLocationServices(zipCode) {
    return getLocationServices(zipCode);
  }

  /**
   * Get service availability
   */
  getServiceAvailability(serviceName) {
    return getServiceAvailability(serviceName);
  }

  /**
   * Get all service categories
   */
  getServiceCategories() {
    return this.serviceCategories;
  }

  /**
   * Get all intent patterns
   */
  getIntentPatterns() {
    return this.intentPatterns;
  }
}

export {
  serviceCategories,
  intentPatterns,
  memphisLocationServices,
  serviceAvailability,
  classifyIntent,
  getLocationServices,
  getServiceAvailability,
  ServiceClassificationSystem
};