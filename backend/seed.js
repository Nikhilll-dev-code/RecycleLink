const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Driver = require('./models/Driver');
const connect = require('./db/connect');

const users = [
  {
    name: 'Admin',
    email: 'admin@recyclelink.com',
    password: 'admin123',
    role: 'Admin',
    address: 'RecycleLink HQ'
  },
  {
    name: 'Driver Demo',
    email: 'driver@recyclelink.com',
    password: 'driver123',
    role: 'Driver',
    address: 'City Center'
  },
  {
    name: 'Resident Demo',
    email: 'resident@recyclelink.com',
    password: 'resident123',
    role: 'Resident',
    address: 'North Hills'
  }
];

async function seed() {
  try {
    await connect();
    console.log('Connected to DB');

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 10);
        const newUser = await User.create({ ...u, password: hash });
        console.log(`Created ${u.role}: ${u.email}`);

        if (u.role === 'Driver') {
          await Driver.create({
            userId: newUser._id,
            licenseNumber: 'DEMO-1234',
            vehicle: {
              vehicleType: 'EV Truck',
              licensePlate: 'DEMO-EV-01'
            }
          });
          console.log(`Created Driver profile for ${u.email}`);
        }
      } else {
        console.log(`${u.role} already exists (${u.email})`);
      }
    }
    console.log('Seed complete!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    process.exit(0);
  }
}

seed();
