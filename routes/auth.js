const express = require('express')
const auth = require('../controllers/auth')

const router = express.Router()

const { protect } = require('../middleware/auth')

router.route('/register').post(auth.register)
router.route('/login').post(auth.login)
router.route('/me').get(protect, auth.getMe)
router.route('/updatedetails').put(protect, auth.updateDetails)
router.route('/updatepassword').put(protect, auth.updatePassword)
router.route('/forgotpassword').post(auth.forgotPassword)
router.route('/resetpassword/:resettoken').put(auth.resetPassword)

module.exports = router
