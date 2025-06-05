import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Sample translations
const resources = {
  en: {
    translation: {
      settings: "Settings",
      managePreferences: "Manage your account preferences",
      editProfile: "Edit Profile",
      // ... other keys
    },
  },
  yo: {
    translation: {
      settings: "Àtúnṣe",
      managePreferences: "Ṣakoso awọn ayanfẹ akọọlẹ rẹ",
      editProfile: "Ṣatunkọ Profaili",
      // ... other keys
    },
  },
  // Add more languages...
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: ['settings'],
    defaultNS: 'settings',
    resources: {
      en: {
        settings: require('./public/locales/en/settings.json')
      },
      yo: {
        settings: require('./public/locales/yo/settings.json')
      }
      // other languages
    }
  });

export default i18n;
