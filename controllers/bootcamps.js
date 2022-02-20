const path = require('path')
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
  query = Bootcamp.find(JSON.parse(queryString)).populate('courses')
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
  const bootcamp = await Bootcamp.findById(req.params.id).populate('courses')
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
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {
    return res.status(400).json({
      success: false,
      error: 'document with this _id not found',
    })
  }
  bootcamp.remove()
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

// @desc Upload photo for bootcamp
// @route PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp with id of ${req.params.id} not exist`, 400)
    )
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400))
  }
  const file = req.files['file\n']
  console.log(file)

  //Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400))
  }

  //Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${Math.ceil(
          process.env.MAX_FILE_UPLOAD / 1000
        )}kb`,
        400
      )
    )
  }
  //Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse(`problem with file upload`, 500))
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({ success: true, photo: file.name })
  })
})
