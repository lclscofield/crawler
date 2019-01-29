// 引用mongoose模块
const mongoose = require('mongoose')

async function connectDb() {
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
}
async function disconnectDb() {
  await mongoose.disconnect(() => {
    console.log('连接断开')
  })
}

// mongoose.Schema 方法用来定义数据集的格式
const Schema = mongoose.Schema
// 电影信息数据格式
const MovieSchema = new Schema(
  {
    title: String, // 电影名
    translated: String, // 译名
    enTitle: String, // 片名
    decade: String, // 年代
    productionPlace: String, // 产地
    type: String, // 类别
    language: String, // 语言
    subtitle: String, // 字幕
    releaseTime: String, // 上映日期
    IMDb: String, // IMDB 评分
    douban: String, // 豆瓣评分
    fileFormat: String, // 文件格式
    resolution: String, // 视频尺寸
    timeLength: String, // 片长
    director: String, // 导演
    scriptwriter: String, // 编剧
    starring: String, // 主演
    introduction: String, // 简介
    imgMain: String, // 主图片
    imgSub: String, // 副图片
    link: String, // 下载链接
    hits: String // 点击量
  },
  { timestamps: true }
)

// mongoose.model方法将格式分配给指定的数据集
const Models = {
  MovieInfo: mongoose.model('movies', MovieSchema)
}

module.exports = {
  Models,
  mongoose,
  connectDb,
  disconnectDb
}
