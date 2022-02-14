const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc Get all bootcamp
// @route GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query
  //Copy req.query
  const reqQuery = { ...req.query }
  //Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit']
  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => {
    return delete reqQuery[param]
  })
  //Create query string
  let queryString = JSON.stringify(reqQuery)
  //Create operators ($gt, $gte, etc)
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  )
  //Finding resource
  query = Bootcamp.find(JSON.parse(queryString))
  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }
  //Sort
  if (req.query.sort) {
    const sortby = req.query.sort.split(',').join(' ')
    query = query.sort(sortby)
  } else {
    query = query.sort('-createdAt')
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = await Bootcamp.countDocuments()
  query = query.skip(startIndex).limit(limit)

  //Executing query
  const bootcamps = await query

  //Pagination result
  const pagination = {}
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    }
  }

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, pagination, bootcamps })
})
// @desc Get single bootcamp
// @route GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`document with _id ${req.params.id} not found`, 404)
    )
  }
  res.status(200).json({ success: true, bootcamp })
})
// @desc Create bootcamp
// @route POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)
  res.status(201).json({ success: true, bootcamp })
})
// @desc Update single bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!bootcamp) {
    return res.status(400).json({ success: false, error: 'document not found' })
  }
  res.status(201).json({ successs: true, bootcamp })
})
// @desc Delete single bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
  if (!bootcamp) {
    return res.status(400).json({
      success: false,
      error: 'document with this _id not found',
    })
  }
  res.status(200).json({ success: true, bootcamp })
})
// @desc Get bootcamp within a radius
// @route Get /api/v1/bootcamps/radius/:zipcode/:distance
// @access Public
exports.getBootcampsInradius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params
  //Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  //Calc radius using radians
  //Divide dist by radius of Earth
  //Earth Radius = 3,958 mi / 6,378 km
  const radius = distance / 3958

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  })

  res.status(200).json({ success: true, count: bootcamps.length, bootcamps })
})
