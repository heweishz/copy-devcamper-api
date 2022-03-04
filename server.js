const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')

const mongosanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')
//load env variables
dotenv.config({ path: './config/config.env' })

//connect to database
connectDB()

const app = express()

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//File uploading
app.use(fileupload())

//Sanitize data
app.use(mongosanitize())

//Set security headers
app.use(helmet({ contentSecurityPolicy: false }))

//Prevent XSS attacks
app.use(xss())

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100, //limit each IP to 100 requests per windowMs
})

app.use(limiter)

//Prevent http param pollution
app.use(hpp())

//Enable CORS
app.use(cors())

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount routers

app.use('/api/v1/bootcamps', require('./routes/bootcamps'))
app.use('/api/v1/courses', require('./routes/courses'))
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/users', require('./routes/users'))
app.use('/api/v1/reviews', require('./routes/reviews'))
app.use(errorHandler.errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
})
