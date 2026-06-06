const crypto = require('crypto');

console.log('--- Crypto Module Examples ---\n');

// Hashing
const secret = 'my-secret-password';
const hash = crypto.createHash('sha256').update(secret).digest('hex');
console.log(`SHA-256 Hash of '${secret}':\n${hash}\n`);

// HMAC
const hmacKey = 'super-secret-key';
const hmac = crypto.createHmac('sha256', hmacKey).update(secret).digest('hex');
console.log(`HMAC (SHA-256) of '${secret}':\n${hmac}\n`);

// Generating random bytes
const randomBytes = crypto.randomBytes(16).toString('hex');
console.log(`Random Bytes (16 bytes):\n${randomBytes}\n`);

// Symmetric Encryption (AES-256-CBC)
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  const ivBuffer = Buffer.from(text.iv, 'hex');
  const encryptedText = Buffer.from(text.encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const message = 'Hello, this is a secret message!';
const encryptedMessage = encrypt(message);
console.log(`Encrypted Message:\n${encryptedMessage.encryptedData}\n`);

const decryptedMessage = decrypt(encryptedMessage);
console.log(`Decrypted Message:\n${decryptedMessage}\n`);

module.exports = {
  hash,
  randomBytes,
  encrypt,
  decrypt
};
