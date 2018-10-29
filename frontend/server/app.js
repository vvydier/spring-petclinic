var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var index = require('./routes/index');
var config = require('./routes/config');
const settings = require('./config')
var apm = require('elastic-apm-node')
var app = express();
var http = require('http');
var router = express.Router();
var proxy = require('express-http-proxy');
//now we should configure the API to use bodyParser and look for JSON data in the body
app.use(logger('dev'));
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index)
app.use('/config', config)

app.use('/api/find_address', proxy(settings.address_server, {
    preserveHostHdr: true,
    proxyReqPathResolver: function (req) {
      apm.setTransactionName('/api/find_address')
      return '/api/find_address'
    }
}))

//sends /api/<endpoint> to <api_prefix>/<endpoint>
app.use('/api', proxy(settings.api_server, {
    preserveHostHdr: true,
    proxyReqPathResolver: function (req) {
      apm.setTransactionName('/api'+req.url)
      return settings.api_prefix+req.url
    }
}))



app.get('*', function(req,res) {
    res.sendFile(path.join(__dirname+'/public/index.html'));
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (err.name === 'JsonSchemaValidation') {
    res.status(422);
    let responseData = {
       statusText: 'Bad Request',
       jsonSchemaValidation: true,
       validations: err.validations  // All of your validation information
    };
    res.json(responseData);
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(500).json({
          message: err.message,
          error: err
      });
  }

});

module.exports = app;
