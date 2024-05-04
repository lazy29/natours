const path = require('node:path');

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Template Engine Setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SERVING STATIC FILES MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE - ORDER MATTERS (order in which code written first come first serve basis)
// app.use(middlewareFn) :- app.use() - to use middleware || middlewareFn - function for middleware

// Set security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': [
          "'self'",
          "'unsafe-eval'",
          'https://unpkg.com/',
          'https://js.stripe.com/',
        ],
        'img-src': ["'self'", 'https: data:'],
        'frame-src': ["'self'", 'https: data:'],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  // 3rd PARTY MIDDLEWARE - FOR LOGGING
  app.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// MIDDLEWARE - Body Parser, parses incoming requests with JSON payloads (for req.body)
app.use(express.json({ limit: '10Kb' }));

// MIDDLEWARE - Form Data Parser
app.use(express.urlencoded({ extended: true, limit: '10Kb' }));

// MIDDLEWARE - Cookie Parse
app.use(cookieParser());

// Data Sanitization against NOSQL query injection attack
app.use(mongoSanitize());

// Data Sanitization against XSS (cross-site scripting attack)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  }),
);

app.use(compression());

// ADDING OUR OWN MIDDLEWARE
app.use((req, res, next) => {
  // from now onwards, req.requestTime property will be available to all middlewares (including routes)
  req.requestTime = new Date().toISOString();

  // console.log(req.cookies);

  next();
});

// MOUNTING - mount the router on the route
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// MIDDLEWARE - Handling Unhandled Routes
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.method} ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(
  //   `Can't find ${req.method} ${req.originalUrl} on this server!`,
  // );
  // err.status = 'fail';
  // err.statusCode = 404;

  // agruement inside next is always be an error
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
