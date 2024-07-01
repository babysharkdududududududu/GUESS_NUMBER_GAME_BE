const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Mission = require('./model/misson'); // Đảm bảo path này đúng với đường dẫn tới model của bạn
require('dotenv').config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URI || '';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        seedData();
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process on connection error
    });

function seedData() {
    const seedFilePath = path.join(__dirname, 'misson.json');

    fs.readFile(seedFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            mongoose.connection.close();
            return;
        }
        const missions = JSON.parse(data);
        Mission.insertMany(missions)
            .then(() => {
                console.log('Missions seeded');
                mongoose.connection.close();
            })
            .catch((err) => {
                console.error('Error seeding missions:', err);
                mongoose.connection.close();
            });
    });
}
