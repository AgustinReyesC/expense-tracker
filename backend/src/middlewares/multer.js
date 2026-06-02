const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const path = require('path') 

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'expense-tracker',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        resource_type: 'auto'
    }
})


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/')
//     },
//     filename: (req, file, cb) => {
//         const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
//         cb(null, `${unique}${path.extname(file.originalname)}`)
//     }
// })

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/
    const ext = allowed.test(path.extname(file.originalname).toLowerCase())
    const mime = allowed.test(file.mimetype)
    if(ext){  // && mime) {
        cb(null, true)
    } else {
        cb(new error('Solo se permiten imagenes y PDFs'))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 * 1024 * 1024} //5mb
})

module.exports = upload