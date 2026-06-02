const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    amount: {
        type: Number, 
        required: [true, 'El monto es obligatorio'],
        min: [0, 'El monto no puede ser negativo']
    },
    category: {
        type: String,
        enum: ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Otros'],
        required: [true, 'La categoría es obligatoria']
    },
    description: {
        type: String,
        trim: true,
        minlength: [3, 'La descripción debe tener al menos 3 caracteres']
    },
    //fecha actual definida como básico 
    date: {
        type: Date,
        default: Date.now
    },
    //campo de subida de archivos
    receipt: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {timestamps: true})

expenseSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`
})

module.exports = mongoose.model('Expense', expenseSchema)