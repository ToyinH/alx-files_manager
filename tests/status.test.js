const request = require('supertest');
const app = require('../src/app');

describe('GET /status', () => {
  it('should return status 200 and message', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});


