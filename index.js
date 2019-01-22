const http = require('http')
const cheerio = require('cheerio')
const iconvLite = require('iconv-lite')
const { db, mongoose } = require('./db')

let AllMovies = []

async function getHtml(url, type) {
  return new Promise((resolve, reject) => {
    let req = http.get(url)
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
  })
}

async function getYgdyMain(i) {
  console.log(`正在获取第 ${i} 页的 Movie`)
  const startTime = new Date()
  let movies = []
  let hrefs = []
  const url = `http://www.ygdy8.net/html/gndy/dyzz/list_23_${i}.html`
  const $ = await getHtml(url, 'gb2312')
  $('.co_content8 td a').each((idx, e) => {
    let $e = $(e)
    movies.push({
      title: $e.text(),
      link: ''
    })
    hrefs.push($e.attr('href'))
  })
  const links = await getYgdyLink(hrefs)
  movies.forEach((item, index) => {
    item.link = links[index]
  })
  const endTime = new Date()
  console.log(`获取本页消耗时间${endTime - startTime}ms`)
  return movies
}

async function getYgdyLink(hrefs) {
  const promises = hrefs.map(item => {
    return getHtml(`http://www.ygdy8.net${item}`, 'gb2312')
  })
  let links = []
  await Promise.all(promises)
    .then(htmls => {
      links = htmls.map($ => {
        let linkElement = $('#Zoom td a')
        return linkElement ? linkElement.attr('href') : ''
      })
    })
    .catch(err => {
      throw new Error(err)
    })
  return links
}

async function getMoviesData(startIndex, endIndex) {
  const startTime = new Date()
  const page = endIndex - startIndex + 1
  for (let i = startIndex; i <= page; i++) {
    AllMovies = AllMovies.concat(await getYgdyMain(i))
    // console.log(AllMovies[i - startIndex], AllMovies[i - startIndex].length)
  }
  const endTime = new Date()
  console.log('获取 Movies 完毕')
  console.log(`获取共消耗时间${endTime - startTime}ms`)
}

async function insertMongo() {
  // 连接数据库
  await mongoose.connect(
    'mongodb://localhost:27017/lcl',
    { useNewUrlParser: true },
    err => {
      if (err) {
        console.log('连接失败')
      } else {
        console.log('连接成功')
      }
    }
  )
  console.log('开始插入数据库')
  const startTime = new Date()
  try {
    await db.MovieInfo.create(AllMovies)
  } catch (err) {
    console.log(err)
  }
  const endTime = new Date()
  console.log('插入数据库完毕')
  console.log(`写入数据库消耗时间${endTime - startTime}ms`)
  await mongoose.disconnect(() => {
    console.log('连接断开')
  })
}

async function main(startIndex, endIndex) {
  await getMoviesData(startIndex, endIndex)
  await insertMongo()
  console.log('end')
}
main(1, 100)
