'use client';

import { useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations directly to avoid import issues
const resources = {
  en: {
    translation: {
      'ui.quickAccess': 'Quick Access',
      'ui.communityServices': 'Community Services',
      'ui.cityServices': 'City Services',
      'ui.emergency': 'Emergency',
      'ui.callForWaitTime': 'Call for current wait time',
      'ui.immediate': 'Immediate',
      'ui.onlineStatus': "We're online!",
      'ui.selectLanguage': 'Select Language',
      'ui.howToUse': 'How to Use',
      'ui.howToUseMemphis': 'Beale',
      'ui.multilingualHelp': 'Get help in English, Spanish, or Arabic',
      'ui.voiceInputAvailable': 'Voice input available',
      'ui.clickToClose': 'Click to close this menu',
      'ui.welcomeGreeting': 'Help and harmony — straight from Beale',
      'ui.welcomeDescription': "I'm here to help with Memphis city services, report issues, and answer questions in English, Spanish, or Arabic.",
      'ui.welcomeLanguages': "I speak English, Spanish, and Arabic - so whatever language you prefer, we're good to go!",
      'ui.bealeThinking': 'Beale is cooking up an answer...',
      'ui.enterMessage': 'Enter your message...',
      'ui.examplePotholeSlider': 'How do I report a pothole?',
      'ui.relevantResources': 'Relevant Resources',
      'ui.relevance': 'Relevance',
      'ui.poweredBy': 'POWERED BY',
      'resources.Social_Media_Center_The_City_of_Memphis': 'Social Media Center',
      'resources.Call_311_The_City_of_Memphis': 'Call 311',
      'resources.Loans_and_Grants_The_City_of_Memphis': 'Loans and Grants',
      'resources.Housing_and_Community_Development_The_City_of_Memphis': 'Housing and Community Development',
      'resources.Government_The_City_of_Memphis': 'Government',
      'resources.Office_of_Community_Affairs_The_City_of_Memphis': 'Office of Community Affairs',
      'resources.Community_Affairs_The_City_of_Memphis': 'Community Affairs',
      'resources.Call_511_The_City_of_Memphis': 'Call 511',
      'resources.Transportation_The_City_of_Memphis': 'Transportation',
      'resources.Public_Works_The_City_of_Memphis': 'Public Works',
      'resources.Health_Department_The_City_of_Memphis': 'Health Department',
      'resources.Emergency_Services_The_City_of_Memphis': 'Emergency Services',
      'resources.Social_Media_Center___The_City_of_Memphis': 'Social Media Center',
      'resources.Housing_and_Community_Development___The_City_of_Memphis': 'Housing and Community Development',
      'resources.Office_of_Community_Affairs___The_City_of_Memphis': 'Office of Community Affairs',
      'resources.Community_Affairs___The_City_of_Memphis': 'Community Affairs',
      'resources.Call_511___The_City_of_Memphis': 'Call 511',
      'resources.Transportation___The_City_of_Memphis': 'Transportation',
      'resources.Public_Works___The_City_of_Memphis': 'Public Works',
      'resources.Health_Department___The_City_of_Memphis': 'Health Department',
      'resources.Emergency_Services___The_City_of_Memphis': 'Emergency Services',
      'resources.Loans_and_Grants___The_City_of_Memphis': 'Loans and Grants',
      'resources.Government___The_City_of_Memphis': 'Government',
      'resources.Call_311___The_City_of_Memphis': 'Call 311'
    }
  },
  es: {
    translation: {
      'ui.quickAccess': 'Acceso Rápido',
      'ui.communityServices': 'Servicios Comunitarios',
      'ui.cityServices': 'Servicios de la Ciudad',
      'ui.emergency': 'Emergencia',
      'ui.callForWaitTime': 'Llame para tiempo de espera actual',
      'ui.immediate': 'Inmediato',
      'ui.onlineStatus': '¡Estamos en línea!',
      'ui.selectLanguage': 'Seleccionar Idioma',
      'ui.howToUse': 'Cómo Usar',
      'ui.howToUseMemphis': 'Beale',
      'ui.multilingualHelp': 'Obtén ayuda en inglés, español o árabe',
      'ui.voiceInputAvailable': 'Entrada de voz disponible',
      'ui.clickToClose': 'Haz clic para cerrar este menú',
      'ui.welcomeGreeting': 'Ayuda y armonía — directo desde Beale',
      'ui.welcomeDescription': 'Estoy aquí para ayudarte con cualquier servicio de la ciudad de Memphis que necesites - ya sea reportar baches, obtener permisos, o simplemente averiguar cómo hacer las cosas aquí.',
      'ui.welcomeLanguages': '¡Hablo inglés, español y árabe - así que en el idioma que prefieras, estamos listos!',
      'ui.bealeThinking': 'Beale está preparando una respuesta...',
      'ui.enterMessage': 'Ingresa tu mensaje...',
      'ui.examplePotholeSlider': '¿Cómo reporto un bache?',
      'ui.relevantResources': 'Recursos Relevantes',
      'ui.relevance': 'Relevancia',
      'ui.poweredBy': 'IMPULSADO POR',
      'resources.Social_Media_Center_The_City_of_Memphis': 'Centro de Redes Sociales',
      'resources.Call_311_The_City_of_Memphis': 'Llamar al 311',
      'resources.Loans_and_Grants_The_City_of_Memphis': 'Préstamos y Subvenciones',
      'resources.Housing_and_Community_Development_The_City_of_Memphis': 'Vivienda y Desarrollo Comunitario',
      'resources.Government_The_City_of_Memphis': 'Gobierno',
      'resources.Office_of_Community_Affairs_The_City_of_Memphis': 'Oficina de Asuntos Comunitarios',
      'resources.Community_Affairs_The_City_of_Memphis': 'Asuntos Comunitarios',
      'resources.Call_511_The_City_of_Memphis': 'Llamar al 511',
      'resources.Transportation_The_City_of_Memphis': 'Transporte',
      'resources.Public_Works_The_City_of_Memphis': 'Obras Públicas',
      'resources.Health_Department_The_City_of_Memphis': 'Departamento de Salud',
      'resources.Emergency_Services_The_City_of_Memphis': 'Servicios de Emergencia',
      'resources.Social_Media_Center___The_City_of_Memphis': 'Centro de Redes Sociales',
      'resources.Housing_and_Community_Development___The_City_of_Memphis': 'Vivienda y Desarrollo Comunitario',
      'resources.Office_of_Community_Affairs___The_City_of_Memphis': 'Oficina de Asuntos Comunitarios',
      'resources.Community_Affairs___The_City_of_Memphis': 'Asuntos Comunitarios',
      'resources.Call_511___The_City_of_Memphis': 'Llamar al 511',
      'resources.Transportation___The_City_of_Memphis': 'Transporte',
      'resources.Public_Works___The_City_of_Memphis': 'Obras Públicas',
      'resources.Health_Department___The_City_of_Memphis': 'Departamento de Salud',
      'resources.Emergency_Services___The_City_of_Memphis': 'Servicios de Emergencia',
      'resources.Loans_and_Grants___The_City_of_Memphis': 'Préstamos y Subvenciones',
      'resources.Government___The_City_of_Memphis': 'Gobierno',
      'resources.Call_311___The_City_of_Memphis': 'Llamar al 311'
    }
  },
  ar: {
    translation: {
      'ui.quickAccess': 'الوصول السريع',
      'ui.communityServices': 'الخدمات المجتمعية',
      'ui.cityServices': 'خدمات المدينة',
      'ui.emergency': 'الطوارئ',
      'ui.callForWaitTime': 'اتصل لمعرفة وقت الانتظار الحالي',
      'ui.immediate': 'فوري',
      'ui.onlineStatus': 'نحن متصلون!',
      'ui.selectLanguage': 'اختيار اللغة',
      'ui.howToUse': 'كيفية الاستخدام',
      'ui.howToUseMemphis': 'Beale',
      'ui.multilingualHelp': 'احصل على مساعدة باللغة الإنجليزية أو الإسبانية أو العربية',
      'ui.voiceInputAvailable': 'إدخال الصوت متاح',
      'ui.clickToClose': 'انقر لإغلاق هذه القائمة',
      'ui.welcomeGreeting': 'المساعدة والانسجام — مباشرة من Beale',
      'ui.welcomeDescription': 'أنا هنا لمساعدتك في أي خدمات مدينة ممفيس تحتاجها - سواء كان الإبلاغ عن الحفر، الحصول على تصاريح، أو مجرد معرفة كيفية إنجاز الأمور هنا.',
      'ui.welcomeLanguages': 'أتحدث الإنجليزية والإسبانية والعربية - لذا بأي لغة تفضلها، نحن مستعدون!',
      'ui.bealeThinking': 'Beale يحضر إجابة...',
      'ui.enterMessage': 'أدخل رسالتك...',
      'ui.examplePotholeSlider': 'كيف أبلغ عن حفرة في الطريق؟',
      'ui.relevantResources': 'الموارد ذات الصلة',
      'ui.relevance': 'الصلة',
      'ui.poweredBy': 'مدعوم بواسطة',
      'resources.Social_Media_Center_The_City_of_Memphis': 'مركز وسائل التواصل الاجتماعي',
      'resources.Call_311_The_City_of_Memphis': 'اتصل بـ 311',
      'resources.Loans_and_Grants_The_City_of_Memphis': 'القروض والمنح',
      'resources.Housing_and_Community_Development_The_City_of_Memphis': 'الإسكان والتنمية المجتمعية',
      'resources.Government_The_City_of_Memphis': 'الحكومة',
      'resources.Office_of_Community_Affairs_The_City_of_Memphis': 'مكتب الشؤون المجتمعية',
      'resources.Community_Affairs_The_City_of_Memphis': 'الشؤون المجتمعية',
      'resources.Call_511_The_City_of_Memphis': 'اتصل بـ 511',
      'resources.Transportation_The_City_of_Memphis': 'النقل',
      'resources.Public_Works_The_City_of_Memphis': 'الأشغال العامة',
      'resources.Health_Department_The_City_of_Memphis': 'إدارة الصحة',
      'resources.Emergency_Services_The_City_of_Memphis': 'خدمات الطوارئ',
      'resources.Social_Media_Center___The_City_of_Memphis': 'مركز وسائل التواصل الاجتماعي',
      'resources.Housing_and_Community_Development___The_City_of_Memphis': 'الإسكان والتنمية المجتمعية',
      'resources.Office_of_Community_Affairs___The_City_of_Memphis': 'مكتب الشؤون المجتمعية',
      'resources.Community_Affairs___The_City_of_Memphis': 'الشؤون المجتمعية',
      'resources.Call_511___The_City_of_Memphis': 'اتصل بـ 511',
      'resources.Transportation___The_City_of_Memphis': 'النقل',
      'resources.Public_Works___The_City_of_Memphis': 'الأشغال العامة',
      'resources.Health_Department___The_City_of_Memphis': 'إدارة الصحة',
      'resources.Emergency_Services___The_City_of_Memphis': 'خدمات الطوارئ',
      'resources.Loans_and_Grants___The_City_of_Memphis': 'القروض والمنح',
      'resources.Government___The_City_of_Memphis': 'الحكومة',
      'resources.Call_311___The_City_of_Memphis': 'اتصل بـ 311'
    }
  }
};

// Initialize i18n outside of component to avoid re-initialization
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      debug: false,
      
      interpolation: {
        escapeValue: false,
      },
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      }
    });
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
