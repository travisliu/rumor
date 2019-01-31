const http = require('http')

const react = (event) => {
  if (event.type == "message") {

  }
}

const server = http.createServer((req, res) => {

  const path = process.env.WEBHOOK_PATH || '/linewebhook'

  const signature = req.headers['x-line-signature']
  res.setHeader('X-Powered-By', 'linebot')
  if (req.method === 'POST' && req.url === path) {
    var body = ''
    req.on('data', data => {
      body += data

      if (body.length > 1e6) req.connection.destroy()
    })

    req.on('end', () => {
      const payload = JSON.parse(body)
      for(let i = 0; i < payload.events.length; i++) {
        react(payload.events[i])
      }
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

const port = process.env.WEBHOOK_PORT || 1987

server.listen(port)
