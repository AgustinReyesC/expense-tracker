const User = require('../models/User')
const jwt = require('jsonwebtoken')

const generateTokens = (id) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '15m'})
    const refreshToken = jwt.sign({id}, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
    return { accessToken, refreshToken }
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
        const { accessToken, refreshToken } = generateTokens(user._id)
        
        user.refreshToken = refreshToken
        await user.save()
        res.status(201).json({accessToken, refreshToken, user})
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

        const {accessToken, refreshToken} = generateTokens(user._id)
        user.refreshToken = refreshToken
        await(user.save())
        res.json({accessToken, refreshToken, user})
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






//para refreshToken
const refresh = async(req, res, next) => {
    try {
        const { refreshToken } = req.body
        if( !refreshToken ) { 
            return res.status(401).json({message: 'Refresh token requerido'})
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)
        if(!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Refresh token inválido'})
        }
        const { accessToken, refreshToken: newRefreshToken} = generateTokens(user._id)
        user.refreshToken = newRefreshToken
        await user.save()
        res.json({accessToken, refreshToken: newRefreshToken})
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        user.refreshToken = null
        await user.save()
        res.json({message: 'Sesión cerrada'})
    } catch(error) {
        next(error)
    }
}

module.exports = { register, login, findMe, refresh, logout }
