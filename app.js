if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const User = require('./models/user')
const ExpressError = require('./utils/ExpressError');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// const { func } = require('joi');
// const dbUrl = process.env.DB_URL; //in deploying mode
const dbUrl = 'mongodb://localhost:27017/yelp-camp'; //in development mode


mongoose.connect(dbUrl)
    .then(() => {
        console.log('Connection opened');
    })
    .catch(err => {
        console.log(err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    mongoSanitize({
        allowDots: true,
        replaceWith: '_',
    }),
);

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, //seconds
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', function (e) {
    console.log('session store error')
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thatshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 //miliseconds

    }
}
app.use(session(sessionConfig));
app.use(flash())
app.use(helmet());


const scriptSrcUrls = [
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddrvtm3r1/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('PAGE NOT FOUND', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err });
});



app.listen(8080, () => {
    console.log("Serving on port 8080");
});