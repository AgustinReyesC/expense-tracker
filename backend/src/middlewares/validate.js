const validate = (schema) => {
    return (req, res, next) => {
        const {error} = schema.validate(req.body, { abortEarly: false})
        if(error) {
            const messages = error.details.map(d => d.message).join(', ')
            return res.status(422).json({message: messages})
        }
        next()
    }
}

module.exports = validate