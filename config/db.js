const mongoose = require('mongoose')
const dotenv = require('dotenv')

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  })
  console.log(
    `MongoDB connected: connected to ${conn.connection.host}`.underline.cyan
      .bold
  )
}

module.exports = connectDB
