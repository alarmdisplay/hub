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

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAmbulance, faBell, faBuilding, faCheck, faChevronLeft, faCogs, faEdit, faEnvelope, faFileAlt, faFolder, faHome,
  faInbox, faInfoCircle, faKey, faLock, faPaperPlane, faPause, faPlay, faPlus, faQuestionCircle, faSignOutAlt, faStop,
  faTimes, faTools, faTrashAlt, faUser, faUserEdit, faUserMinus, faUserPlus, faUsers, faUserTag, faWrench
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Configure Font Awesome
library.add(faAmbulance, faBell, faBuilding, faCheck, faChevronLeft, faCogs, faEdit, faEnvelope, faFileAlt, faFolder,
  faHome, faInbox, faInfoCircle, faKey, faLock, faPaperPlane, faPause, faPlay, faPlus, faQuestionCircle, faSignOutAlt,
  faStop, faTimes, faTrashAlt, faTools, faUser, faUserEdit, faUserMinus, faUserPlus, faUsers,faUserTag, faWrench)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
