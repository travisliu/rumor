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

  httpPost(host, path, payload) {
    return new Promise((resolve, reject) => {
      let content = JSON.stringify(payload)
      var client = https.request(
        {
          host,
          path,
          port: '443',
          method: 'POST',
          headers: {
            'Content-Type':   'application/json',
            'Content-Length': Buffer.byteLength(content)
          }
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

    return await this.httpPost(host, path, body)
  }
}
