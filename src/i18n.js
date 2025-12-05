import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('language') || 'es', // ✅ Español por defecto, pero respeta la preferencia guardada
    fallbackLocale: 'es',
    messages: { en, es}
});

export default i18n;