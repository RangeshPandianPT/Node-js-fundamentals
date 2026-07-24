const mongoose = require('mongoose');

// Note: To run this file, you must have MongoDB running locally or provide a valid MongoDB URI.
// You also need to install mongoose: `npm install mongoose`

const MONGO_URI = 'mongodb://127.0.0.1:27017/node_fundamentals_db';

// 1. Define a Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, min: 18 },
    createdAt: { type: Date, default: Date.now }
});

// 2. Create a Model
const User = mongoose.model('User', userSchema);

// 3. Connect to Database and Perform CRUD
async function runDatabaseExample() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully to MongoDB!\n');

        // --- CREATE ---
        console.log('--- Creating a new user ---');
        const newUser = new User({
            name: 'Alice Smith',
            email: `alice_${Date.now()}@example.com`,
            age: 28
        });
        const savedUser = await newUser.save();
        console.log('Created User:', savedUser.name, savedUser.email);

        // --- READ ---
        console.log('\n--- Reading users ---');
        const allUsers = await User.find().limit(2);
        console.log(`Found ${allUsers.length} users in the database.`);
        console.log('First user name:', allUsers[0]?.name);

        // --- UPDATE ---
        console.log('\n--- Updating user ---');
        const updatedUser = await User.findOneAndUpdate(
            { _id: savedUser._id },
            { age: 29 },
            { new: true } // Returns the updated document
        );
        console.log('Updated User Age:', updatedUser.age);

        // --- DELETE ---
        console.log('\n--- Deleting user ---');
        const deletedResult = await User.deleteOne({ _id: savedUser._id });
        console.log('Deleted Count:', deletedResult.deletedCount);

    } catch (error) {
        console.error('❌ Database connection or operation failed:');
        console.error(error.message);
        console.log('\nMake sure MongoDB is running locally on port 27017.');
    } finally {
        // Disconnect after operations
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('\nDisconnected from MongoDB.');
        }
    }
}

// Execute the async function
runDatabaseExample();
