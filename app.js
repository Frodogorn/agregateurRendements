var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const fonctions = require('./bin/fonctions');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { donneesApy } = require('./model/schema');
const { updateApy, calculerScore } = require('./bin/fonctions');
const { setInterval } = require('timers/promises');


var app = express();

mongoose.connect("mongodb+srv://Frodogorn:mdp@basetest.wre6m.mongodb.net/?retryWrites=true&w=majority");

setInterval(fonctions.updateApy, 1000*86400);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/score', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;

