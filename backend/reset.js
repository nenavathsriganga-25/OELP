require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const reset = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  
  console.log('Dropping events collection...');
  try {
    await db.collection('events').drop();
    console.log('Events dropped.');
  } catch(e) {
    console.log('Events collection not found or already dropped.');
  }
  
  console.log('Dropping registrations collection to clear indexes...');
  try {
    await db.collection('registrations').drop();
    console.log('Registrations dropped.');
  } catch(e) {
    console.log('Registrations collection not found or already dropped.');
  }

  console.log('Done reset. Now you can run seed.');
  mongoose.connection.close();
};

reset().catch(err => console.log(err));
