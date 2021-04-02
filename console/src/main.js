import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import App from './App.vue'
import router from './router'
import store from './store'

import moment from 'moment'
import VueMoment from 'vue-moment'
require('moment/locale/de')
Vue.use(VueMoment, { moment })

// Load Font Awesome
import FontAwesomeIcon from './font-awesome'
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
