const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
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
        default: 'รอจัดส่ง'
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
    },
    tracking:{
        type : String,
        default: ''
    }
})
orderSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

orderSchema.set('toJSON',{
    virtuals: true
})

exports.Order = mongoose.model('Order', orderSchema)