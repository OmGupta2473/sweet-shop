const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');

let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  await mongoose.connect(uri, { dbName: 'test' });
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

async function register(email, password, name = 'Test') {
  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  return res.body.token;
}

describe('Sweets API', () => {
  test('Authenticated user can list sweets (empty at start)', async () => {
    const token = await register('viewer@test.com', '123456');
    const res = await request(app).get('/api/sweets').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('Admin can create, update and delete sweets; non-admin cannot create', async () => {
    // Register normal and admin user
    const userToken = await register('user@test.com', '123456');
    const adminTokenInitial = await register('admin@test.com', '123456');

    // Make the admin user an admin and request new token (login)
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    adminUser.role = 'admin';
    await adminUser.save();
    const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: '123456' });
    const adminToken = loginAdmin.body.token;

    // Non-admin try to create: forbidden
    const createResFail = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Lollipop', category: 'Candy', price: 1.2, quantity: 10 });
    expect([401, 403]).toContain(createResFail.statusCode);

    // Admin create
    const createRes = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Chocolate', category: 'Chocolate', price: 2.5, quantity: 5 });
    expect(createRes.statusCode).toBe(201);
    const sweetId = createRes.body._id;

    // Authenticated user get list returns one
    const viewerToken = await register('viewer2@test.com', '123456');
    const list = await request(app).get('/api/sweets').set('Authorization', `Bearer ${viewerToken}`);
    expect(list.body.length).toBe(1);

    // Get by id (auth required)
    const getById = await request(app).get(`/api/sweets/${sweetId}`).set('Authorization', `Bearer ${viewerToken}`);
      // Search by name
      const searchRes = await request(app).get('/api/sweets/search').set('Authorization', `Bearer ${viewerToken}`).query({ name: 'chocolate' });
      expect(searchRes.statusCode).toBe(200);
      expect(searchRes.body.length).toBe(1);

      // Purchase (decrease quantity) by user
      const before = (await request(app).get('/api/sweets').set('Authorization', `Bearer ${viewerToken}`)).body[0];
      expect(before.quantity).toBe(5);
      const purchaseRes = await request(app).post(`/api/sweets/${sweetId}/purchase`).set('Authorization', `Bearer ${userToken}`);
      expect(purchaseRes.statusCode).toBe(200);
      const afterPurchase = (await request(app).get('/api/sweets').set('Authorization', `Bearer ${viewerToken}`)).body[0];
      expect(afterPurchase.quantity).toBe(4);

      // Restock by admin
      const restockRes = await request(app).post(`/api/sweets/${sweetId}/restock`).set('Authorization', `Bearer ${adminToken}`).send({ quantity: 3 });
      expect(restockRes.statusCode).toBe(200);
      const afterRestock = (await request(app).get('/api/sweets').set('Authorization', `Bearer ${viewerToken}`)).body[0];
      expect(afterRestock.quantity).toBe(7);

    expect(getById.statusCode).toBe(200);
    expect(getById.body.name).toBe('Chocolate');

    // Admin update
    const updateRes = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 3.0 });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.price).toBe(3);

    // Non-admin update forbidden
    const updateFail = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 10 });
    expect([401, 403]).toContain(updateFail.statusCode);

    // Admin delete
    const deleteRes = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);

    // Ensure it's deleted
    const afterList = await request(app).get('/api/sweets').set('Authorization', `Bearer ${viewerToken}`);
    expect(afterList.body.length).toBe(0);
  });
});
