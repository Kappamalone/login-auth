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

const accessExp = '15m';
const refreshExp = '7d';


/*===========POST REQUESTS===========*/
app.post('/login',async (req,res) => {
    console.log('recieved');
    console.log(req.body);
    //checking if the user has the correct credentials
    let admins = require('./adminLogins.json').adminLogins
    let isAdmin = false;
    let status = 403;

    //set admin privileges for certain logins
    for (const admin of admins){
      if (req.body.email === admin.email && req.body.pass === admin.pass){
        isAdmin = true
        status = 200;
      }
    }

    //attempts to find credentials in database
    let doc = await user.findOne({'email': req.body.email}).exec()
    if (doc){
      if (await bcrypt.compare(req.body.pass,doc.password)){
        status = 200;
      }  
    }

    //responding with access and refresh token using email and admin as payloads
    if (status === 200){
      //access token generation
      let access_token = generateToken({email: req.body.email, admin: isAdmin}, process.env.ACCESS_TOKEN_SECRET_KEY,accessExp)

      //refresh token generation
      let refresh_token = generateToken({email: req.body.email, admin: isAdmin}, process.env.REFRESH_TOKEN_SECRET_KEY,refreshExp)

      res.json({access_token: access_token,refresh_token: refresh_token})
    } else {
      res.sendStatus(status)
    }
})

app.post('/token',async (req,res) => {
  console.log(req.body)
  const header = req.body.refresh_token;
  const refresh_token = header && header.split(' ')[1];

  //Checks if refresh_token is valid, and sends an access token from information
  //obtained from the refresh token
  if (refresh_token){
    let user = await jwt.verify(refresh_token,process.env.REFRESH_TOKEN_SECRET_KEY)
    res.json({access_token: generateToken({email:user.email, admin: user.admin},process.env.ACCESS_TOKEN_SECRET_KEY,accessExp)})
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
    return jwt.sign(user, secret, { expiresIn: expTime });
}

app.listen(port,() => {
  console.log('Listening on port ' + port);
})
  