const express = require('express')
const router = express.Router()
const { getExpenses, createExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController')
const { protect } = require('../middlewares/auth')
const upload = require('../middlewares/multer')

router.use(protect)

router.get('/summary', getSummary) 
router.get('/', getExpenses)
router.post('/', upload.single('receipt'), createExpense)
router.put('/:id', upload.single('receipt'), updateExpense)
router.delete('/:id', deleteExpense)

module.exports = router