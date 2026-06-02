const Expense = require('../models/Expense')
const { get } = require('../routes/authRoutes')
const fs = require ('fs') //para borrar archivos huerfanos

const getExpenses = async (req, res, next) => {
    try {
        const {category, startDate, endDate, page = 1, limit = 10 } = req.query
        const filter = { user: req.user._id }

        if(category) filter.category = category
        if(startDate || endDate) {
            filter.date = {}
            if(startDate) filter.date.$gte = new Date(startDate)
            if(endDate) filter.date.$lte = new Date(endDate) 
        }

        const total = await Expense.countDocuments(filter)
        const expenses = await Expense.find(filter)
        .sort({date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email')

        res.json( {
            expenses,
            total,
            age: Number(page),
            pages: Math.ceil(total / limit)
        })
    } catch(error) {
        next(error)
    }
}

const createExpense = async (req, res, body) => {
    try {
        const {amount, category, description, date } = req.body
        const expense = await Expense.create({
            amount,
            category,
            description,
            date,
            receipt: req.file ? req.file.path : null,
            user: req.user._id
        })
        res.status(201).json(expense)
    } catch(error) {
        next(error)
    }
}

const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id)
        //el gasto no existe
        if(!expense) return res.status(404).json({message: 'Gasto no encontrado'})
        //el gasto no es del usuario
        if(expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'Sin autorización'})
        }
        const {amount, category, description, date } = req.body
        if(amount !== undefined) expense.amount = amount
        if(category !== undefined) expense.category = category
        if(description !== undefined) expense.description = description
        if(date !== undefined) expense.date = date
        if(req.file) expense.receipt = req.file.path
        await expense.save()
        res.json(expense)
    } catch (error) {
        next(error)
    }
}

const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id)
        if(!expense) return res.status(404).json({message: 'Gasto no encontrado'})
        if(expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'Sin autorización'})
        }

        //borrar archivo
        if(expense.receipt) {
            fs.unlink(expense.receipt, (err) => {
                if(err) console.error('Error al borrar archivo:', err)
            })
        }

        await expense.deleteOne()
        res.json({message: 'Gasto eliminado'})
    } catch(error) {
        next(error)
    }
}

const getSummary = async (req, res, next) => {
    try {
        const summary = await Expense.aggregate([
            {$match: { user: req.user._id }},
            {$group: { _id: '$category', total: {$sum: '$amount'}}},
            {$sort: { total: -1}}
        ])
        res.json(summary)
    }catch (error) {
        next(error)
    }
}

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getSummary}