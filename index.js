const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const User = require('./model/user');
const session = require('express-session')
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://127.0.0.1:27017/sing_in')
    .then(()=>{console.log('DB connected!!')})
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))  

app.get('/', (req,res)=>{
    if(!req.session.user_id){
        return res.redirect('/signin');
    }
    res.render('home');
})

// to be on singin page 
app.get('/signin', (req,res)=>{
    res.render('signin');
})

// to go to the signup page
app.get('/signup', (req,res)=>{
    res.render('signup');
})

app.post('/signup', async(req,res)=>{
    const {username, email, password} = req.body;
    
    const user = await User.findOne({username, email});
    
    if(user){
        return res.send("User already exist, try different!");
    }
    const hash = await bcrypt.hash(password, 10);
    await User.create({username, email, password:hash});
    res.redirect('/signin');
})

app.post('/signin', async(req,res)=>{
    const {username, password} = req.body;
    // console.log(username); 
    const user = await User.findOne({username});
    // console.log(user);
    if(user){
        const match = await bcrypt.compare(password, user.password);

    if(match) {
        console.log(user);
        req.session.user_id = user._id;
        return res.render('home', {user});
    }
        return res.send('Invalid credantial');

    }
        return res.send('User not found');
        
})

app.get('/signout', (req,res)=>{
    req.session.destroy();
    res.redirect('/signin');
})

app.listen(5555, ()=>{
    console.log('server is up at port', 5555);
})