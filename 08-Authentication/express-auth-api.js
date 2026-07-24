const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = 3002;
// In production, always use environment variables for secrets (e.g., process.env.JWT_SECRET)
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_development_key';
const users = []; // In-memory mock database

// 1. Register Endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check if user exists
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    try {
        // Hash password before storing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = { id: Date.now(), username, password: hashedPassword };
        
        users.push(newUser);
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

// 3. Custom Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Expected format: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user; // Attach decoded payload to request object
        next();
    });
};

// 4. Protected Route
app.get('/api/dashboard', authenticateToken, (req, res) => {
    res.json({ 
        message: `Welcome to your dashboard, ${req.user.username}!`, 
        secureData: [1, 2, 3] 
    });
});

// Run server if called directly
if (require.main === module) {
    app.listen(PORT, () => console.log(`Auth API running on http://localhost:${PORT}`));
}

module.exports = app;
