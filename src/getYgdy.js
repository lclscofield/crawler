const { connectDb, disconnectDb } = require('../mongo/db')
const { insertMongo } = require('../mongo/update')
const { getHtml } = require('../fn')

async function getYgdyMain(i) {
  console.log(`正在获取第 ${i} 页的 Movie`)
  const startTime = new Date()
  let movies = []
  let hrefs = []
  const url = `http://www.ygdy8.net/html/gndy/dyzz/list_23_${i}.html`
  const $ = await getHtml(url, 'gb2312', 'http')
  $('.co_content8 td a').each((index, e) => {
    let $e = $(e)
    hrefs.push($e.attr('href'))
  })
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
    return getHtml(`http://www.ygdy8.net${item}`, 'gb2312', 'http')
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
  // 获取 title
  const title = $('.title_all font').text()
  try {
    fields.title = title.split('《')[1].split('》')[0]
  } catch (err) {
    fields.title = title
  }
  // 获取详情
  let content = $('#Zoom').text()
  content = content
    .slice(0, content.indexOf('【'))
    .trim()
    .split('◎')
  let contentObj = {
    translated: '',
    enTitle: '',
    decade: '',
    productionPlace: '',
    type: '',
    language: '',
    subtitle: '',
    releaseTime: '',
    IMDb: '',
    douban: '',
    fileFormat: '',
    resolution: '',
    timeLength: '',
    director: '',
    scriptwriter: '',
    starring: '',
    introduction: '',
    hits: 0
  }
  content.forEach(item => {
    switch (true) {
      case /译　　名　/.test(item):
        contentObj.translated = item.replace('译　　名　', '').trim()
        break
      case /片　　名　/.test(item):
        contentObj.enTitle = item.replace('片　　名　', '').trim()
        break
      case /年　　代　/.test(item):
        contentObj.decade = item.replace('年　　代　', '').trim()
        break
      case /产　　地　/.test(item):
        contentObj.productionPlace = item.replace('产　　地　', '').trim()
        break
      case /类　　别　/.test(item):
        contentObj.type = item.replace('类　　别　', '').trim()
        break
      case /语　　言　/.test(item):
        contentObj.language = item.replace('语　　言　', '').trim()
        break
      case /字　　幕　/.test(item):
        contentObj.subtitle = item.replace('字　　幕　', '').trim()
        break
      case /上映日期　/.test(item):
        contentObj.releaseTime = item.replace('上映日期　', '').trim()
        break
      case /IMDb评分　/.test(item):
        contentObj.IMDb = item.replace('IMDb评分　', '').trim()
        break
      case /豆瓣评分　/.test(item):
        contentObj.douban = item.replace('豆瓣评分　', '').trim()
        break
      case /文件格式　/.test(item):
        contentObj.fileFormat = item.replace('文件格式　', '').trim()
        break
      case /视频尺寸　/.test(item):
        contentObj.resolution = item.replace('视频尺寸　', '').trim()
        break
      case /片　　长　/.test(item):
        contentObj.timeLength = item.replace('片　　长　', '').trim()
        break
      case /导　　演　/.test(item):
        let director = item
          .replace('导　　演　', '')
          .trim()
          .split(' 　　　　　　')
        contentObj.director = director.join(' / ')
        break
      case /编　　剧　/.test(item):
        let scriptwriter = item
          .replace('编　　剧　', '')
          .trim()
          .split(' 　　　　　　')
        contentObj.scriptwriter = scriptwriter.join(' / ')
        break
      case /主　　演　/.test(item):
        let starring = item
          .replace('主　　演　', '')
          .trim()
          .split(' 　　　　　　')
        contentObj.starring = starring.join(' / ')
        break
      case /简　　介/.test(item):
        contentObj.introduction = item.replace('简　　介', '').trim()
        break
    }
  })
  // 所有字段
  fields = {
    title: fields.title,
    ...contentObj
  }
  // 获取图片和链接
  fields.imgMain = $($('#Zoom p img')[0]).attr('src')
  fields.imgSub = $($('#Zoom p img')[1]).attr('src')
  fields.link = $('#Zoom td a').attr('href')
  return fields
}

async function main(startIndex, endIndex) {
  const page = endIndex - startIndex + 1
  // 连接数据库
  await connectDb()
  const startTime = new Date()
  for (let i = startIndex; i <= page; i++) {
    const movies = await getYgdyMain(i)
    await insertMongo(movies)
  }
  const startTime = new Date()
  console.log('获取全部 Movies 并存入数据库完毕')
  console.log(`共消耗时间${endTime - startTime}ms`)
  // 断开数据库
  await disconnectDb()
  console.log('end')
}

module.exports = {
  getYgdy: main
}
