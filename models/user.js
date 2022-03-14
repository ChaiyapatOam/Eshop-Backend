const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        default:''
    },
    store: {
        type: String
    }

})
userSchema.virtual('id').get(function() {
    return this._id.toHexString()
})

userSchema.set('toJSON',{
    virtuals: true
})

exports.User = mongoose.model('User',userSchema)
// exports.userSchema = userSchema