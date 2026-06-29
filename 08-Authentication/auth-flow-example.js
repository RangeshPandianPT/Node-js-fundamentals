const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'super_secret_production_key_here';

// Mock database
const users = [];

async function demoAuthFlow() {
    console.log('--- Complete Authentication Flow Demo ---\n');

    const password = 'my_secure_password';
    const username = 'john_doe';

    // 1. REGISTRATION
    console.log('1. User Registration');
    console.log(`Registering user '${username}' with password '${password}'...`);
    
    // Hash password before saving to DB
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = { id: 1, username, password: hashedPassword };
    users.push(newUser);
    
    console.log('✅ User registered successfully in "database".');
    console.log('Saved User Object:', newUser);
    console.log('\n----------------------------------------\n');

    // 2. LOGIN
    console.log('2. User Login');
    console.log(`Attempting login for '${username}'...`);
    
    // Retrieve user from DB
    const userFromDb = users.find(u => u.username === username);
    
    if (!userFromDb) {
        return console.log('❌ Login Failed: User not found.');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, userFromDb.password);
    
    if (!isMatch) {
        return console.log('❌ Login Failed: Incorrect password.');
    }
    console.log('✅ Passwords match!');

    // Generate JWT
    const payload = { userId: userFromDb.id, username: userFromDb.username };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    
    console.log('✅ JWT Issued to client:');
    console.log(token);
    console.log('\n----------------------------------------\n');

    // 3. ACCESSING PROTECTED RESOURCE
    console.log('3. Accessing Protected Resource');
    console.log('Client sends token in Authorization header...');

    try {
        // Verify token
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('✅ Token Verified! Access Granted.');
        console.log('Welcome to the secure dashboard, user ID:', decoded.userId);
    } catch (err) {
        console.log('❌ Access Denied:', err.message);
    }
}

demoAuthFlow();
