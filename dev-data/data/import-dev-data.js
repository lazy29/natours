/* eslint-disable no-console */
const dotenv = require('dotenv');

dotenv.config({ path: '../../config.env' });

const fs = require('node:fs/promises');

const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// Establish DB connection
async function dbConnection() {
  try {
    await mongoose.connect(DB);

    console.log('DB connection successful!');
  } catch (err) {
    throw new Error(err.message);
  }
}

// Read JSON File
async function readFile() {
  try {
    const dataTours = await fs.readFile(`${__dirname}/tours.json`, {
      encoding: 'utf8',
    });
    const dataUsers = await fs.readFile(`${__dirname}/users.json`, {
      encoding: 'utf8',
    });
    const dataReviews = await fs.readFile(`${__dirname}/reviews.json`, {
      encoding: 'utf8',
    });

    const data = {
      tours: JSON.parse(dataTours),
      users: JSON.parse(dataUsers),
      reviews: JSON.parse(dataReviews),
    };

    return data;
  } catch (err) {
    throw new Error(err.message);
  }
}

// Import data into DB
async function importData() {
  try {
    await dbConnection();

    const data = await readFile();

    await Tour.create(data.tours);
    await User.create(data.users, { validateBeforeSave: false });
    await Review.create(data.reviews);

    console.log('🎉 tours, users and reviews are successfully uploaded 🎉');
  } catch (err) {
    console.log('ERROR 💥💥💥', err);
  } finally {
    mongoose.connection.close();
  }
}

// Delete data from DB
async function deleteData() {
  try {
    await dbConnection();

    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('😨 tours, users and reviews are successfully deleted 😨');
  } catch (err) {
    console.log('ERROR 💥💥💥', err);
  } finally {
    mongoose.connection.close();
  }
}

if (process.argv.at(2) === '--import') {
  importData();
} else if (process.argv.at(2) === '--delete') {
  deleteData();
}
