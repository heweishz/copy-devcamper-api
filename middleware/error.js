const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  //log error to console
  // console.log(err.stack.red)
  // console.log(err.message.red)
  //console.log(err)

  let error = { ...err }
  // console.log(err.hasOwnProperty('message'))
  error.message = err.message
  // console.log(err.hasOwnProperty('message'))

  //Mongoose bad ObjectId error
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }
  //Mongoose duplicate key error
  if (err.code === 11000) {
    message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }
  //Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message)
    error = new ErrorResponse(message, 400)
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server Error' })
}

module.exports.errorHandler = errorHandler
