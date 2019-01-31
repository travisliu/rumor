const Server = require('./lib/server')

const path   = process.env.WEBHOOK_PATH || '/linewebhook'
const port   = process.env.WEBHOOK_PORT ||  3030
const server = new Server()

server.on('message', event => {
  console.log(`message: ${JSON.stringify(event)}`)
})

server.on('intro', event => {
  console.log(`intro: ${JSON.stringify(event)}`)
})

server.listen(path, port)
