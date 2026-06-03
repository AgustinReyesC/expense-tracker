const Joi = require('joi')

const registerSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.min': 'JoiFW: El nombre debe tener al menos 3 caracteres',
        'any.required': 'JoiFW: El nombre es obligatorio'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'JoiFW: El email no es válido',
        'any.required': 'JoiFW: El email es obligatorio'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'JoiFW: La contraseña debe tener al menos 8 caracteres',
        'any.required': 'JoiFW: La contraseña es obligatoria'
    })
})

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'JoiFW: El email no es válido',
        'any.required': 'JoiFW: El email es obligatorio'
    }),
    password: Joi.string().required().messages({
        'any.required': 'JoiFW: La contraseña es obligatoria'
    })
})

module.exports = { registerSchema, loginSchema }