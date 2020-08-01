import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

import App from './App.vue'
import router from './router'
import store from './store'

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronLeft, faCogs, faEdit, faEnvelope, faHome, faInfoCircle, faKey, faLock, faPlus, faQuestionCircle, faSignOutAlt, faTrashAlt, faUser, faUserEdit, faUserMinus, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Configure Font Awesome
library.add(faChevronLeft, faCogs, faEdit, faEnvelope, faHome, faInfoCircle, faKey, faLock, faPlus, faQuestionCircle, faSignOutAlt, faTrashAlt, faUser, faUserEdit, faUserMinus, faUserPlus)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
