const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
    orderItems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'OrderItem',
        required: true
    }],
    address:{
        type: String,
        required: true
    },
    zip:{
        type: String,
    
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
        default: 'Pending'
    },
    TotalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    DateOrder: {
        type: Date,
        default: Date.now
    },
    store:{
        type:String
    },
    cart : {
        type: String
    },
    total: {
        type: Number
    }
})
orderSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

orderSchema.set('toJSON',{
    virtuals: true
})

exports.Order = mongoose.model('Order', orderSchema)