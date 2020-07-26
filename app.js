const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const connectDB = require('./config/db');


dotenv.config({path: './config/config.env'});
require('./config/passport')(passport);
connectDB();
const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
const { formatDate } = require('./helpers/hbs');
app.engine('.hbs', exphbs({helpers: {
    formatDate
}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');
//Sessions Middleware
app.use(session({
    secret: 'This is a super secret key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));