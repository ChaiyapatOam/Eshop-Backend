const {Product} = require('../models/product')
const {Store}  =require('../models/store')
const express = require('express')
const mongoose = require('mongoose')
const { Category } = require('../models/category')
const router  = express.Router()
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}
//File Image
const storage = multer.diskStorage({
    destination: function (req,file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if(isValid) {
            uploadError =  null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req,file, cb) {

        const filename = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${filename}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({storage:storage})

//create new product in store   /addproduct
router.post('/addproduct' ,uploadOptions.single('image'), async (req,res) =>{


    const file = req.file
    if(!file) return res.status(400).send('No Image in the request ')
    const filename = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image : `${basePath}${filename}`,
        price: req.body.price,
        category: req.body.category,
        stock : req.body.stock,
        isFeatured : req.body.isFeatured,
    })
    product = await product.save()
    if(!product)
    return res.status(500).send("The product cannot be create")

    res.send(product)
    // console.log(product._id);
    const s = req.body.store
    const store = await  Store.findOneAndUpdate({store:s},
        { $push: {products: product._id} },
        {new: true}
        )
        if(!store)
        return res.status(404).status.send('The store cannot be created')
    
        // res.send(store)

})

module.exports = router