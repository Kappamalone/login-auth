require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const http = require('http');

const user = require('./models/userModel');

/*===========SETUP===========*/
const app = express();
const port = 3000;
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());
mongoDBSetup();

const foptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/login',
  method: 'POST',
  headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
  }
};

const tokenOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/token',
  method: 'POST',
  headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
  }
};

/*===========CUSTOM MIDDLEWARE===========*/

//Check if user has credentials to access protected route
function authUser(req,res,next){
  const token = req.cookies.access_token;
  if (token){
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY,(err,user) => {
      //attempt to get access token from refresh token
      if (err){
        console.log('attempting to obtain access token')
        //TODO: if successful access token obtained, then 
        //redirect back to same login to authenticate
        let successfulRefresh = refreshToken(res,req.cookies.refreshToken);
        console.log(req.cookies)

      } else {
        req.userDetails = user;
      next()
      }
    }) 
  } else {
    res.sendStatus(403)
  }
}

//Check if user has admin credentials
function authAdmin(req,res,next){
  const token = req.cookies.access_token;
  if (token){
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY,(err,user) => {
      if (err) return res.sendStatus(403);
      if (user.admin === true){
        next()
      } else {
        res.sendStatus(403)
      }
    })
  } else {
    res.sendStatus(403)
  }
}


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

app.get('/protectedUser',authUser,(req,res) => {
  console.log(req.userDetails)
  res.sendFile(path.join(__dirname,'webpages','protectedUser.html'));
})

app.get('/admin',authAdmin,(req,res) => {
  res.sendFile(path.join(__dirname,'webpages','admin.html'));
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

//Forwards login detais to auth server
app.post('/login',async (req,res) => {
  console.log(req.body)

  //post data to authentication server for tokens
  const freq = http.request(foptions, (authRes) => {
    authRes.setEncoding('utf8');
    authRes.on('data', (chunk) => {

      //response from auth server
      if (!(chunk === 'Forbidden')){
        let tokenData = JSON.parse(chunk)

        //Set cookie data
        res.cookie('access_token',tokenData.access_token,{httpOnly: true})
        res.cookie('refresh_token',tokenData.refresh_token, {httpOnly: true})
        
        //depending on admin privileges, redirect to appropriate pages
        if (jwt.decode(tokenData.refresh_token).admin === true){
          res.redirect('/admin')
        } else {
          res.redirect('/protectedUser')
        }
      } else {
        res.sendStatus(403)
      }
    });
    res.on('error',(e) => {
      console.log('Error', e)
    })
  });

  // write data to request body
  freq.write(JSON.stringify(req.body));
  freq.end();
  
  
})

//Forward refresh token to auth server for new access token
//Implemented in function to be used in middleware
/*
app.post('/token',(req,res) => {
  console.log(req.headers.authorization)
  const freq = http.request(foptions, (authRes) => {
    authRes.setEncoding('utf8');
    authRes.on('data', (chunk) => {
      //response from auth server for access token
      if (!(chunk === 'Forbidden')){
        let tokenData = JSON.parse(chunk)

        res.cookie('refresh_token',tokenData.refresh_token, {httpOnly: true})
        res.sendStatus(200)
    } else {
      res.sendStatus(403)
    }
  });
    authRes.on('error',(e) => {
      console.log('Error', e)
    })
  });

  // write data to request body
  freq.write(JSON.stringify({"refresh_token": req.headers.authorization}));
  freq.end();
})
*/
/*===========MONGO SETUP AND FUNCTIONS===========*/
function mongoDBSetup() {
    let db = `mongodb+srv://Kappamalone:${process.env.MONGOPASS}@kappamalone-cluster.u10jv.mongodb.net/testUsers?retryWrites=true&w=majority`;
  
    mongoose
      .connect(db, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB!'))
      .catch(err => console.log(err));
}

//TODO: Figure out why the request isn't properly being made
function refreshToken(res,refresh_token){
  const freq = http.request(tokenOptions, (authRes) => {
    authRes.setEncoding('utf8');
    authRes.on('data', (chunk) => {
      //response from auth server for access token
      if (!(chunk === 'Forbidden')){
        let tokenData = JSON.parse(chunk)
        console.log('data',tokenData)
        res.cookie('access_token','please change', {httpOnly: true})
    } else {
      console.log('whoops')
    }
  });
    authRes.on('error',(e) => {
      console.log('Error', e)
    })
  });

  // write data to request body
  freq.write(JSON.stringify({"refresh_token": refresh_token}));
  freq.end();
}

app.listen(port,() => {
  console.log('Listening on port ' + port);
})