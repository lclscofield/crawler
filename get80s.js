const http = require('https')
const cheerio = require('cheerio')
const iconvLite = require('iconv-lite')

let AllMovies = []

async function getHtmlHttps(url) {
  return new Promise((resolve, reject) => {
    let req = https.get(url)
    let chunks = [] // 储存页面
    req.on('response', res => {
      res.on('data', chunk => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        let html = iconvLite.decode(Buffer.concat(chunks), 'utf-8')
        resolve(cheerio.load(html, { decodeEntities: false }))
      })
    })
  })
}

async function get80s(startIndex, endIndex) {
  for (let i = startIndex; i <= endIndex; i++) {
    let movies = []
    console.log(`正在获取第 ${i} 页的 Movie`)
    let url = `https://www.80s.tw/movie/list/-----p/${i}`
    let $ = await getHtmlHttps(url)
    let $elements = []
    $('.me1 li>a').each((idx, e) => {
      let $e = $(e)
      $elements.push($e)
      let titleAttr = $e.attr('title').split('  ')
      movies.push({
        title: titleAttr[0],
        grade: titleAttr[1]
      })
    })
    for (let j = 0; j < $elements.length; j++) {
      let link = await get80sLink($elements[j].attr('href'))
      movies[j].link = link
    }
    AllMovies.push(movies)
    console.log(movies)
  }
}

async function get80sLink(link) {
  let url = `https://www.80s.tw${link}`
  let $ = await getHtmlHttps(url)
  let linkElement = $('#cpdl2list .cpdl2list-b5 li xunlei')
  // console.log(linkElement.attr('href'))
  return linkElement ? linkElement.attr('href') : ''
}

async function main(startIndex, endIndex) {
  await get80s(startIndex, endIndex)
  console.log('获取 Movies 完毕')
}
main(1, 2)
