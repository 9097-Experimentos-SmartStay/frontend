import { createApp } from "vue";
import App from "./app.vue";
import { router } from "./shared/router/index.js";

import PrimeVue from "primevue/config";
import "primevue/resources/themes/aura-light-blue/theme.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.mount("#app");


