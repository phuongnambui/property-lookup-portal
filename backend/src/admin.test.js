const request = require('sync-request-curl');

const SERVER_URL = 'http://localhost:5001';

describe('Admin Authentication Tests', () => {
  let adminToken;

  test('Admin login with correct credentials', () => {
    const res = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: {
        username: 'admin',
        password: 'admin123'
      }
    });
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    
    adminToken = body.token; // Save for other tests
  });

  test('Admin login with wrong password', () => {
    const res = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: {
        username: 'admin',
        password: 'wrongpassword'
      }
    });
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(401);
    expect(body).toHaveProperty('error');
  });

  test('Admin login with wrong username', () => {
    const res = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: {
        username: 'wronguser',
        password: 'admin123'
      }
    });
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(401);
    expect(body).toHaveProperty('error');
  });

  test('Get all customers without token - should fail', () => {
    const res = request('GET', `${SERVER_URL}/api/admin/customers`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(401);
    expect(body.error).toBe('No token provided');
  });

  test('Get all customers with valid token', () => {
    // First login to get token
    const loginRes = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: { username: 'admin', password: 'admin123' }
    });
    const { token } = JSON.parse(loginRes.body.toString());

    // Then get customers
    const res = request('GET', `${SERVER_URL}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('customers');
    expect(Array.isArray(body.customers)).toBe(true);
  });

  test('Get all properties with valid token', () => {
    // First login
    const loginRes = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: { username: 'admin', password: 'admin123' }
    });
    const { token } = JSON.parse(loginRes.body.toString());

    // Then get properties
    const res = request('GET', `${SERVER_URL}/api/admin/properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('properties');
    expect(Array.isArray(body.properties)).toBe(true);
    expect(body.properties.length).toBeGreaterThan(0);
  });

  test('Admin logout', () => {
    // First login
    const loginRes = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: { username: 'admin', password: 'admin123' }
    });
    const { token } = JSON.parse(loginRes.body.toString());

    // Then logout
    const res = request('POST', `${SERVER_URL}/api/admin/logout`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    expect(res.statusCode).toBe(200);
  });
});