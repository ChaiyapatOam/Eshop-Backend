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
        required:true
    },
    images:[{
        type:String
    }],
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
    isFeatured:{
        type:Boolean,
        default:false
    },
})
productSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

productSchema.set('toJSON',{
    virtuals: true
})

exports.Product = mongoose.model('Product',productSchema)