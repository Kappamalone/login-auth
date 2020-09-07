require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./models/userModel');

/*===========SETUP===========*/
const app = express();
const port = 4000;
app.use(express.static('public'));
app.use(bodyParser.json());
mongoDBSetup();


/*===========POST REQUESTS===========*/
app.post('/login',async (req,res) => {
    console.log('recieved')
    console.log(req.body)
    //checking if the user has the correct credentials
    let status = 403
    let doc = await user.findOne({'email': req.body.email}).exec()
    if (await bcrypt.compare(req.body.pass,doc.password)){
      status = 200
    }

    if (status === 200){

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
  