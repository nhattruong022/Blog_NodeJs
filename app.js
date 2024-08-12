require('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOveride = require('method-override');
const app = express();
const nodeMailer = require('nodemailer');
const port = 8080 || process.env.PORT;
const connectDB = require('./server/config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const MongoStore = require('connect-mongo');

app.use(express.static('public'));
app.use(expressLayout);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());

// app.use(session({
//   secret:'keyboard cat',
//   resave:false,
//   saveUninitialized:true
// }));

app.use(methodOveride('_method'));

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');



app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));



app.listen(port, () => {
  console.log(`Server dang chay voi port ${port}`);
});