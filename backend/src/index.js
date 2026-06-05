const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const errorHandler = require('./middlewares/errorHandler')

dotenv.config()
connectDB()

const app = express()

//app.use(cors())
//NAVEGADORES
app.use(cors({
  origin: ['http://localhost:3000', 'http://193.122.171.45:3000'],
  credentials: true
}))
app.use(express.json())

//app.use('/uploads', express.static('uploads'))
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use(errorHandler)

app.get('/', (req, res) => {
    res.json({message: 'API funcionando'})
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})