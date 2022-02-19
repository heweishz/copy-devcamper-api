const express = require('express')
const getCourses = require('../controllers/courses')

const router = express.Router({ mergeParams: true })

router.route('/').get(getCourses.getCourses).post(getCourses.addCourse)
router
  .route('/:id')
  .get(getCourses.getCourse)
  .put(getCourses.updateCourse)
  .delete(getCourses.deleteCourse)

module.exports = router
