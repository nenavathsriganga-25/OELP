require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

const seed = async () => {
  await connectDB();

  // --- Seed Admin ---
  const existingAdmin = await User.findOne({ email: 'admin@iitpkd.ac.in' });
  let adminUser;

  if (!existingAdmin) {
    adminUser = await User.create({
      fullName: 'Admin IIT Palakkad',
      email: 'admin@iitpkd.ac.in',
      password: 'admin123',
      role: 'admin',
      designation: 'System Administrator'
    });
    console.log('✅ Admin created: admin@iitpkd.ac.in / admin123');
  } else {
    adminUser = existingAdmin;
    console.log('ℹ️  Admin already exists.');
  }

  // --- Seed Organizer ---
  const existingOrg = await User.findOne({ email: 'organizer@iitpkd.ac.in' });
  let orgUser;

  if (!existingOrg) {
    orgUser = await User.create({
      fullName: 'Event Organizer',
      email: 'organizer@iitpkd.ac.in',
      password: 'org123',
      role: 'organizer',
      designation: 'Student Affairs'
    });
    console.log('✅ Organizer created: organizer@iitpkd.ac.in / org123');
  } else {
    orgUser = existingOrg;
    console.log('ℹ️  Organizer already exists.');
  }

  // --- Seed Events ---
  const eventCount = await Event.countDocuments();
  if (eventCount === 0) {
    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const events = [
      {
        title: 'Petrichor',
        description: "Petrichor is IIT Palakkad's annual techno-cultural fest, bringing together the best of technology and culture. The event features exciting competitions, workshops, cultural performances, music concerts, and tech exhibitions.",
        category: 'cultural',
        date: future(30),
        time: '09:00 AM',
        venue: 'IIT Palakkad Campus',
        registrationDeadline: future(25),
        maxParticipants: 500,
        agenda: 'Day 1: Inauguration, Tech Competitions | Day 2: Workshops, Music Night | Day 3: Finals, Closing Ceremony',
        image: 'https://iitpkd.ac.in/sites/default/files/2024-01/DateRevealWeb.png',
        contact: 'petrichor@iitpkd.ac.in',
        instagram: 'https://www.instagram.com/petrichor_iitpkd/',
        status: 'approved',
        organizer: adminUser._id
      },
      {
        title: 'General Championship 2026',
        description: 'The General Championship is a multi-sport inter-college championship featuring cricket, football, basketball, volleyball, badminton, and more.',
        category: 'sports',
        date: future(45),
        time: '08:00 AM',
        venue: 'IIT Palakkad Sports Complex',
        registrationDeadline: future(40),
        maxParticipants: 1000,
        agenda: 'Multiple rounds across sports | Quarter-finals, Semi-finals, Finals | Award ceremony',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ659LrZg3Y3is4Q9wNaHWPnApnMcJUNhaS5A&s',
        contact: 'gc@iitpkd.ac.in',
        instagram: 'https://www.instagram.com/gc_iitpkd/',
        status: 'approved',
        organizer: adminUser._id,
        eventType: 'multi-sport',
        sports: [
          { name: 'Cricket', maxPlayers: 100, date: future(45), time: '09:00 AM', venue: 'Main Ground' },
          { name: 'Basketball', maxPlayers: 50, date: future(46), time: '04:00 PM', venue: 'Indoor Courts' },
          { name: 'Athletics', maxPlayers: 200, date: future(47), time: '06:00 AM', venue: 'Athletics Track' },
          { name: 'Volleyball', maxPlayers: 60, date: future(45), time: '05:00 PM', venue: 'Volleyball Courts' },
          { name: 'Powerlifting', maxPlayers: 40, date: future(48), time: '10:00 AM', venue: 'Gymnasium' },
          { name: 'Football', maxPlayers: 120, date: future(46), time: '05:00 PM', venue: 'Main Ground' },
          { name: 'Badminton', maxPlayers: 40, date: future(47), time: '09:00 AM', venue: 'Indoor Stadium' },
          { name: 'Table Tennis', maxPlayers: 30, date: future(48), time: '02:00 PM', venue: 'Student Activity Center' }
        ],
        leaderboard: [
          { team: 'Wild Wolves', sport: 'Cricket', points: 10 },
          { team: 'Mighty Lions', sport: 'Football', points: 8 }
        ]
      },
      {
        title: 'Sportacus',
        description: 'Sportacus is the college premier sports championship and fitness event promoting physical fitness, team spirit, and healthy competition.',
        category: 'sports',
        date: future(60),
        time: '07:30 AM',
        venue: 'IIT Palakkad Campus',
        registrationDeadline: future(55),
        maxParticipants: 200,
        agenda: 'Opening ceremony | Track and field | Team sports | Fitness challenges | Awards',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbobHhLvSOwVc1nszE9sgNsCGHSnTHa1P1gQ&s',
        contact: 'sports@iitpkd.ac.in',
        instagram: 'https://www.instagram.com/sports_iit_pkd/',
        status: 'approved',
        organizer: adminUser._id
      },
      {
        title: 'Institute Day',
        description: 'Institute Day is the annual celebration of IIT Palakkad, honoring achievements, recognizing excellence, and celebrating the spirit of the institute.',
        category: 'cultural',
        date: future(90),
        time: '10:00 AM',
        venue: 'IIT Palakkad Main Auditorium',
        registrationDeadline: future(85),
        maxParticipants: 1000,
        agenda: 'Welcome address | Award presentations | Cultural performances | Guest speaker | Closing ceremony',
        image: 'https://iitpkd.ac.in/sites/default/files/inline-images/Institute%20Day%202025_page-0001.jpg',
        contact: 'info@iitpkd.ac.in',
        instagram: 'https://www.instagram.com/iit_pkd/',
        status: 'approved',
        organizer: adminUser._id
      },
      {
        title: 'Tech Workshop: ML & AI',
        description: 'Hands-on workshop on Machine Learning and AI fundamentals, covering Python, scikit-learn, and neural networks. Perfect for beginners and intermediate learners.',
        category: 'workshop',
        date: future(15),
        time: '02:00 PM',
        venue: 'Computer Science Lab, Block B',
        registrationDeadline: future(12),
        maxParticipants: 50,
        agenda: 'Python basics recap | ML algorithms | Hands-on project | Q&A',
        image: 'https://iitpkd.ac.in/sites/default/files/styles/width_scale/public/2024-09/asap-mitra.jpg?itok=-d7816-6',
        contact: 'workshops@iitpkd.ac.in',
        status: 'approved',
        organizer: adminUser._id
      }
    ];

    await Event.insertMany(events);
    console.log(`✅ Seeded ${events.length} events.`);
  } else {
    console.log(`ℹ️  Events already exist (${eventCount} found). Skipping event seed.`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('Admin login:     admin@iitpkd.ac.in / admin123');
  console.log('Organizer login: organizer@iitpkd.ac.in / org123');
  mongoose.connection.close();
};

seed().catch(err => {
  console.error('Seed failed:', err);
  mongoose.connection.close();
});
