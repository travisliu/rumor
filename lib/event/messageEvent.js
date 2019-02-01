const stringSimilarity = require('string-similarity')
const Event = require('./event')
const util = require('util')
const config = require('../../app.config.json')

const query = `
  query($text: String) {
    ListArticles(
      filter: { moreLikeThis: { like: $text } }
      orderBy: [{ _score: DESC }]
       first: 4
    ) {
       edges {
         node {
          id
          text
          hyperlinks {
            url
          }
          articleReplies {
            reply {
              id
              text
              type
              reference
            }
          }
        }
      }
    }
  }
`

const rumorTypes = {
    "RUMOR": "這是謠言",
    "NOT_RUMOR": "這是真的",
    "NOT_ARTICLE": "非查證範圍",
    "OPINIONATED": "個人觀點",
}

const nonReply = "啊，還沒有人查證喔。成為全球第一個回應的人？" 
const cofactsArticleUrl = "https://cofacts.g0v.tw/article/"

module.exports = class MessageEvent extends Event {

  static compareUrls(originUrl, url) {
    if (originUrl === url) return true

    const originUrlObject = new URL(originUrl) 
    const urlObject       = new URL(url)
 
    if (originUrlObject.host !== urlObject.host) return false
    if (originUrlObject.pathname !== urlObject.pathname) return false

    let originParams = originUrlObject.searchParams
    let params       = urlObject.searchParams
    originParams.sort()
    params.sort()
    if (originParams.toString() !== params.toString()) return false

    return true
  }

  async emit() {
    if (this.message.length <= 20) return

    let response
    try {
      response = await this.httpPost(config.event.cofactsHost, config.event.cofactsPath, {query: query, variables: {text: this.message}})
    } catch(error) { console.log('error', error)}
    
    if (response.body.length === 0) return
    let edge = this.findEdge(response.body)

    if (!edge) return
    await this.reply(this.decorateEdge(edge) + `\n--------------\n 你也查到了其他的論點嗎？歡迎回應在 ${cofactsArticleUrl}${edge.node.id}`)
  }
  
  decorateEdge(edge) {
    if (edge.node.articleReplies.length === 0) {
      return nonReply
    }

    let summaryGroup = {} 
    let content = edge.node.articleReplies.map( article => {
      let item = ''
      let type = article.reply.type
      summaryGroup[type] = summaryGroup[type] || 0
      summaryGroup[type]++
      switch(type) {
        case 'NOT_ARTICLE':
          item = `一則回應表示這${rumorTypes[type]}`
          break
        case 'OPINIONATED':
          item = `一則回應表示這是${rumorTypes[type]}`
          break
        default:
          item = `一則關於${rumorTypes[type]}的查證` 
      }
      item += "👵"
      item += `\n${article.reply.text}\n` 
      if (article.reply.reference && article.reply.reference.length > 0) item += `📖 ${article.reply.reference}`
      return item
    }).join("\n--------------\n")

    let summary = Object.keys(summaryGroup).sort((a, b) => {return summaryGroup["b"] - summaryGroup["a"]}).map(key => {
      return `有 ${summaryGroup[key]} 則查證表示${rumorTypes[key]}`
    }).join(', ')
    return summary + "\n--------------\n" + content
  }
  
  findEdge(edges) {
    let similarity = config.event.similarity 
    const urls = this.message.match(/\bhttps?:\/\/\S+/gi) 

    if (urls) {
      return edges.find( (edge) => {
        return edge.node.hyperlinks.find( hyperlink => {
          return urls.find(url => { return MessageEvent.compareUrls(url, hyperlink.url.trim())})
        })
      })
    } else {
      /*
        base on the score ranking from cofacts response
        if (stringSimilarity.compareTwoStrings(this.message, edges[0].node.text) > similarity)
          return edges[0]
      */
      let selectedEdge = {edge: null, score: similarity - 0.0001} 
      edges.forEach( (edge) => {
        let score = stringSimilarity.compareTwoStrings(this.message, edge.node.text)
        if (score > selectedEdge.score) selectedEdge = {score, edge}
      })
      return selectedEdge.edge
    }
  }

}
