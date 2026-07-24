const bcrypt = require('bcrypt');

async function demoBcrypt() {
    console.log('--- Bcrypt Password Hashing Demo ---');
    
    const plainTextPassword = 'mySuperSecretPassword123';
    const saltRounds = 10; // 10 is considered a good default for performance vs security

    try {
        console.log(`1. Original Password: "${plainTextPassword}"`);
        
        // --- HASHING ---
        // A salt is random data added to the password before hashing, preventing rainbow table attacks.
        const salt = await bcrypt.genSalt(saltRounds);
        console.log(`2. Generated Salt: ${salt}`);

        const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
        console.log(`3. Hashed Password: ${hashedPassword}`);

        // --- VERIFYING (LOGIN) ---
        console.log('\n--- Simulating Login ---');
        
        // Correct Password Check
        const isMatch = await bcrypt.compare('mySuperSecretPassword123', hashedPassword);
        console.log(`4. Verifying correct password: ${isMatch ? '✅ MATCH' : '❌ FAIL'}`);

        // Incorrect Password Check
        const isMatchWrong = await bcrypt.compare('wrongPassword', hashedPassword);
        console.log(`5. Verifying wrong password: ${isMatchWrong ? '✅ MATCH' : '❌ FAIL'}`);

    } catch (error) {
        console.error('Error during bcrypt operations:', error);
    }
}

// Note: Requires `npm install bcrypt`
demoBcrypt();
