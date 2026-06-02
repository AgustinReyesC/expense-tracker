const express = require('express')
const router = express.Router()
const {register, login, findMe} = require('../controllers/authController')
const { protect, isAdmin } = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { registerSchema, loginSchema } = require('../validators/authValidator')

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/me', protect, findMe)

module.exports = router