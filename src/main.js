import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import App from './App.vue'
import router from './router'
import store from './store'

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faChevronLeft, faCogs, faEdit, faEnvelope, faFolder, faHome, faInbox, faInfoCircle, faKey, faLock,
  faPause, faPlay, faPlus, faQuestionCircle, faSignOutAlt, faStop, faTimes, faTrashAlt, faUser, faUserEdit, faUserMinus,
  faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Configure Font Awesome
library.add(faCheck, faChevronLeft, faCogs, faEdit, faEnvelope, faFolder, faHome, faInbox, faInfoCircle, faKey, faLock,
  faPause, faPlay, faPlus, faQuestionCircle, faSignOutAlt, faStop, faTimes, faTrashAlt, faUser, faUserEdit, faUserMinus,
  faUserPlus)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
