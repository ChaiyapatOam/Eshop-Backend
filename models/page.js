const mongoose = require('mongoose')
const pageSchema = mongoose.Schema({
    name:{
        type:String,
    },
    path: {
        type: String,
    },
    icon: {
        type: String,
    },

})
exports.Page = mongoose.model('Page',pageSchema)