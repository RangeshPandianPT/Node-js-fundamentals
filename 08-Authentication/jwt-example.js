const jwt = require('jsonwebtoken');

// Secret key used to sign and verify tokens (in production, this MUST be in environment variables)
const SECRET_KEY = 'my_super_secret_development_key';

function demoJWT() {
    console.log('--- JSON Web Token (JWT) Demo ---\n');

    // 1. The payload represents the data you want to embed inside the token (e.g., user info)
    // Avoid putting sensitive data like passwords in the payload as it's base64 encoded, not encrypted.
    const payload = {
        userId: 12345,
        role: 'admin',
        username: 'john_doe'
    };

    try {
        // --- CREATE TOKEN (SIGNING) ---
        // Expires in 1 hour
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
        console.log('✅ Token Created successfully:');
        console.log(token);
        console.log('\n----------------------------------------\n');

        // --- VERIFY TOKEN ---
        console.log('🔍 Verifying Token...');
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log('✅ Token Verified! Decoded Payload:');
        console.log(decoded);
        console.log('\n----------------------------------------\n');

        // --- DEMONSTRATE INVALID TOKEN ---
        console.log('🔍 Verifying Tampered Token...');
        const tamperedToken = token + 'tampered'; // Invalidating the token signature
        jwt.verify(tamperedToken, SECRET_KEY); // This will throw an error
        
    } catch (error) {
        console.error('❌ Token Verification Failed:');
        console.error(error.message); // e.g., "invalid signature", "jwt expired"
    }
}

// Note: Requires `npm install jsonwebtoken`
demoJWT();
