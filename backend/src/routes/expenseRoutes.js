const express = require('express')
const router = express.Router()
const { getExpenses, createExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController')
const { protect, isAdmin } = require('../middlewares/auth')
const upload = require('../middlewares/multer')
const validate = require('../middlewares/validate')
const {createExpenseSchema, updateExpenseSchema} = require('../validators/expenseValidator')

router.use(protect)

router.get('/summary', getSummary) 
router.get('/', getExpenses)
router.post('/', upload.single('receipt'), validate(createExpenseSchema), createExpense)
router.put('/:id', upload.single('receipt'), validate(updateExpenseSchema), updateExpense)
router.delete('/:id', deleteExpense)

//expenses para administrador (todos)
router.get('/admin/all', isAdmin, getExpenses)

module.exports = router