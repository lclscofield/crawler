const http = require('http')
const cheerio = require('cheerio')
const iconvLite = require('iconv-lite')
const { db, mongoose } = require('./db')

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

    try {
      const links = movies.map(async item => {
        let resLink = await getYgdyLink(item.href)
        return resLink
      })

      for (const key in links) {
        movies[key].link = await links[key]
      }

      return movies
    } catch (err) {
      console.log(err)
    }
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

// async function timeAwait (time) {
//   return setTimeout(() => {
//   }, time);
// }

async function main(startIndex, endIndex) {
  let startTime = new Date()

  let page = endIndex - startIndex + 1
  let quotient = page / 5
  let remainder = page % 5
  for (let i = 0; i < quotient; i++) {
    await getYgdy(startIndex, startIndex + 4)
    await setTimeout(() => {}, 5000)
    startIndex += 5
  }
  if (remainder > 0) {
    await getYgdy(startIndex, startIndex + remainder - 1)
  }

  let endTime = new Date()
  console.log('获取 Movies 完毕')
  console.log(`获取消耗时间${endTime - startTime}ms`)

  console.log('开始插入数据库')
  startTime = new Date()
  for (const value of AllMovies) {
    value.forEach(item => {
      try {
        const MovieInfo = db.MovieInfo
        MovieInfo(item).save()
      } catch (err) {
        console.log(err)
      }
    })
  }
  endTime = new Date()
  console.log('插入数据库完毕')
  console.log(`写入数据库消耗时间${endTime - startTime}ms`)
  mongoose.disconnect(() => {
    console.log('连接断开')
  })
}
main(101, 200)
