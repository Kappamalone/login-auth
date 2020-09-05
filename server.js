require('dotenv').config()
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const user = require('./models/userModel')

/*===========SETUP===========*/
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.json());
mongoDBSetup()

/*
exampleUser = new user({
  username: 'test@123',
  password: '123'
})

exampleUser
  .save()
  .then(item => console.log(item))
  .catch(err => console.log(err))
*/


/*===========ROUTING===========*/
app.get('/',(req,res) => {
  res.redirect(307,'/register')
})

app.get('/register',(req,res) => {
  res.sendFile(path.join(__dirname,'webpages','register.html'))
})

app.get('/login',(req,res) => {
  res.sendFile(path.join(__dirname,'webpages','login.html'))
})

/*===========POST REQUESTS===========*/
app.post('/signUp',(req,res) => {
  //Check if email exists in database, and add user to it
  console.log(req.body)
})

/*===========MONGO SETUP===========*/
function mongoDBSetup() {
    let db = `mongodb+srv://Kappamalone:${process.env.MONGOPASS}@kappamalone-cluster.u10jv.mongodb.net/users?retryWrites=true&w=majority`;
  
    mongoose
      .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB!'))
      .catch(err => console.log(err));
}

app.listen(port,() => {
  console.log('Listening on port ' + port)
})