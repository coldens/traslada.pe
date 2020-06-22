import 'babel-polyfill';

import Vue from 'vue';
import VueMeta from 'vue-meta';
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyBsa5TUb0YF_IHvcrc-lbRRy1xIcGCfhRQ',
    libraries: 'places',
    region: 'PE',
    language: 'es',
  }
});

Vue.use(VueMeta);

import App from './App.vue';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app');
