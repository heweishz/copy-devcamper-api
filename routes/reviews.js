const express = require('express')

const reviews = require('../controllers/reviews')

const Review = require('../models/Review')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description',
    }),
    reviews.getReviews
  )
  .post(protect, authorize('user'), reviews.addReview)
router
  .route('/:id')
  .get(reviews.getReview)
  .put(protect, authorize('user', 'admin'), reviews.updateReview)
  .delete(protect, authorize('user', 'admin'), reviews.deleteReview)
module.exports = router
