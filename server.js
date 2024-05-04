/* eslint-disable n/no-process-exit */
/* eslint-disable no-console */
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// uncaughtException - for exceptions/errors/bugs in synchronous code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');

  console.log(err.name, err.message);

  process.exit(1);
});

const mongoose = require('mongoose');

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// unhandledRejection - for rejected promises (async code)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');

  console.log(err.name, err.message);

  // Gracefully shutting down server then exiting node process
  server.close(() => {
    process.exit(1);
  });
});
