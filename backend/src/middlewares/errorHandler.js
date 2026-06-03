const errorHandler = (err, req, res, next) => {
    console.error(err.stack)

    if(err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(422).json({message: messages.join(', ')})
    }

    if(err.code === 11000) {
        return res.status().json({message: 'El email ya está registrado'})
    }

    if(err.name === 'CastError') {
        return res.status(400).json({message: 'ID inválido'})
    }

    res.status(err.status || 500).json({message: err.message || 'Error interno del servidor'})
}

module.exports = errorHandler