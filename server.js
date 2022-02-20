const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

//load env variables
dotenv.config({ path: './config/config.env' })

//connect to database
connectDB()

const app = express()

//Body parser
app.use(express.json())

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//File uploading
app.use(fileupload())

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount routers

app.use('/api/v1/bootcamps', require('./routes/bootcamps'))
app.use('/api/v1/courses', require('./routes/courses'))

app.use(errorHandler.errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
})
