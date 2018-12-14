// 引用mongoose模块
const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost:27017/lcl')
const db = mongoose.connection
// 连接成功
db.on('connected', () => {
  console.log('连接成功')
})
// 连接失败
db.on('error', () => {
  console.log('连接失败')
})

// mongoose.Schema 方法用来定义数据集的格式
const Schema = mongoose.Schema
// 电影信息数据格式
const MovieSchema = new Schema(
  {
    title: String,
    href: String,
    link: String
  },
  { timestamps: true }
)

// mongoose.model方法将格式分配给指定的数据集
const Models = {
  MovieInfo: mongoose.model('movies', MovieSchema)
}

module.exports = Models
