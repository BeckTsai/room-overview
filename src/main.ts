import { createApp, Plugin } from 'vue';
import App from './App.vue';
import router from './router/router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import VueQrcode from '@chenfengyuan/vue-qrcode';

import { Quasar, Loading, Notify, Dialog } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import { createPinia } from 'pinia';
import './index.css';

import Confirm from './plugins/Confirm/index';

const myApp = createApp(App);

myApp.component(VueQrcode.name, VueQrcode);

myApp.use(Quasar, {
  plugins: { Loading, Notify, Dialog },
  config: {
    loading: {},
    notify: {},
  },
});

myApp.use(Confirm as Plugin);

myApp.use(createPinia()).use(VueAxios, axios).use(router).mount('#app');
