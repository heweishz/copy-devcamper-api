const express = require('express')
const users = require('../controllers/users')

const User = require('../models/User')

const router = express.Router({ mergeParams: true })

const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))
router
  .route('/')
  .get(advancedResults(User), users.getUsers)
  .post(users.createUser)

router
  .route('/:id')
  .get(users.getUser)
  .put(users.updateUser)
  .delete(users.deleteUser)

module.exports = router
