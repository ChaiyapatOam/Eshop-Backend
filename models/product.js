const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    image:{
        type:String,
        default: "https://www.casio.com/content/dam/casio/product-info/locales/th/th/label-printer/option/product/X/XR/XR1/XR-18FOE/assets/noimage.jpg"
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        
    },
    stock:{
        type:Number,
        min:0
    },
    store: {
        type: String
    },
    active:{
        type:Boolean,
        default: true
    },
})
productSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

productSchema.set('toJSON',{
    virtuals: true
})

exports.Product = mongoose.model('Product',productSchema)