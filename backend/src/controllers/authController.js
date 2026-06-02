const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generatetoken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: '7d' })
}


//checa que no haya correo igual
const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body
        const userExists = await User.findOne({ email })
        if(userExists) {
            return res.status(409).json({message:'El email ya está registrado'})
        }

        const user = await User.create({name, email, password})
        res.status(201).json({
            token: generatetoken(user._id),
            user
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user || !(await user.comparePassword(password))) {
            return res.status(401).json({message: 'Credenciales inválidas'})
        }

        res.json({
            token: generatetoken(user._id),
            user
        }) 
    } catch (error) {
        next(error)
    }
}

const findMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
        res.json(user)
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login, findMe }
