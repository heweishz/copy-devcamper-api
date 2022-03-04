const express = require('express')
const getBootcamps = require('../controllers/bootcamps')
const router = express.Router()

const { protect, authorize } = require('../middleware/auth')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')
// router.get('/', getBootcamps.getBootcamps)
// router.get('/:id', getBootcamps.getBootcamp)
// router.post('/', getBootcamps.createBootcamp)
// router.put('/:id', getBootcamps.updateBootcamp)
// router.delete('/:id', getBootcamps.deleteBootcamp)

//Include other resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)
router
  .route('/:id/photo')
  .put(
    protect,
    authorize('publisher', 'admin'),
    getBootcamps.bootcampPhotoUpload
  )
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcamps.getBootcampsInradius)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps.getBootcamps)
  .post(protect, authorize('publisher', 'admin'), getBootcamps.createBootcamp)
router
  .route('/:id')
  .get(getBootcamps.getBootcamp)
  .put(protect, authorize('publisher', 'admin'), getBootcamps.updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), getBootcamps.deleteBootcamp)
module.exports = router
