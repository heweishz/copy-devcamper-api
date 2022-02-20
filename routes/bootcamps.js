const express = require('express')
const getBootcamps = require('../controllers/bootcamps')
const router = express.Router()

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')
// router.get('/', getBootcamps.getBootcamps)
// router.get('/:id', getBootcamps.getBootcamp)
// router.post('/', getBootcamps.createBootcamp)
// router.put('/:id', getBootcamps.updateBootcamp)
// router.delete('/:id', getBootcamps.deleteBootcamp)

//Include other resource routers
const courseRouter = require('./courses')

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)
router.route('/:id/photo').put(getBootcamps.bootcampPhotoUpload)
router
  .route('/radius/:zipcode/:distance')
  .get(getBootcamps.getBootcampsInradius)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps.getBootcamps)
  .post(getBootcamps.createBootcamp)
router
  .route('/:id')
  .get(getBootcamps.getBootcamp)
  .put(getBootcamps.updateBootcamp)
  .delete(getBootcamps.deleteBootcamp)
module.exports = router
