const http = require('http')
const cheerio = require('cheerio')
const iconvLite = require('iconv-lite')

let AllMovies = []

async function getHtml(url) {
  return new Promise((resolve, reject) => {
    let req = http.get(url)
    let chunks = [] // 储存页面
    req.on('response', res => {
      res.on('data', chunk => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        let html = iconvLite.decode(Buffer.concat(chunks), 'gb2312')
        resolve(cheerio.load(html, { decodeEntities: false }))
      })
    })
  })
}

async function getYgdy(startIndex, endIndex) {
  for (let i = startIndex; i <= endIndex; i++) {
    let movies = []
    console.log(`正在获取第 ${i} 页的 Movie`)
    let url = `http://www.ygdy8.net/html/gndy/dyzz/list_23_${i}.html`
    let $ = await getHtml(url)
    let $elements = []
    $('.co_content8 td a').each((idx, e) => {
      $elements.push($(e))
    })
    for (let j = 0; j < $elements.length; j++) {
      let link = await getYgdyLink($elements[j].attr('href'))
      movies.push({
        title: $elements[j].text(),
        link
      })
    }
    AllMovies.push(movies)
    console.log(movies)
  }
}

async function getYgdyLink(link) {
  let url = `http://www.ygdy8.net${link}`
  let $ = await getHtml(url)
  let linkElement = $('#Zoom td a')
  return linkElement ? linkElement.attr('href') : ''
}

async function main(startIndex, endIndex) {
  await getYgdy(startIndex, endIndex)
  console.log('获取 Movies 完毕')
}
main(1, 2)
