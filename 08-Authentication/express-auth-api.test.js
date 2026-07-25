/**
 * Integration Tests for JWT Authentication API
 * --------------------------------------------
 * Uses Supertest and Jest to verify the full authentication lifecycle:
 * User Registration -> Login -> JWT Verification -> Protected Route Access
 */
const request = require('supertest');
const app = require('./express-auth-api');

describe('JWT Authentication API Integration Tests', () => {
    const testUser = {
        username: 'testuser_' + Date.now(),
        password: 'SecurePassword123!'
    };
    let authToken = '';

    describe('POST /api/register', () => {
        it('should successfully register a new user', async () => {
            const res = await request(app)
                .post('/api/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('userId');
        });

        it('should fail when registering a duplicate username', async () => {
            const res = await request(app)
                .post('/api/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'User already exists');
        });

        it('should fail when username or password is missing', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({ username: 'only_username' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Username and password required');
        });
    });

    describe('POST /api/login', () => {
        it('should login successfully and return a valid JWT token', async () => {
            const res = await request(app)
                .post('/api/login')
                .send(testUser);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Login successful');
            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');
            authToken = res.body.token; // Save token for protected route tests
        });

        it('should fail login with incorrect password', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: testUser.username,
                    password: 'WrongPassword999'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should fail login for non-existent user', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'ghost_user_9999',
                    password: 'somepassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });
    });

    describe('GET /api/dashboard (Protected Route)', () => {
        it('should allow access with a valid Authorization Bearer token', async () => {
            const res = await request(app)
                .get('/api/dashboard')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe(`Welcome to your dashboard, ${testUser.username}!`);
            expect(res.body).toHaveProperty('secureData', [1, 2, 3]);
        });

        it('should deny access when Authorization header is missing', async () => {
            const res = await request(app)
                .get('/api/dashboard');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Access denied, token missing');
        });

        it('should deny access when token is malformed or invalid', async () => {
            const res = await request(app)
                .get('/api/dashboard')
                .set('Authorization', 'Bearer fake_invalid_jwt_token_string');

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'Invalid or expired token');
        });
    });
});
