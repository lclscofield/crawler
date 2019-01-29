const http = require('http')
const https = require('https')
const cheerio = require('cheerio')
const iconvLite = require('iconv-lite')

async function getHtml(url, type, protocol) {
  return new Promise((resolve, reject) => {
    try {
      let req = protocol === 'http' ? http.get(url) : https.get(url)
      let chunks = [] // 储存页面块
      req.on('response', res => {
        res.on('data', chunk => {
          chunks.push(chunk)
        })
        res.on('end', () => {
          let html = iconvLite.decode(Buffer.concat(chunks), type)
          resolve(cheerio.load(html, { decodeEntities: false }))
        })
      })
    } catch (err) {
      throw new Error(err)
    }
  })
}

module.exports = {
  getHtml
}
