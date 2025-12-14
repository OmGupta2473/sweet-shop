const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  // Connect mongoose before importing app to ensure mongoose.connection is set
  await mongoose.connect(uri, { dbName: 'test' });
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  // Clear DB before each test
  await mongoose.connection.db.dropDatabase();
});

describe('Auth routes', () => {
  test('Register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Om', email: 'om@test.com', password: '123456' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('om@test.com');
  });

  test('Register validation error for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Om', email: 'om@test.com', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('Login returns token for valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Om', email: 'om@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'om@test.com', password: '123456' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('Login fails with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Om', email: 'om@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'om@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});
