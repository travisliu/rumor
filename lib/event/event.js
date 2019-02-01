const https = require('https')
const util = require('util')
const config = require('../../app.config.json')

module.exports = class Event {
  constructor(data) {
    this.data 
    this.replyToken = data.replyToken
    this.message    = data.message.text.trim()
  } 

  emit() {
  
  }

  httpPost(host, path, payload, options = {}) {
    return new Promise((resolve, reject) => {
      let headers  = options.headers || {}
      headers['Content-Type']   =  'application/json',
      headers['Content-Length'] = Buffer.byteLength(content)

      let content = JSON.stringify(payload)
      let client = https.request( 
        {
          host,
          path,
          port: '443',
          method: 'POST',
          headers
        }, response => {
          let body = ''
          response.setEncoding('utf8')
          response.on('data', chunk => { body += chunk })
          response.on('end', () => { 
            if (response.statusCode != 200) reject(body)
            try {
              resolve({code: response.statusCode, body: JSON.parse(body).data.ListArticles.edges})
            } catch(error) {
              reject("can't parse response body")
            }
          })
        }
      )

      client.write(content)
      client.end()
    })
  }

  async reply(content) {
    const host = 'https://api.line.me/v2/bot'
    const path = '/message/reply'
    const body = {
      replyToken: this.replyToken,
      message: content
    }

    return await this.httpPost(host, path, body, {headers: {Authorization: `Bearer ${config.lineAuth.channelAccessToken}`}})
  }
}
