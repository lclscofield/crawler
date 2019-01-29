const { Models } = require('./db')

async function insertMongo(arr) {
  const startTime = new Date()
  try {
    await Models.MovieInfo.create(arr)
  } catch (err) {
    throw new Error(err)
  }
  const endTime = new Date()
  console.log(`写入数据库消耗时间${endTime - startTime}ms`)
}

module.exports = {
  insertMongo
}
