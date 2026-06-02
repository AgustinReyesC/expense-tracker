const express = require('express')
const router = express.Router()
const {register, login, findMe} = require('../controllers/authController')
const { protect } = require('../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, findMe)

module.exports = router