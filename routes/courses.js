const express = require('express')
const getCourses = require('../controllers/courses')

const { protect, authorize } = require('../middleware/auth')
const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses.getCourses
  )
  .post(protect, authorize('publisher', 'admin'), getCourses.addCourse)
router
  .route('/:id')
  .get(getCourses.getCourse)
  .put(protect, authorize('publisher', 'admin'), getCourses.updateCourse)
  .delete(protect, authorize('publisher', 'admin'), getCourses.deleteCourse)

module.exports = router
