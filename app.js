const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan  = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')

app.use(cors())
app.options('*',cors())
//middleware
const api = process.env.API_URL
const path = require('path')
app.use('/public/uploads', express.static(__dirname+'/public/uploads'))
//Router D:\Project\EShop\backend\public\uploads\wp8225565.jpg-1641227450248.jpeg
const productsRouter = require('./routers/products')
const categoryRouter = require('./routers/categories')
const userRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')
const storeRouter = require('./routers/stores')
const addProductRouter = require('./routers/add_update_product')
const pageRouter = require('./routers/pages')
//Helper
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(bodyParser.json())
app.use(morgan('tiny')) //HTTP status
// app.use(authJwt())
app.use(errorHandler)


app.use(api+'/products',productsRouter)
app.use(api+'/category',categoryRouter)
app.use(api+'/users',userRouter)
app.use(api+'/orders',ordersRouter)
app.use(api+'/store',storeRouter)
app.use(api+'/pages',pageRouter)
app.use(api+ '/' ,addProductRouter)

mongoose.connect('mongodb://localhost/VUECRUD',{
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
.then(()=> {
    console.log("Database connected!");
})
.catch((err)=>{
    console.log(err);
})
const jwt_decode = require('jwt-decode')
// import jwt_decode from 'jwt-decode';

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MWY1ZjllOTczM2VlZjQ0ODI3NjkyYzAiLCJ1c2VyU3RvcmUiOiJLSyIsImlhdCI6MTY0MzUxMDU1NX0.WS7nbwcQ7j8JLtSaQy7_080vnausHxpGb48bDu2VFDk';

var decoded = jwt_decode(token);
// console.log(decoded);

const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    // console.log(api);
    console.log("server running at http://localhost:3000");
})