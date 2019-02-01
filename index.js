const Server = require('./lib/server')

const path   = process.env.WEBHOOK_PATH || '/linewebhook'
const port   = process.env.WEBHOOK_PORT ||  3030
const server = new Server()

server.listen(path, port)
