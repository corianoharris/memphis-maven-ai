// Translation library for Memphis Maven
// Provides pre-translated responses for common Memphis city services

const translations = {
  en: {
    // UI Elements
    ui: {
      title: "Chat with Memphis Maven",
      subtitle: "• AI Support Agent",
      onlineStatus: "We're online!",
      enterMessage: "Enter your message...",
      sendMessage: "Send message",
      howCanIHelp: "How can I help?",
      clearMessages: "Clear messages",
      listening: "Listening... Speak now",
      voiceCommand: "Sending...",
      voiceNotSupported: "Voice input not supported in this browser. Please use Chrome, Edge, or Safari.",
      quickAccess: "Quick Access",
      communityServices: "Community Services",
      cityServices: "City Services",
      emergency: "Emergency",
      waitTime: "Wait:",
      immediate: "Immediate",
      min: "min",
      poweredBy: "POWERED BY",
      welcome: "Welcome to Memphis Maven!",
      welcomeMessage: "I'm here to help you with Memphis city services, report issues, and answer questions in English, Spanish, or Arabic.",
      attachedFiles: "Attached Files:",
      loading: "Loading...",
      analyzing: "Analyzing...",
      autoAnalyzing: "Auto-Analyzing",
      loadingImage: "Loading image...",
      expand: "Expand",
      collapse: "Collapse",
      viewFullSize: "View full size",
      analyze: "Analyze",
      close: "Close",
      howToUse: "How to Use",
      howToUseMemphis: "Memphis Maven",
      voiceInputAvailable: "Voice input available",
      clickToClose: "Click to close this menu"
    },
    // Greetings and general responses
    greeting: "Hey Memphis! I'm Memphis Maven, super excited to help!",
    generalHelp: "For the BEST solution to your issue, call 211 for community services or 311 at (901) 636-6500. I can recommend the most effective approach for any Memphis city service! Let's make Memphis awesome together!",
    errorMessage: "I'm sorry, I'm having trouble processing your request right now. Please try calling Memphis 311 at (901) 636-6500 for immediate assistance.",
    
    // 211 Community Services
    communityServices: {
      title: "Here's the BEST approach for community services (211):",
      solution: "**Recommended Solution:**",
      steps: [
        "Call 211 for immediate assistance (24/7 helpline)",
        "Visit 211memphis.org for online resources",
        "Text your ZIP code to 898-211 for local services"
      ],
      why: "**Why this works best:** 211 connects you directly to community resources and social services.",
      services: "**Services include:** Rent assistance, housing help, food assistance, health services, utility assistance, and more.",
      timeline: "**Timeline:** Immediate help available 24/7!",
      closing: "Let's get you connected to the right community resources!"
    },
    
    // 311 City Services
    cityServices: {
      parking: {
        title: "Here's the BEST approach for parking permits:",
        solution: "**Recommended Solution:**",
        steps: [
          "Visit Public Works at 125 N. Main St. (fastest, same-day service)",
          "Bring ID and vehicle registration",
          "Pay the fee ($25-50)"
        ],
        why: "**Why this works best:** In-person gets immediate approval and avoids mail delays.",
        alternative: "**Alternative:** Call 311 at (901) 636-6500 for guidance",
        timeline: "**Timeline:** Same day if you go in person!",
        closing: "Let's get you sorted!"
      },
      garbage: {
        title: "Memphis, let's keep our city clean! Here's the BEST approach:",
        solution: "**Recommended Solution:**",
        steps: [
          "Check your collection day at memphistn.gov (most accurate)",
          "Place bins 3 feet apart and 2 feet from curb",
          "Set out by 6 AM on collection day"
        ],
        why: "**Why this works best:** Online schedule is always current and prevents missed pickups.",
        alternative: "**Alternative:** Call 311 at (901) 636-6500 for questions",
        timeline: "**Timeline:** Next collection day if you follow the schedule!",
        closing: "Visit memphistn.gov too!"
      },
      pothole: {
        title: "Memphis roads need love too! Here's the BEST approach to report potholes:",
        solution: "**Recommended Solution:**",
        steps: [
          "Call 311 at (901) 636-6500 (fastest response)",
          "Visit memphistn.gov online form (for detailed reports)",
          "Provide exact location and description"
        ],
        why: "**Why this works best:** Phone calls get immediate attention and faster repair scheduling.",
        alternative: "**Alternative:** Use the online form for non-urgent reports",
        timeline: "**Timeline:** Usually repaired within 3-5 business days!",
        closing: "We'll get those streets smooth!"
      },
      water: {
        title: "Memphis utilities got you covered! Here's the BEST approach for water bills:",
        solution: "**Recommended Solution:**",
        steps: [
          "Set up auto-pay at memphistn.gov (prevents late fees)",
          "Pay online for immediate processing",
          "Call 311 at (901) 636-6500 for assistance"
        ],
        why: "**Why this works best:** Auto-pay eliminates late fees and saves time.",
        alternative: "**Alternative:** Visit City Hall at 125 N. Main St. for in-person help",
        timeline: "**Timeline:** Online payments process immediately!",
        closing: "Let's keep the water flowing!"
      }
    }
  },
  
  es: {
    // UI Elements
    ui: {
      title: "Chatea con Memphis Maven",
      subtitle: "• Agente de Soporte IA",
      onlineStatus: "¡Estamos en línea!",
      enterMessage: "Ingresa tu mensaje...",
      sendMessage: "Enviar mensaje",
      howCanIHelp: "¿Cómo puedo ayudar?",
      clearMessages: "Limpiar mensajes",
      listening: "Escuchando... Habla ahora",
      voiceCommand: "Enviando...",
      voiceNotSupported: "Entrada de voz no soportada en este navegador. Por favor usa Chrome, Edge o Safari.",
      quickAccess: "Acceso Rápido",
      communityServices: "Servicios Comunitarios",
      cityServices: "Servicios de la Ciudad",
      emergency: "Emergencia",
      waitTime: "Espera:",
      immediate: "Inmediato",
      min: "min",
      poweredBy: "IMPULSADO POR",
      welcome: "¡Bienvenido a Memphis Maven!",
      welcomeMessage: "Estoy aquí para ayudarte con los servicios de la ciudad de Memphis, reportar problemas y responder preguntas en inglés, español o árabe.",
      attachedFiles: "Archivos Adjuntos:",
      loading: "Cargando...",
      analyzing: "Analizando...",
      autoAnalyzing: "Auto-Analizando",
      loadingImage: "Cargando imagen...",
      expand: "Expandir",
      collapse: "Contraer",
      viewFullSize: "Ver tamaño completo",
      analyze: "Analizar",
      close: "Cerrar",
      howToUse: "Cómo Usar",
      howToUseMemphis: "Memphis Maven",
      voiceInputAvailable: "Entrada de voz disponible",
      clickToClose: "Haz clic para cerrar este menú"
    },
    // Greetings and general responses
    greeting: "¡Hola Memphis! ¡Soy Memphis Maven, súper emocionado de ayudar!",
    generalHelp: "Para la MEJOR solución a tu problema, llama al 211 para servicios comunitarios o al 311 al (901) 636-6500. ¡Puedo recomendar el enfoque más efectivo para cualquier servicio de la ciudad de Memphis! ¡Hagamos Memphis increíble juntos!",
    errorMessage: "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento. Por favor, intenta llamar al 311 de Memphis al (901) 636-6500 para asistencia inmediata.",
    
    // 211 Community Services
    communityServices: {
      title: "Aquí está el MEJOR enfoque para servicios comunitarios (211):",
      solution: "**Solución Recomendada:**",
      steps: [
        "Llama al 211 para asistencia inmediata (línea de ayuda 24/7)",
        "Visita 211memphis.org para recursos en línea",
        "Envía un mensaje de texto con tu código postal al 898-211 para servicios locales"
      ],
      why: "**Por qué funciona mejor:** 211 te conecta directamente con recursos comunitarios y servicios sociales.",
      services: "**Servicios incluyen:** Asistencia para el alquiler, ayuda con vivienda, asistencia alimentaria, servicios de salud, asistencia con servicios públicos, y más.",
      timeline: "**Cronograma:** ¡Ayuda inmediata disponible 24/7!",
      closing: "¡Conectémonos con los recursos comunitarios correctos!"
    },
    
    // 311 City Services
    cityServices: {
      parking: {
        title: "Aquí está el MEJOR enfoque para permisos de estacionamiento:",
        solution: "**Solución Recomendada:**",
        steps: [
          "Visita Obras Públicas en 125 N. Main St. (más rápido, servicio el mismo día)",
          "Trae identificación y registro del vehículo",
          "Paga la tarifa ($25-50)"
        ],
        why: "**Por qué funciona mejor:** En persona obtienes aprobación inmediata y evitas retrasos por correo.",
        alternative: "**Alternativa:** Llama al 311 al (901) 636-6500 para orientación",
        timeline: "**Cronograma:** ¡El mismo día si vas en persona!",
        closing: "¡Te ayudamos a resolverlo!"
      },
      garbage: {
        title: "¡Memphis, mantengamos nuestra ciudad limpia! Aquí está el MEJOR enfoque:",
        solution: "**Solución Recomendada:**",
        steps: [
          "Verifica tu día de recolección en memphistn.gov (más preciso)",
          "Coloca los contenedores a 3 pies de distancia y 2 pies del bordillo",
          "Sácalos antes de las 6 AM en el día de recolección"
        ],
        why: "**Por qué funciona mejor:** El horario en línea siempre está actualizado y previene recolecciones perdidas.",
        alternative: "**Alternativa:** Llama al 311 al (901) 636-6500 para preguntas",
        timeline: "**Cronograma:** ¡Próximo día de recolección si sigues el horario!",
        closing: "¡Visita memphistn.gov también!"
      },
      pothole: {
        title: "¡Las carreteras de Memphis también necesitan amor! Aquí está el MEJOR enfoque para reportar baches:",
        solution: "**Solución Recomendada:**",
        steps: [
          "Llama al 311 al (901) 636-6500 (respuesta más rápida)",
          "Visita el formulario en línea de memphistn.gov (para reportes detallados)",
          "Proporciona ubicación exacta y descripción"
        ],
        why: "**Por qué funciona mejor:** Las llamadas telefónicas reciben atención inmediata y programación de reparación más rápida.",
        alternative: "**Alternativa:** Usa el formulario en línea para reportes no urgentes",
        timeline: "**Cronograma:** ¡Usualmente reparado en 3-5 días hábiles!",
        closing: "¡Haremos que esas calles estén suaves!"
      },
      water: {
        title: "¡Los servicios públicos de Memphis te tienen cubierto! Aquí está el MEJOR enfoque para facturas de agua:",
        solution: "**Solución Recomendada:**",
        steps: [
          "Configura pago automático en memphistn.gov (previene cargos por retraso)",
          "Paga en línea para procesamiento inmediato",
          "Llama al 311 al (901) 636-6500 para asistencia"
        ],
        why: "**Por qué funciona mejor:** El pago automático elimina cargos por retraso y ahorra tiempo.",
        alternative: "**Alternativa:** Visita el Ayuntamiento en 125 N. Main St. para ayuda en persona",
        timeline: "**Cronograma:** ¡Los pagos en línea se procesan inmediatamente!",
        closing: "¡Mantengamos el agua fluyendo!"
      }
    }
  },
  
  ar: {
    // UI Elements
    ui: {
      title: "تحدث مع Memphis Maven",
      subtitle: "• وكيل الدعم الذكي",
      onlineStatus: "نحن متصلون!",
      enterMessage: "أدخل رسالتك...",
      sendMessage: "إرسال الرسالة",
      howCanIHelp: "كيف يمكنني المساعدة؟",
      clearMessages: "مسح الرسائل",
      listening: "أستمع... تحدث الآن",
      voiceCommand: "جاري الإرسال...",
      voiceNotSupported: "إدخال الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge أو Safari.",
      quickAccess: "الوصول السريع",
      communityServices: "الخدمات المجتمعية",
      cityServices: "خدمات المدينة",
      emergency: "طوارئ",
      waitTime: "الانتظار:",
      immediate: "فوري",
      min: "دقيقة",
      poweredBy: "مدعوم بواسطة",
      welcome: "مرحباً بك في Memphis Maven!",
      welcomeMessage: "أنا هنا لمساعدتك في خدمات مدينة ممفيس، الإبلاغ عن المشاكل والإجابة على الأسئلة باللغة الإنجليزية أو الإسبانية أو العربية.",
      attachedFiles: "الملفات المرفقة:",
      loading: "جاري التحميل...",
      analyzing: "جاري التحليل...",
      autoAnalyzing: "التحليل التلقائي",
      loadingImage: "جاري تحميل الصورة...",
      expand: "توسيع",
      collapse: "طي",
      viewFullSize: "عرض بالحجم الكامل",
      analyze: "تحليل",
      close: "إغلاق",
      howToUse: "كيفية الاستخدام",
      howToUseMemphis: "Memphis Maven",
      voiceInputAvailable: "إدخال الصوت متاح",
      clickToClose: "انقر لإغلاق هذه القائمة"
    },
    // Greetings and general responses
    greeting: "مرحباً ممفيس! أنا Memphis Maven، متحمس جداً للمساعدة!",
    generalHelp: "للحصول على أفضل حل لمشكلتك، اتصل بالرقم 211 للخدمات المجتمعية أو 311 على (901) 636-6500. يمكنني أن أوصي بالطريقة الأكثر فعالية لأي خدمة في مدينة ممفيس! دعنا نجعل ممفيس رائعة معاً!",
    errorMessage: "أعتذر، أواجه مشكلة في معالجة طلبك الآن. يرجى محاولة الاتصال بـ 311 ممفيس على (901) 636-6500 للحصول على مساعدة فورية.",
    
    // 211 Community Services
    communityServices: {
      title: "إليك أفضل نهج للخدمات المجتمعية (211):",
      solution: "**الحل الموصى به:**",
      steps: [
        "اتصل بالرقم 211 للحصول على مساعدة فورية (خط مساعدة 24/7)",
        "زر 211memphis.org للحصول على الموارد عبر الإنترنت",
        "أرسل رسالة نصية برمزك البريدي إلى 898-211 للخدمات المحلية"
      ],
      why: "**لماذا يعمل هذا بشكل أفضل:** 211 يربطك مباشرة بالموارد المجتمعية والخدمات الاجتماعية.",
      services: "**تشمل الخدمات:** مساعدة الإيجار، مساعدة السكن، المساعدة الغذائية، الخدمات الصحية، مساعدة المرافق، والمزيد.",
      timeline: "**الجدول الزمني:** مساعدة فورية متاحة 24/7!",
      closing: "دعنا نربطك بالموارد المجتمعية الصحيحة!"
    },
    
    // 311 City Services
    cityServices: {
      parking: {
        title: "إليك أفضل نهج لتصاريح الوقوف:",
        solution: "**الحل الموصى به:**",
        steps: [
          "زر الأشغال العامة في 125 N. Main St. (الأسرع، خدمة في نفس اليوم)",
          "أحضر الهوية وتسجيل المركبة",
          "ادفع الرسوم ($25-50)"
        ],
        why: "**لماذا يعمل هذا بشكل أفضل:** الحضور شخصياً يحصل على موافقة فورية ويتجنب تأخير البريد.",
        alternative: "**البديل:** اتصل بـ 311 على (901) 636-6500 للحصول على التوجيه",
        timeline: "**الجدول الزمني:** في نفس اليوم إذا ذهبت شخصياً!",
        closing: "دعنا نساعدك في الحل!"
      },
      garbage: {
        title: "ممفيس، دعنا نحافظ على مدينتنا نظيفة! إليك أفضل نهج:",
        solution: "**الحل الموصى به:**",
        steps: [
          "تحقق من يوم جمعك في memphistn.gov (الأكثر دقة)",
          "ضع الحاويات على بعد 3 أقدام و 2 قدم من الرصيف",
          "أخرجها قبل الساعة 6 صباحاً في يوم الجمع"
        ],
        why: "**لماذا يعمل هذا بشكل أفضل:** الجدول الزمني عبر الإنترنت محدث دائماً ويمنع جمع فائت.",
        alternative: "**البديل:** اتصل بـ 311 على (901) 636-6500 للأسئلة",
        timeline: "**الجدول الزمني:** يوم الجمع التالي إذا اتبعت الجدول!",
        closing: "زر memphistn.gov أيضاً!"
      },
      pothole: {
        title: "طرق ممفيس تحتاج حب أيضاً! إليك أفضل نهج للإبلاغ عن الحفر:",
        solution: "**الحل الموصى به:**",
        steps: [
          "اتصل بـ 311 على (901) 636-6500 (أسرع استجابة)",
          "زر النموذج عبر الإنترنت في memphistn.gov (للتقارير المفصلة)",
          "قدم الموقع الدقيق والوصف"
        ],
        why: "**لماذا يعمل هذا بشكل أفضل:** المكالمات الهاتفية تحصل على اهتمام فوري وجدولة إصلاح أسرع.",
        alternative: "**البديل:** استخدم النموذج عبر الإنترنت للتقارير غير العاجلة",
        timeline: "**الجدول الزمني:** عادة ما يتم الإصلاح خلال 3-5 أيام عمل!",
        closing: "سنحصل على تلك الشوارع ناعمة!"
      },
      water: {
        title: "مرافق ممفيس تغطيك! إليك أفضل نهج لفواتير المياه:",
        solution: "**الحل الموصى به:**",
        steps: [
          "قم بإعداد الدفع التلقائي في memphistn.gov (يمنع رسوم التأخير)",
          "ادفع عبر الإنترنت للمعالجة الفورية",
          "اتصل بـ 311 على (901) 636-6500 للمساعدة"
        ],
        why: "**لماذا يعمل هذا بشكل أفضل:** الدفع التلقائي يلغي رسوم التأخير ويوفر الوقت.",
        alternative: "**البديل:** زر قاعة المدينة في 125 N. Main St. للمساعدة شخصياً",
        timeline: "**الجدول الزمني:** المدفوعات عبر الإنترنت تتم معالجتها فوراً!",
        closing: "دعنا نحافظ على تدفق المياه!"
      }
    }
  }
};

