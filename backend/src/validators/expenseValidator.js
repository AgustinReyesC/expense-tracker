const Joi = require('joi')

const createExpenseSchema = Joi.object({
    amount: Joi.number().min(0).required().messages({
        'number.min': 'JoiFW: El monto no puede ser negativo',
        'any.required': 'JoiFW: El monto es obligatorio'
    }),
    category: Joi.string().valid('Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Otros' ).required().messages({
        'any.only': 'JoiFW: Cateogría inválida',
        'any.required': 'JoiFW: La categoría es obligatoria'
    }),
    description: Joi.string().min(3).messages({
        'string.min': 'JoiFW: La descripción debe tener al menos 3 caracteres'
    }).optional(),
    date: Joi.date().optional()
})


const updateExpenseSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  category: Joi.string().valid('Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Otros').optional(),
  description: Joi.string().min(3).optional(),
  date: Joi.date().optional()
})

module.exports = { createExpenseSchema, updateExpenseSchema }