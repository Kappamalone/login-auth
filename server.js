const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());


//use config package to retrieve env vars
function mongoDBSetup() {
    const pass = 'something'
    let db = `mongodb+srv://Kappamalone:${pass}@kappamalone-cluster.u10jv.mongodb.net/diff?retryWrites=true&w=majority`;
  
    mongoose
      .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB!'))
      .catch(err => console.log(err));
}