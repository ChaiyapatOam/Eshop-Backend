const {Product} = require('../models/product')
const {Store} = require('../models/store')
const { Category } = require('../models/category')
const express = require('express')
const mongoose = require('mongoose')

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
/*
//Get All Product
router.get('/', async (req,res) =>{
    let filter = {}
    if(req.query.categories)
    {
        filter = {
            category:req.query.categories.split(',')
        }
    }
    const productList = await Product.find(filter).populate('category')
    res.send(productList)
})
//get by id
router.get('/:id', async (req,res) =>{
    const product = await Product.findById(req.params.id).populate('category')

    if(!product)
        res.status(500).json({message:"The product with the givern id was not found"})
    
    res.status(200).send(product)
})
// #################### Not Use  => Use add_update_product #############################
router.post('/' ,uploadOptions.single('image'), async (req,res) =>{
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

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
    return res.status(500).send("The product cannot be creat")

    res.send(product)
    console.log(product._id);

}) */
//Delete product  from Array in {Store}
router.put('/delete/:id',async (req,res) =>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID')
    }
    const product = await Store.findOneAndUpdate(
        // req.params.id,
        {
            store: req.body.store,
        },{
            $pull : {products:req.params.id}
        }
        )
        if(!product)
        return res.status(404).send('The product cannot be delete')
    
        res.status(200)
})
router.put('/:id',async (req,res) =>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.body.product)
    if(!product) return res.status(400).send('Invalid product')

    const file = req.file
    let imagepath
    if(file) {
        const filename = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath: `${basePath}${filename}`
    } else {
        imagepath = product.image
    }

    const updateproduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image : imagepath,
            images: req.body.images,
            price: req.body.price,
            category: req.body.category,
            stock : req.body.stock,
            isFeatured : req.body.isFeatured,
        },
        {new:true}
        )
        if(!updateproduct)
        return res.status(404).status.send('The product cannot be created')
    
        res.send(updateproduct)
})

//Delete Product
router.delete('/:id', async(req,res) => {
    Product.findByIdAndRemove(req.params.id) .then(product =>{
        if(product) {
            return res.status(200).json({success:true,message:"The product is deleted"})
        } else {
            return res.status(404).json({success:false,message:"product not found"})
        }
    }).catch((err)=>{
        return res.status(400).json({success:false,err: err})
    })
})


router.get('/get/count', async (req,res) => {
    const productCount = await Product.countDocuments()

    if(!productCount){
        res.status(500).json({success:false})
    }
    res.send({
        productCount: productCount})
})
// isFeatured
router.get('/get/featured', async (req,res) => {
    const product = await Product.find({isFeatured: true}) // active : true
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})
// Count isFeatured
router.get('/get/featured/:count', async (req,res) => {
    const count = req.params.count ? req.params.count:0
    const product = await Product.find({isFeatured: true}).limit(+count)
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})

router.put('/gallery/:id',uploadOptions.array('images',10), async (req,res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID')
    }
    const files = req.files
    let imagespath = []
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`
    if(files) {
        files.map(file =>{
            imagespath.push(`${basePath}${file.filename}`)
        })
    }
    
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagespath
        },
        {new:true}
    )
    if(!product) {
        return res.status(500).send('The product cannot be updated!')
    }
    res.send(product)
})
//Get All Product /store
router.get('/get/:store',  (req,res) =>{
    const s  = req.params.store
    console.log(s);
    Product.find({store: s},(error,products) => {
        if(error) console.log(error);
        res.json(products)
        //res.status(200).send(products)
    })
})
// get 
router.get('/get/pro', async (req,res) => {
    const product = await Product.find({name: "product 1"})
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product)
})

module.exports = router