const mongoose = require('mongoose')
const bcrypt = require ('bcryptjs')

// definición del esquema usuario
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [3, 'El nombre debe tener al menos 3 caracteres de longitud'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
    },
    //definimos rol de administrador o usuario común
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    //para el refresco del token
    refreshToken: {
        type: String,
        default: null
    }
}, {timestamps: true})





userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}


//protege el hash de la respuesta (nunca sale en el json)
//sobreescritura de método
userSchema.methods.toJSON = function() {
    const user = this.toObject()
    delete user.password
    delete user.refreshToken
    return user
}







//modelos virtuales
userSchema.virtual('info').get(function() {
    return `${this.name} - ${this.role}`
})

userSchema.index({email: 1, role: 1})





module.exports = mongoose.model('User', userSchema)