/**
 * Get translated text for a given key and language
 * @param {string} key - Translation key (e.g., 'greeting', 'communityServices.title')
 * @param {string} lang - Language code ('en', 'es', 'ar')
 * @param {Object} params - Optional parameters for string interpolation
 * @returns {string} - Translated text
 */
function t(key, lang = 'en', params = {}) {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  // Handle arrays (like steps)
  if (Array.isArray(value)) {
    return value;
  }
  
  // Simple parameter replacement
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
  }
  
  return value || key;
}

/**
 * Build a complete response for a specific service type
 * @param {string} serviceType - Type of service ('communityServices', 'parking', 'garbage', 'pothole', 'water')
 * @param {string} lang - Language code
 * @returns {string} - Complete formatted response
 */
function buildServiceResponse(serviceType, lang = 'en') {
  const greeting = t('greeting', lang);
  const service = t(`cityServices.${serviceType}`, lang);
  
  if (!service || typeof service !== 'object') {
    return `${greeting} ${t('generalHelp', lang)}`;
  }
  
  let response = `${greeting} ${service.title}\n\n`;
  response += `${service.solution}\n`;
  
  if (service.steps && Array.isArray(service.steps)) {
    service.steps.forEach((step, index) => {
      response += `${index + 1}. ${step}\n`;
    });
  }
  
  response += `\n${service.why}\n`;
  if (service.alternative) response += `${service.alternative}\n`;
  if (service.timeline) response += `${service.timeline}\n`;
  if (service.closing) response += `\n${service.closing}`;
  
  return response;
}

/**
 * Build community services response
 * @param {string} lang - Language code
 * @returns {string} - Complete formatted response
 */
function buildCommunityServicesResponse(lang = 'en') {
  const greeting = t('greeting', lang);
  const service = t('communityServices', lang);
  
  let response = `${greeting} ${service.title}\n\n`;
  response += `${service.solution}\n`;
  
  if (service.steps && Array.isArray(service.steps)) {
    service.steps.forEach((step, index) => {
      response += `${index + 1}. ${step}\n`;
    });
  }
  
  response += `\n${service.why}\n`;
  response += `${service.services}\n`;
  response += `${service.timeline}\n\n`;
  response += `${service.closing}`;
  
  return response;
}

module.exports = {
  t,
  buildServiceResponse,
  buildCommunityServicesResponse,
  translations
};
