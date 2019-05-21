const CLIENT_ID = '247899695031-i2lrgqjm8hoo9e0l650d68e2187fjt7v.apps.googleusercontent.com';
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
const userModel = require('../models/user');

const validateToken = async (token) => {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
}

const authenticate = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        throw "No authorization token";
    }
    validateToken(String(authorization).toString().split(" ", 2)[1])
        .then(payload => {
            userId = payload['sub'];
            return userModel.findOne({ googleId: userId }).exec()
        })
        .then(result => {
            if (!result) {
                throw "User is not registerd";
            }
            req = { ...req, user: { userId: payload['sub'], userType: result.userType } };
            next();
        })
        .catch(error => {
            console.log(error);
            res.status(403).send({ err: error });

        });

}
const authenticateToken = (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
        
        validateToken(String(authorization).toString().split(" ", 2)[1])
            .then(payload => {
                req['payload'] = payload ;
                googleId = payload['sub'];
            
                return userModel.findOne({ googleId: googleId }).exec()

            })
            .then(result => {
                if (result) {
                    req['user']= result ;
                }else{
                    userModel.findOneAndUpdate({email:req.payload.email,verified:false},{
                        googleId: context.payload.sub,
                        email: context.payload.email,
                        name: context.payload.name,
                        picture: context.payload.picture,
                        userType: 'CCU',
                    }).exec()
                    .then(result=>{
                        userModel.findById(result._id)
                        .exec()
                    })
                    .then(result=>{
                        req['user']= result ;
                    })
                    .catch(error=>{
                        console.log(error);
                    })
                    
                }
               
                next();
            })
            .catch(err => {
                console.log(err);
                next();
            })

    } else {
        next();
    }

}

module.exports = { validateToken, authenticate, authenticateToken };
