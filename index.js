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
  let arr = []
  for (let i = 0; i < endIndex - startIndex + 1; i++) {
    arr[i] = ''
  }
  const allMovies = arr.map(async (item, index) => {
    let i = index + startIndex // 爬取的当前页数
    let movies = [] // 一页的所有电影

    console.log(`正在获取第 ${i} 页的 Movie`)
    let url = `http://www.ygdy8.net/html/gndy/dyzz/list_23_${i}.html`
    let $ = await getHtml(url)

    $('.co_content8 td a').each((idx, e) => {
      let $e = $(e)
      movies.push({
        title: $e.text(),
        href: $e.attr('href'),
        link: ''
      })
    })

    const links = movies.map(async item => {
      let resLink = await getYgdyLink(item.href)
      return resLink
    })

    for (const key in links) {
      movies[key].link = await links[key]
    }

    return movies
  })

  for (const value of allMovies) {
    AllMovies.push(await value)
  }
}

async function getYgdyLink(link) {
  let url = `http://www.ygdy8.net${link}`
  let $ = await getHtml(url)
  let linkElement = $('#Zoom td a')
  return linkElement ? linkElement.attr('href') : ''
}

async function main(startIndex, endIndex) {
  let startTime = new Date()
  await getYgdy(startIndex, endIndex)
  let endTime = new Date()
  console.log('获取 Movies 完毕')
  console.log(`共消耗时间${endTime - startTime}ms`)
}
main(1, 2)
