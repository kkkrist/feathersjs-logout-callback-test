'use strict'

const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio')
const auth = require('@feathersjs/authentication')
const local = require('@feathersjs/authentication-local')
const jwt = require('@feathersjs/authentication-jwt')
const memory = require('feathers-memory')

const app = express(feathers())

app
  .configure(express.rest())
  .configure(socketio())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', express.static(__dirname + '/../public'))
  .use(express.errorHandler())

app.service('authentication').hooks({
  before: {
    create: [auth.hooks.authenticate(['jwt', 'local'])],
    remove: [auth.hooks.authenticate('jwt')]
  }
})

app.service('users').hooks({
  before: {
    find: [auth.hooks.authenticate('jwt')],
    create: [local.hooks.hashPassword({ passwordField: 'password' })]
  },
  after: local.hooks.protect('password')
})

app
  .service('users')
  .create({ email: 'test@test', password: 'test' })
  .catch(error => {
    throw error
  })

app.on('logout', (result, meta) => {
  console.log('logout callback meta.connection:', meta.connection)
})

const server = app.listen(3030)

server.on('listening', () => console.log('Feathers app started.'))
