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
Vue.component('FontAwesomeIcon', FontAwesomeIcon)

Vue.config.productionTip = false

Vue.filter('durationAsDigits', function (seconds) {
  function twoDigits (value) {
    let strValue = String(value)
    if (strValue.length === 1) {
      strValue = `0${value}`
    }
    return strValue
  }

  if (seconds < 3600) {
    return `${twoDigits(Math.trunc(seconds / 60))}:${twoDigits(seconds % 60)}`
  } else {
    const secondsOfHour = seconds % 3600
    return `${twoDigits(Math.trunc(seconds / 3600))}:${twoDigits(Math.trunc(secondsOfHour / 60))}:${twoDigits(secondsOfHour % 60)}`
  }
})

new Vue({
  router,
  store,
  data: {
    seconds: Math.floor(Date.now() / 1000)
  },
  mounted () {
    setInterval(this.updateSeconds, 1000)
  },
  methods: {
    updateSeconds () {
      this.seconds = Math.floor(Date.now() / 1000)
    }
  },
  render: h => h(App)
}).$mount('#app')
