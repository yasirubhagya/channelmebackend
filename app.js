const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors =require('cors');
const app = express();
const port = process.env.PORT || 3000;
const graphqlSchema = require('./graphql/schema/schema');
const {authenticateToken} =require('./auth/authenticate');
app.use(cors());
app.use(bodyParser.json());

 app.use('/graphql',authenticateToken,graphqlHttp({
    schema:graphqlSchema,
    graphiql: true,
}));

mongoose
    .connect(`mongodb+srv://channelmeAdmin:admin123@cluster0-ohpij.gcp.mongodb.net/channelme?retryWrites=true`,{useNewUrlParser:true})
    .then(() => {
        console.log(port);
        app.listen(port);
    
    })
    .catch(error => {
        console.log(error);
    });


