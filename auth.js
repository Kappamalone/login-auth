require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const user = require('./models/userModel');

/*===========SETUP===========*/
const app = express();
const port = 4000;
app.use(express.static('public'));
app.use(bodyParser.json());
mongoDBSetup();


/*===========POST REQUESTS===========*/
app.post('/login',async (req,res) => {
    console.log('recieved');
    console.log(req.body);
    //checking if the user has the correct credentials
    let admins = require('./adminLogins.json').adminLogins
    console.log(admins)
    let isAdmin = false;
    let status = 403;

    //set admin privileges for certain logins
    for (const admin of admins){
      if (req.body.email === admin.email && req.body.pass === admin.pass){
        isAdmin = true
      }
    }

    //attempts to find credentials in database
    let doc = await user.findOne({'email': req.body.email}).exec()
    if (doc){
      if (await bcrypt.compare(req.body.pass,doc.password)){
        status = 200;
      }  
    }

    //user is authenticated: therefore respond authenticated response
    if (status === 200) {
      res.json({admin: isAdmin})
    } else {
      res.sendStatus(status)
    }
})

/*===========MONGO SETUP AND FUNCTIONS===========*/
function mongoDBSetup() {
    let db = `mongodb+srv://Kappamalone:${process.env.MONGOPASS}@kappamalone-cluster.u10jv.mongodb.net/testUsers?retryWrites=true&w=majority`;
  
    mongoose
      .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB!'))
      .catch(err => console.log(err));
}

function generateToken(user,secret,expTime) {
    return jwt.sign(user, secret, { expiresIn: expTime })
}

app.listen(port,() => {
  console.log('Listening on port ' + port);
})
  