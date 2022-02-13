const fs = require('fs')
const dotenv = require('dotenv')
const colors = require('colors')
const mongoose = require('mongoose')

dotenv.config({ path: './config/config.env' })
const Bootcamp = require('./models/Bootcamp')

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
})

// Read JSON files
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)

const importData = async () => {
  try {
    await Bootcamp.create(bootcamps)
    console.log('Data Imported...'.green.inverse)
    process.exit()
  } catch (error) {
    console.log(error)
  }
}
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany()
    console.log('Data Deleted'.red.inverse)
    process.exit()
  } catch (error) {
    console.log(error)
  }
}

if (process.argv[2] === '-i') {
  importData()
} else if (process.argv[2] === '-d') {
  deleteData()
}
