const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')
<<<<<<< HEAD
=======
const expenseRoutes = require('./routes/expenseRoutes')
const errorHandler = require('./middlewares/errorHandler')
>>>>>>> f36fdb24910160c4916a78643c9e0a03db8f21d0

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

<<<<<<< HEAD
app.use('/api/auth', authRoutes)
=======
//app.use('/uploads', express.static('uploads'))
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use(errorHandler)
>>>>>>> f36fdb24910160c4916a78643c9e0a03db8f21d0

app.get('/', (req, res) => {
    res.json({message: 'API funcionando'})
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})