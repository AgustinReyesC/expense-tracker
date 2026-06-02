const express = require('express')
const mongoose = require ('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: 'API funcionando'})
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI


mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB conectado')
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en puerto ${PORT}`)
        })
    })
    .catch((err) => {
        console.log('Error conectando a MongoDB:', err.message)
        process.exit(1)
    })