const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const dotenv = require('dotenv')

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: 'API funcionando'})
})

const PORT = process.env.PORT || 5000



app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})