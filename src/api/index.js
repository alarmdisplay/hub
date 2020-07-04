import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
import auth from '@feathersjs/authentication-client'

const socket = io();
const app = feathers();

// Set up Socket.io client with the socket
app.configure(socketio(socket));

// Configure automatic (re)authentication
app.configure(auth({
  storageKey: 'hub-auth'
}))

app.io.on('disconnect', (reason) => {
  console.error('socket disconnected', reason)
});

export default {
  async getCurrentUser () {
    const { user } = await app.get('authentication');
    return user
  },
  getService (service) {
    return app.service(service)
  },
  login (email, password) {
    return app.authenticate({
      strategy: 'local',
      email: email,
      password: password
    })
  },
  logout () {
    return app.logout()
  }
}
