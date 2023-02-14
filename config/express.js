import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import passport from 'passport';
import busboy from 'express-busboy';
import path from 'path';
import winstonInstance from './winston';
import routes from '../server/routes/index.route';
import config from './config';
import APIError from '../server/helpers/APIError';

const app = express();

if (config.config.env === 'development') {
  app.use(logger('dev'));
}

app.use(passport.initialize());
app.use(passport.session());
require('./passport')(passport);
// add this line

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors({
  origin: true,
  credentials: true
}));

busboy.extend(app, {
  upload: true,
  path: './uploads',
  allowedPath: /./,
  mimeTypeLimit: ['image/jpeg', 'image/png', 'image/jpg']
});
// enable detailed API logging in dev env
if (config.config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}

// const isAuthenticated = passport.authenticate('jwt', { session: false });

// mount all routes on /api path

app.use('/api', routes);
console.log('callinf');
console.log(path.join(__dirname, '/../../uploads'));

app.use('/uploads', express.static(path.join(__dirname, '/../../uploads')));

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    const error = new APIError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, true);
    return next(apiError);
  } else {
    console.log(err);
    return next(err);
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND);
  return next(err);
});

// log error in winston transports except when executing test suite
if (config.config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance
  }));
}


// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.log("hhh")
  res.setHeader('statusCode', err.status);
  res.setHeader('message', err.isPublic ? String(err.message) : String(httpStatus[err.status]));
  
    let errMessage = (((err.message.message) == undefined) ? (err.message) : (err.message.message) )
    err.message.otp ? errMessage = err.message : -1;
    console.log((err.message.message))
    console.log((err.message))
    res.status(err.status).send({ message: err.isPublic ? errMessage : String(httpStatus[err.status])
  });
});

export default app;
