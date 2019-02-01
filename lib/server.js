const http = require('http')
const Event = require('./event/event')
const MessageEvent = require('./event/messageEvent')

module.exports = class Server {
  listen(path, port) {
    const server = http.createServer( (req, res) => {
      const signature = req.headers['x-line-signature']
      res.setHeader('X-Powered-By', 'linebot')

      if (req.method === 'POST' && req.url === path) {
        let body = ''
        req.on('data', data => {
          body += data

          if (body.length > 1e6) req.connection.destroy()
        })

        req.on('end', () => {
          const payload = JSON.parse(body)
          try {
            payload.events.forEach( event => {
              switch(event.type)  {
                case 'message':
                  if (MessageEvent.validate(event))
                    new MessageEvent(event).emit().then(console).catch(error => {console.log('server error', error)})
                  break
                case 'join':
                  new Event(event).emit().then(console).catch(error => {console.log('server error', error)})
                  break
              }
            })
          } catch(error) { console.log('server error', error)}
        })

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        return res.end('{}')
      } else {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        return res.end('Not found')
      }
    })
    server.listen(port)
  }
}
