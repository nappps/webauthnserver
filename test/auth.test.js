const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('WebAuthn Level 3 Server - Authentication Routes', () => {
  describe('GET /api/auth/capabilities', () => {
    test('should return client capabilities', async () => {
      const response = await request(app)
        .get('/api/auth/capabilities')
        .expect(200);
      
      expect(response.body).toHaveProperty('supported');
      expect(response.body).toHaveProperty('version');
      expect(response.body.version).toBe('3.0');
      expect(response.body.supported).toHaveProperty('conditionalMediation');
      expect(response.body.supported).toHaveProperty('largeBlob');
      expect(response.body.supported).toHaveProperty('prf');
    });
  });

  describe('POST /api/auth/register/start', () => {
    test('should return registration options when valid username is provided', async () => {
      const response = await request(app)
        .post('/api/auth/register/start')
        .send({ username: 'testuser', displayName: 'Test User' })
        .expect(200);
      
      expect(response.body).toHaveProperty('challenge');
      expect(response.body).toHaveProperty('rp');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('pubKeyCredParams');
    });

    test('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register/start')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/authenticate/start', () => {
    test('should return authentication options when valid username is provided', async () => {
      const response = await request(app)
        .post('/api/auth/authenticate/start')
        .send({ username: 'testuser' })
        .expect(200);
      
      expect(response.body).toHaveProperty('challenge');
      expect(response.body).toHaveProperty('allowCredentials');
    });

    test('should return 400 when username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/authenticate/start')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/signal-unknown-credential', () => {
    test('should process unknown credential signal', async () => {
      const response = await request(app)
        .post('/api/auth/signal-unknown-credential')
        .send({ options: {} })
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    test('should return 400 when options are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signal-unknown-credential')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/signal-all-accepted', () => {
    test('should process all accepted credentials signal', async () => {
      const response = await request(app)
        .post('/api/auth/signal-all-accepted')
        .send({ options: {} })
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    test('should return 400 when options are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signal-all-accepted')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/signal-user-details', () => {
    test('should process current user details signal', async () => {
      const response = await request(app)
        .post('/api/auth/signal-user-details')
        .send({ options: {} })
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    test('should return 400 when options are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signal-user-details')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
  });
});