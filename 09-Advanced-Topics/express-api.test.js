const request = require('supertest');
const express = require('express');

// Create a simple app for testing purposes
const app = express();
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

describe('Express API Tests', () => {
    it('should return 200 OK for GET /api/health', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
    
    it('should handle 404 for unknown routes', async () => {
        const response = await request(app).get('/api/unknown');
        expect(response.status).toBe(404);
    });
});
