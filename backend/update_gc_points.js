require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Event = require('./models/Event');

const updateGC = async () => {
  await connectDB();
  
  try {
    const gcEvent = await Event.findOne({ eventType: 'multi-sport' });
    if (!gcEvent) {
      console.log('GC Event not found');
      process.exit(1);
    }

    const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    gcEvent.sports = [
      { name: 'Athletics', maxPlayers: 200, date: future(47), time: '06:00 AM', venue: 'Athletics Track' },
      { name: 'Badminton (Men)', maxPlayers: 40, date: future(47), time: '09:00 AM', venue: 'Indoor Stadium' },
      { name: 'Badminton (Women)', maxPlayers: 40, date: future(47), time: '02:00 PM', venue: 'Indoor Stadium' },
      { name: 'Basketball (Men)', maxPlayers: 50, date: future(46), time: '04:00 PM', venue: 'Indoor Courts' },
      { name: 'Basketball (Women)', maxPlayers: 50, date: future(46), time: '10:00 AM', venue: 'Indoor Courts' },
      { name: 'Cricket', maxPlayers: 100, date: future(45), time: '09:00 AM', venue: 'Main Ground' },
      { name: 'Football', maxPlayers: 120, date: future(46), time: '05:00 PM', venue: 'Main Ground' },
      { name: 'Table Tennis (Men)', maxPlayers: 30, date: future(48), time: '10:00 AM', venue: 'Student Activity Center' },
      { name: 'Table Tennis (Women)', maxPlayers: 30, date: future(48), time: '02:00 PM', venue: 'Student Activity Center' },
      { name: 'Volleyball (Men)', maxPlayers: 60, date: future(45), time: '05:00 PM', venue: 'Volleyball Courts' },
      { name: 'Volleyball (Women)', maxPlayers: 60, date: future(45), time: '10:00 AM', venue: 'Volleyball Courts' },
      { name: 'Powerlifting', maxPlayers: 40, date: future(48), time: '10:00 AM', venue: 'Gymnasium' },
      { name: 'Chess', maxPlayers: 40, date: future(44), time: '05:00 PM', venue: 'Indoor Recreation Room' },
      { name: 'March Past', maxPlayers: 200, date: future(49), time: '08:00 AM', venue: 'Main Ground' },
      { name: 'Penalties', maxPlayers: 0, date: future(49), time: '00:00 AM', venue: 'N/A' }
    ];

    gcEvent.leaderboard = [
      // Savage sharks
      { team: 'Savage Sharks', sport: 'Athletics', points: 16 },
      { team: 'Savage Sharks', sport: 'Badminton (Women)', points: 2 },
      { team: 'Savage Sharks', sport: 'Volleyball (Men)', points: 2 },
      { team: 'Savage Sharks', sport: 'Volleyball (Women)', points: 2 },
      { team: 'Savage Sharks', sport: 'Chess', points: 6 },

      // Stalwart Rhinos
      { team: 'Stalwart Rhinos', sport: 'Athletics', points: 4 },
      { team: 'Stalwart Rhinos', sport: 'Badminton (Men)', points: 6 },
      { team: 'Stalwart Rhinos', sport: 'Badminton (Women)', points: 10 },
      { team: 'Stalwart Rhinos', sport: 'Cricket', points: 10 },
      { team: 'Stalwart Rhinos', sport: 'Football', points: 4 },
      { team: 'Stalwart Rhinos', sport: 'Table Tennis (Men)', points: 6 },
      { team: 'Stalwart Rhinos', sport: 'Table Tennis (Women)', points: 10 },
      { team: 'Stalwart Rhinos', sport: 'Volleyball (Men)', points: 4 },
      { team: 'Stalwart Rhinos', sport: 'Powerlifting', points: 6 },
      { team: 'Stalwart Rhinos', sport: 'Chess', points: 4 },

      // Ferocious Tigers
      { team: 'Ferocious Tigers', sport: 'Badminton (Men)', points: 2 },
      { team: 'Ferocious Tigers', sport: 'Basketball (Men)', points: 10 },
      { team: 'Ferocious Tigers', sport: 'Basketball (Women)', points: 2 },
      { team: 'Ferocious Tigers', sport: 'Cricket', points: 6 },
      { team: 'Ferocious Tigers', sport: 'Table Tennis (Women)', points: 6 },
      { team: 'Ferocious Tigers', sport: 'Powerlifting', points: 2 },

      // Majestic Eagles
      { team: 'Majestic Eagles', sport: 'Badminton (Men)', points: 4 },
      { team: 'Majestic Eagles', sport: 'Basketball (Men)', points: 2 },
      { team: 'Majestic Eagles', sport: 'Cricket', points: 4 },
      { team: 'Majestic Eagles', sport: 'Football', points: 10 },
      { team: 'Majestic Eagles', sport: 'Table Tennis (Men)', points: 10 },
      { team: 'Majestic Eagles', sport: 'Volleyball (Men)', points: 6 },
      { team: 'Majestic Eagles', sport: 'Penalties', points: -10 },

      // Wild Wolves
      { team: 'Wild Wolves', sport: 'Athletics', points: 16 },
      { team: 'Wild Wolves', sport: 'Badminton (Men)', points: 10 },
      { team: 'Wild Wolves', sport: 'Badminton (Women)', points: 4 },
      { team: 'Wild Wolves', sport: 'Basketball (Men)', points: 4 },
      { team: 'Wild Wolves', sport: 'Basketball (Women)', points: 6 },
      { team: 'Wild Wolves', sport: 'Cricket', points: 2 },
      { team: 'Wild Wolves', sport: 'Football', points: 2 },
      { team: 'Wild Wolves', sport: 'Table Tennis (Men)', points: 4 },
      { team: 'Wild Wolves', sport: 'Volleyball (Men)', points: 10 },
      { team: 'Wild Wolves', sport: 'Volleyball (Women)', points: 10 },
      { team: 'Wild Wolves', sport: 'Powerlifting', points: 10 },
      { team: 'Wild Wolves', sport: 'Chess', points: 10 },

      // Stealthy Panthers
      { team: 'Stealthy Panthers', sport: 'Basketball (Men)', points: 6 },
      { team: 'Stealthy Panthers', sport: 'Basketball (Women)', points: 10 },
      { team: 'Stealthy Panthers', sport: 'Table Tennis (Men)', points: 2 },
      { team: 'Stealthy Panthers', sport: 'Table Tennis (Women)', points: 2 },
      { team: 'Stealthy Panthers', sport: 'Volleyball (Men)', points: 4 },
      { team: 'Stealthy Panthers', sport: 'Volleyball (Women)', points: 4 },

      // Mighty Lions
      { team: 'Mighty Lions', sport: 'Athletics', points: 8 },
      { team: 'Mighty Lions', sport: 'Badminton (Women)', points: 6 },
      { team: 'Mighty Lions', sport: 'Basketball (Women)', points: 4 },
      { team: 'Mighty Lions', sport: 'Football', points: 6 },
      { team: 'Mighty Lions', sport: 'Table Tennis (Women)', points: 4 },
      { team: 'Mighty Lions', sport: 'Volleyball (Men)', points: 6 },
      { team: 'Mighty Lions', sport: 'Chess', points: 2 }
    ];

    await gcEvent.save();
    console.log('✅ GC Event points and sports successfully updated!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateGC();
