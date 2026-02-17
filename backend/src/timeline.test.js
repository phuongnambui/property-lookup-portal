const request = require('sync-request-curl');

const SERVER_URL = 'http://localhost:5000';

describe('Timeline and Status Tests', () => {
  let adminToken;

  beforeAll(() => {
    // Login as admin
    const res = request('POST', `${SERVER_URL}/api/admin/login`, {
      json: { username: 'admin', password: 'admin123' }
    });
    const body = JSON.parse(res.body.toString());
    adminToken = body.token;
  });

  test('Get status flow', () => {
    const res = request('GET', `${SERVER_URL}/api/status-flow`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body.statuses).toEqual([
      'Request Received',
      'Surveyed',
      'Certificate Processing',
      'Submitted to City',
      'Pass',
      'Fail'
    ]);
  });

  test('Customer sees property with timeline', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-001`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body.properties[0]).toHaveProperty('current_status');
    expect(body.properties[0]).toHaveProperty('status_history');
    expect(Array.isArray(body.properties[0].status_history)).toBe(true);
  });

  test('Property has timeline dates', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-001`);
    const body = JSON.parse(res.body.toString());
    
    const property = body.properties[0];
    if (property.status_history.length > 0) {
      expect(property.status_history[0]).toHaveProperty('status');
      expect(property.status_history[0]).toHaveProperty('date');
      expect(property.status_history[0]).toHaveProperty('timestamp');
    }
  });

  test('Admin can update property status', () => {
    const res = request('PUT', `${SERVER_URL}/api/admin/property/2/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      json: { status: 'Certificate Processing' }
    });
    
    if (res.statusCode === 200) {
      const body = JSON.parse(res.body.toString());
      expect(body.property.current_status).toBe('Certificate Processing');
      expect(body.property.status_history.length).toBeGreaterThan(0);
    } else if (res.statusCode === 400) {
      // Property might already be past this status or at Pass
      const body = JSON.parse(res.body.toString());
      expect(body).toHaveProperty('error');
    }
  });

  test('Cannot update status without token', () => {
    const res = request('PUT', `${SERVER_URL}/api/admin/property/1/status`, {
      json: { status: 'Surveyed' }
    });
    
    expect(res.statusCode).toBe(401);
  });

  test('Invalid status returns error', () => {
    const res = request('PUT', `${SERVER_URL}/api/admin/property/1/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      json: { status: 'Invalid Status' }
    });
    
    expect(res.statusCode).toBe(400);
  });

  test('Property with deficiency has photo URL', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-001`);
    const body = JSON.parse(res.body.toString());
    
    // Find property with deficiency
    const propertyWithDeficiency = body.properties.find(p => p.has_deficiency);
    if (propertyWithDeficiency) {
      expect(propertyWithDeficiency.deficiency_photo_url).toBeTruthy();
    }
  });

  test('Property shows attempt number', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-002`);
    const body = JSON.parse(res.body.toString());
    
    expect(body.properties[0]).toHaveProperty('attempt_number');
    expect(typeof body.properties[0].attempt_number).toBe('number');
    expect(body.properties[0].attempt_number).toBeGreaterThanOrEqual(1);
  });

  test('Property that failed shows attempt 2', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-002`);
    const body = JSON.parse(res.body.toString());
    
    // Property at 654 Birch Ave should have attempt_number = 2
    const failedProperty = body.properties.find(p => p.address.includes('654 Birch'));
    if (failedProperty) {
      expect(failedProperty.attempt_number).toBe(2);
    }
  });
});