const { connectDb, disconnectDb } = require('../mongo/db')
const { insertMongo } = require('../mongo/update')
const { getHtml } = require('../fn')

async function get80sMain(i) {
  console.log(`正在获取第 ${i} 页的 Movie`)
  const startTime = new Date()
  let movies = []
  let hrefs = []
  const url = `https://www.80s.tw/movie/list/-----p/${i}`
  const $ = await getHtml(url, 'utf-8', 'https')
  $('.me1 li h3 a').each((index, e) => {
    let $e = $(e)
    hrefs.push($e.attr('href'))
  })
  console.log(hrefs)
  const fields = await getDetails(hrefs)
  fields.forEach((item, index) => {
    movies[index] = {
      ...item
    }
  })
  const endTime = new Date()
  console.log(`获取本页消耗时间${endTime - startTime}ms`)
  return movies
}

async function getDetails(hrefs) {
  const promises = hrefs.map(item => {
    return getHtml(`https://www.80s.tw${item}`, 'utf-8', 'https')
  })
  let fields = []
  await Promise.all(promises)
    .then(htmls => {
      fields = htmls.map($ => {
        return getFields($)
      })
    })
    .catch(err => {
      throw new Error(err)
    })
  return fields
}

function getFields($) {
  let fields = {}
  const title = getContent($, '.info', 'text')
  fields.title = title
  // fields.xxx = getContent($, '#Zoom', 'text')
  return fields
}

function getContent($, option, type) {
  if (type === 'text') {
    return $(option).text()
  }
}

async function main(startIndex, endIndex) {
  const page = endIndex - startIndex + 1
  // 连接数据库
  // await connectDb()
  const startTime = new Date()
  for (let i = startIndex; i <= page; i++) {
    const movies = await get80sMain(i)
    console.log(movies)
    // await insertMongo(movies)
  }
  // console.log('获取全部 Movies 并存入数据库完毕')
  // console.log(`共消耗时间${endTime - startTime}ms`)
  // // 断开数据库
  // await disconnectDb()
  // console.log('end')
}

module.exports = {
  get80s: main
}
