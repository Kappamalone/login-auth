require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const http = require('http');
const user = require('./models/userModel');

/*===========SETUP===========*/
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.json());
mongoDBSetup();

/*===========ROUTING===========*/
app.get('/',(req,res) => {
  res.redirect(307,'/register');
})

app.get('/register',(req,res) => {
  res.sendFile(path.join(__dirname,'webpages','register.html'));
})

app.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname,'webpages','login.html'));
})

/*===========POST REQUESTS===========*/

/* Signing up involves checking if an email already exists in the db,
if not then hash their passwords and store their data in the db */
app.post('/signUp',async (req,res) => {
  //Check if email exists in database, and add user to it
  let email = req.body.email
  let hashedPass = await bcrypt.hash(req.body.pass,10)
  let emailExists = await user.exists({email: email})

  if (emailExists){
    res.sendStatus(400)
  } else {
    //upload user data to mongoDB as email does not exist
    uploadData = new user({
      email: email,
      password: hashedPass
    })
    
    uploadData
      .save()
      .then(item => console.log(item))
      .catch(err => console.log(err))
    
    res.redirect('/login')
  }
})

app.post('/login',async (req,res) => {
  //post data to authentication server for tokens
  
})

/*===========MONGO SETUP AND FUNCTIONS===========*/
function mongoDBSetup() {
    let db = `mongodb+srv://Kappamalone:${process.env.MONGOPASS}@kappamalone-cluster.u10jv.mongodb.net/testUsers?retryWrites=true&w=majority`;
  
    mongoose
      .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB!'))
      .catch(err => console.log(err));
}

app.listen(port,() => {
  console.log('Listening on port ' + port);
})