const mongoose = require('mongoose')
const storeSchema = mongoose.Schema({
    active:{
        type: Boolean,
        default: true
    },
    store:{
        type: String,
        // required: true
    },
    email:{
        type: String
    },
    passwordHash: {
        type: String,
        // required: true
    },
    address:{
        type: String
    },
    phone:{
        type: String
    },
    categories:[{
        type:String,
        default:["ทั่วไป","เครื่องดื่ม","ขนม"]
    }],
    products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
})
storeSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

storeSchema.set('toJSON',{
    virtuals: true
})

exports.Store = mongoose.model('Store', storeSchema)