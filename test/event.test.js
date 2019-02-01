const MessageEvent = require('../lib/event/messageEvent')
const util = require('util')
const validArticle = require('./valid-article.stub.json')
const edgeStub = require('./edge.stub.json')

test('url comparison', () => {
  let originUrl01 = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  let url01       = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  expect(MessageEvent.compareUrls(originUrl01, url01)).toBeTruthy()

  let originUrl02 = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  let url02       = 'https://user:pass@sub.example2.com:8080/p/a/t/h?query=string#hash'
  expect(MessageEvent.compareUrls(originUrl02, url02)).toBeFalsy()

  let originUrl03 = 'https://user:pass@sub.example.com:8080/a/a/t/h?query=string#hash'
  let url03       = 'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'
  expect(MessageEvent.compareUrls(originUrl03, url03)).toBeFalsy()

  let originUrl04 = 'https://user:pass@sub.example.com:8080/p/a/t/h?a=1&b=2#hash'
  let url04       = 'https://user:pass@sub.example.com:8080/p/a/t/h?b=2&a=1#hash'
  expect(MessageEvent.compareUrls(originUrl04, url04)).toBeTruthy()

})

test('message decoration', () => {
  let event = new MessageEvent({replyToken: "token", message: {text: "message"}})
  let message = event.decorateEdge(edgeStub)
  expect(message).toEqual(expect.stringContaining("一則關於這是謠言的查證"))
})
