const request = require('sync-request-curl');

const SERVER_URL = 'http://localhost:5000';

describe('Customer Portal Tests', () => {
  
  test('Server health check', () => {
    const res = request('GET', `${SERVER_URL}/test`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body.message).toBe('Server is running!');
  });

  test('Get customer VNCO-001 properties', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-001`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body.customer.customer_code).toBe('VNCO-001');
    expect(body.customer.company_name).toBe('ABC Developments');
    expect(body.properties.length).toBe(3);
  });

  test('Get customer VNCO-002 properties', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-002`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(200);
    expect(body.customer.customer_code).toBe('VNCO-002');
    expect(body.customer.company_name).toBe('XYZ Builders');
    expect(body.properties.length).toBe(2);
  });

  test('Invalid customer code returns 404', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/INVALID-999`);
    const body = JSON.parse(res.body.toString());
    
    expect(res.statusCode).toBe(404);
    expect(body.error).toBe('Customer code not found');
  });

  test('Customer properties have correct fields', () => {
    const res = request('GET', `${SERVER_URL}/api/customer/VNCO-001`);
    const body = JSON.parse(res.body.toString());
    
    const property = body.properties[0];
    expect(property).toHaveProperty('id');
    expect(property).toHaveProperty('address');
    expect(property).toHaveProperty('service_type');
    expect(property).toHaveProperty('order_date');
    expect(property).toHaveProperty('current_status');
    expect(property).toHaveProperty('status_history');
    expect(property).toHaveProperty('has_deficiency');
    expect(property).toHaveProperty('attempt_number');
  });
});