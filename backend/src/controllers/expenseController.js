const Expense = require('../models/Expense')
const fs = require ('fs') //para borrar archivos huerfanos
const cloudinary = require('../config/cloudinary') //para cloudinary 


//meterle crud 
const getExpenses = async (req, res, next) => {
    try {
        const {category, startDate, endDate, page = 1, limit = 10, search, sort } = req.query
        //admin puede ver todo
        const filter = req.user.role == 'admin' ? {} : { user: req.user._id }

        if(category) filter.category = category

        //busca por descripción
        if(search) filter.description = {$regex: search, $options: 'i'}

        if(startDate || endDate) {
            filter.date = {}
            if(startDate) filter.date.$gte = new Date(startDate)
            if(endDate) filter.date.$lte = new Date(endDate) 
        }


        //opciones para ordenar la búsqueda
        const sortOptions = {
            amount: { amount: -1 },
            date: { date: -1 },
            category: {category: 1}
        }
        const sortBy = sortOptions[sort] || {date: -1}







        const total = await Expense.countDocuments(filter)
        const expenses = await Expense.find(filter)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'name email')

        res.json( {
            expenses,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        })
    } catch(error) {
        next(error)
    }
}

const createExpense = async (req, res, next) => {
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
        if(req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
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
        if(req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'Sin autorización'})
        }

        //borrar archivo
        // if(expense.receipt) {
        //     fs.unlink(expense.receipt, (err) => {
        //         if(err) console.error('Error al borrar archivo:', err)
        //     })
        // }

        //borrar archivo cloudinary
        if(expense.receipt) {
            const publicId = expense.receipt.split('/').slice(-1)[0].split('.')[0]
            await cloudinary.uploader.destroy(`expense-tracker/${publicId}`)
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