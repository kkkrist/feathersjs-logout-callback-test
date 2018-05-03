import io from 'socket.io-client/dist/socket.io.js'
import feathers from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import authentication from '@feathersjs/authentication-client'

const app = feathers()
  .configure(socketio(io(), {}))
  .configure(authentication({ storage: window.localStorage }))

const checkJwt = () => {
  document.getElementById('login-jwt').disabled = !window.localStorage.getItem(
    'feathers-jwt'
  )
}

const showResult = (id, result) => {
  document.getElementById(id).innerHTML = JSON.stringify(result)
}

const onClick = (id, action) => {
  document.getElementById(id).addEventListener('click', action)
}

onClick('login-local', () => {
  app
    .authenticate({ strategy: 'local', email: 'test@test', password: 'test' })
    .then(({ accessToken }) => app.passport.verifyJWT(accessToken))
    .then(user => {
      // app.set('user', user)
      showResult('authenticate-status', user)
    })
    .catch(error => showResult('authenticate-status', error))
})

onClick('login-jwt', () => {
  app
    .authenticate({
      strategy: 'jwt',
      accessToken: window.localStorage.getItem('feathers-jwt')
    })
    .then(({ accessToken }) => app.passport.verifyJWT(accessToken))
    .then(user => {
      // app.set('user', user)
      showResult('authenticate-status', user)
    })
    .catch(error => showResult('authenticate-status', error))
})

onClick('logout', () => {
  app
    .logout()
    .then(
      result => showResult('authenticate-status', result),
      error => showResult('authenticate-status', error)
    )
})

onClick('users-find', () => {
  app
    .service('users')
    .find()
    .then(
      result => showResult('users-status', result),
      error => showResult('users-status', error)
    )
})

app.on('authenticated', checkJwt)
app.on('logout', checkJwt)

checkJwt()
