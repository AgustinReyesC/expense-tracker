const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({message: 'No autorizado, falta token'})
        }
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        if(!req.user) {
            return res.status(401).json({message: 'Usuario no encontrado'})
        }
        next()
    } catch (error) {
        res.status(401).json({ message: 'token inválido'})
    }
}

const isAdmin = (req, res, next) => {
    if(req.usser && req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({mensaje: 'Acceso solo para administradores'})
    }
}

module.exports = { protect, isAdmin}