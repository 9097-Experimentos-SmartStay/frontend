import { createApp } from 'vue'
import App from './app.vue'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import router from "./router.js";
import pinia from "./pinia.js";
import Carousel from 'primevue/carousel';

import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import FileUpload from 'primevue/fileupload';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import Rating from 'primevue/rating';
import Row from 'primevue/row';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Password from "primevue/password";
import Badge from "primevue/badge";
import Chart from 'primevue/chart';
import ProgressSpinner from 'primevue/progressspinner';

// noinspection JSCheckFunctionSignatures
createApp(App)
    .use(i18n)
    .use(PrimeVue, { theme: { preset: Aura}, ripple: true })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    // --- Registros de Componentes ---
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox', Checkbox)
    .component('pv-data-table', DataTable)
    .component('pv-data-view', DataView)
    .component('pv-dialog', Dialog)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-text', InputText)
    .component('pv-input-number', InputNumber)
    .component('pv-menu', Menu)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-drawer', Drawer)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toolbar', Toolbar)
    .component('pv-toast', Toast)
    .component('pv-avatar', Avatar)
    .component('pv-password', Password)
    .component('pv-badge', Badge)
    .component('pv-chart', Chart)
    .component('pv-carousel', Carousel)
    .component('pv-progress-spinner', ProgressSpinner)
    .directive('tooltip', Tooltip)
    .use(router)
    .use(pinia)
    .mount('#app')