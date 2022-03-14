const expressJwt = require('express-jwt')

function  authJwt() {
    const secret = process.env.secret
    return expressJwt({
        secret,
        algorithms:['HS256'],
        isRevoked: isRevoked
    }).unless({
        path:[
            {url: /\/public\/uploads(.*)/, methods:['GET','OPTIONS']},
            {url: /\/api\/v1\/product(.*)/, methods:['GET','PUT','OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, methods:['GET','DELETE','OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods:['GET','OPTIONS']},
            {url: /\/api\/v1\/store(.*)/, methods:['GET','POST','PUT','OPTIONS']},
            {url: /\/api\/v1\/addproduct(.*)/, methods:['GET','POST','PUT','OPTIONS']},
            {url: /\/api\/v1\/orders(.*)/, methods:['GET','POST','PUT','OPTIONS']},
            '/api/v1/users/login',
            '/api/v1/users/resgister',
        ]
    })
}

async function isRevoked(req,payload, done) {
    if(!payload.isAdmin){
        done(null, true)
    }

    done()
}

module.exports = authJwt