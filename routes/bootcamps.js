const express = require('express')
const router = express.Router()
const getBootcamps = require('../controllers/bootcamps')

// router.get('/', getBootcamps.getBootcamps)
// router.get('/:id', getBootcamps.getBootcamp)
// router.post('/', getBootcamps.createBootcamp)
// router.put('/:id', getBootcamps.updateBootcamp)
// router.delete('/:id', getBootcamps.deleteBootcamp)

router
  .route('/')
  .get(getBootcamps.getBootcamps)
  .post(getBootcamps.createBootcamp)
router
  .route('/:id')
  .get(getBootcamps.getBootcamp)
  .put(getBootcamps.updateBootcamp)
  .delete(getBootcamps.deleteBootcamp)
module.exports = router
