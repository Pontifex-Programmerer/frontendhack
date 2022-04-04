const express = require('express');
const bodyparser = require('body-parser');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const mongoose = require('mongoose');
const { redirect } = require('express/lib/response');

//config variables
const port = 3000;

const app = express();

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});

app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

app.use(session({
    secret:'my dirty little secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = new User({username, password});
    req.login(user, error => {
        if(error){
            res.render('error.ejs', {message: 'HAHA! You are not even a real user!'});
        } else {
            passport.authenticate('local')(req, res, _=> {
                res.redirect('/secretpage');
            })
        }
    })

});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.register({username}, password, (error, user) => {
        if(error){
            res.render('error.ejs', {
                message: 'an error occurred, either because some noob programmer was at work, or more likely because this site was hacked!'
            });
        } else {
            passport.authenticate('local')(req, res, _=> {
                res.redirect('/secretpage');
            });
        }
    });  
});

app.get('/secretpage', (req, res) => {
    if(req.isAuthenticated()){
        res.render('secretpage.ejs', {message: "Great success. You are awesome!"});
    } else {
        res.redirect('/*');
    }
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.use('*', (req, res) => {
    res.status(404).render('error.ejs', {
        message: 'You dont belong here. Go home!'
    });
});

app.listen(port, _=>{
    console.log(`listening on ${port}`);
});