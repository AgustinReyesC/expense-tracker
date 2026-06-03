const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const {register, login, findMe} = require('../controllers/authController')
const { protect } = require('../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, findMe)
=======
const {register, login, findMe, refresh, logout} = require('../controllers/authController')
const { protect, isAdmin } = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const { registerSchema, loginSchema } = require('../validators/authValidator')

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/me', protect, findMe)
router.post('/refresh', refresh)
router.post('/logout', protect, logout)
>>>>>>> f36fdb24910160c4916a78643c9e0a03db8f21d0

module.exports = router