import mongoose from 'mongoose'
import request from 'supertest'
import app from '../app'
import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'

let uri
let mongod
beforeAll(async () => {
  mongod = new MongoMemoryServer()
  uri = await mongod.getConnectionString()
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
  })
})

afterAll(async () => {
  mongod.stop()
})

const user0 = {
  email: 'test1@qq.com',
  phone: '11111111111',
  name: 'user1',
  password: 'test1',
  isOrganization: false,
  realname: 'i am test1',
  birthYear: 1998,
  gender: 'male',
  studentID: '14785236',
}

const user1 = {
  email: 'test2@qq.com',
  phone: '22222222222',
  name: 'test2',
  password: 'test2',
  isOrganization: false,
  realname: 'i am test2',
  birthYear: 2000,
  gender: 'female',
  studentID: '00000000',
}
const user2 = {
  email: 'test3@qq.com',
  phone: '33333333333',
  name: 'test3',
  password: 'test3',
  isOrganization: true,
  address: 'America',
}

describe('test user signup operation', () => {
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()
  })
  test('create user with bad data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'john' })
    expect(response.statusCode).toEqual(400)
  })
  test('create user1 with invalid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(Object.assign(Object.assign({}, user0), { name: '     ' }))
    expect(response.statusCode).toEqual(400)
  })
  test('create user1 with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(user0)
    expect(response.statusCode).toEqual(201)
    expect(response.body.uid).toEqual(0)
    expect(response.body.isOrganization).toEqual(false)
  })
  test('create user with duplicate data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(user0)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual(
      expect.arrayContaining([
        'DUPLICATE_EMAIL',
        'DUPLICATE_PHONE',
        'DUPLICATE_NAME',
        'DUPLICATE_STUDENTID',
      ])
    )
  })

  test('create user2 with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(user1)
    expect(response.statusCode).toEqual(201)
    expect(response.body.uid).toEqual(1)
  })
  test('create organization with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send(user2)
    expect(response.statusCode).toEqual(201)
    expect(response.body.uid).toEqual(2)
    expect(response.body.isOrganization).toEqual(true)
  })
})

describe('test user login operation', () => {
  const email = user0.email
  const phone = user0.phone
  const password = user0.password
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await request(app)
      .post('/api/users')
      .send(user0)
  })
  test('login with email', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: email,
        password,
      })
    expect(response.statusCode).toEqual(200)
    expect(typeof response.text).toBe('string')
    const payload = jwt.decode(response.text)
    expect(payload.email).toEqual(email)
  })
  test('login with phone', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: phone,
        password,
      })
    expect(response.statusCode).toEqual(200)
    expect(typeof response.text).toBe('string')
    const payload = jwt.decode(response.text)
    expect(payload.phone).toEqual(phone)
  })
  test('login fail with invalid account', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: '',
        password,
      })
    expect(response.statusCode).toEqual(401)
    expect(response.text).toEqual('USER_NOT_FOUND')
  })
  test('login fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: phone,
        password: '',
      })
    expect(response.statusCode).toEqual(401)
    expect(response.text).toEqual('PASSWORD_INCORRECT')
  })
})

describe('test get user operation', () => {
  let jwtTokenUser1
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()

    await request(app)
      .post('/api/users')
      .send(user0)
    await request(app)
      .post('/api/users')
      .send(user1)
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: user0.phone,
        password: user0.password,
      })
    jwtTokenUser1 = response.text
  })
  test('test get user data without authorization', async () => {
    const response = await request(app).get('/api/users/1')
    expect(response.statusCode).toEqual(401)
  })
  test('test get user data with authorization', async () => {
    const response = await request(app)
      .get('/api/users/0')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toHaveProperty('coin')
    expect(response.body).toHaveProperty('isChecked')
  })
  test("test get other user's data with authorization", async () => {
    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
    expect(response.statusCode).toEqual(200)
    expect(response.body).not.toHaveProperty('coin')
    expect(response.body).not.toHaveProperty('isChecked')
  })

  test('test get multiple valid user data', async () => {
    const response = await request(app)
      .get('/api/users?uid[]=0&uid[]=1&uid[]=2')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
    expect(response.body.length).toEqual(2)
    expect(response.statusCode).toEqual(200)
  })
  test('test get empty user data', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
    expect(response.statusCode).toEqual(400)
    expect(response.body).toEqual({})
  })
  test('test get  user data that does not exists', async () => {
    const response = await request(app)
      .get('/api/users?uid[]=11')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
    expect(response.statusCode).toEqual(404)
  })
})

describe('test udpate user operation', () => {
  let jwtTokenUser1
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()

    await Promise.all([
      request(app)
        .post('/api/users')
        .send(user0),
      request(app)
        .post('/api/users')
        .send(user1),
    ])
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: user0.phone,
        password: user0.password,
      })
    jwtTokenUser1 = response.text
  })

  test('test udpate data of its own', async () => {
    const response = await request(app)
      .patch('/api/users/0')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send({
        realname: 'abc',
      })
    expect(response.statusCode).toEqual(200)
    expect(response.body.realname).toEqual('abc')
  })
  test('test udpate data of its own with invalid data:', async () => {
    const response = await request(app)
      .patch('/api/users/0')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send({
        coin: 400,
      })
    expect(response.statusCode).toEqual(400)
    expect(response.text).toEqual('INVALID_PROPERTY')
  })
  test('test udpate data of other user', async () => {
    const response = await request(app)
      .patch('/api/users/1')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send({
        realname: 'abc',
      })
    expect(response.statusCode).toEqual(403)
  })
})

describe('test delete user operation', () => {
  let jwtTokenUser1
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await Promise.all([
      request(app)
        .post('/api/users')
        .send(user0),
      request(app)
        .post('/api/users')
        .send(user1),
    ])
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: user0.phone,
        password: user0.password,
      })
    jwtTokenUser1 = response.text
  })

  test('test delete other user', async () => {
    const response = await request(app)
      .delete('/api/users/1')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send()
    expect(response.statusCode).toEqual(403)
  })
  test('test delete user', async () => {
    const response = await request(app)
      .delete('/api/users/0')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send()
    expect(response.statusCode).toEqual(200)
  })
})

describe('test user check', () => {
  let jwtTokenUser1
  beforeAll(async () => {
    await mongoose.connection.db.dropDatabase()
    await request(app)
      .post('/api/users')
      .send(user0)
    const response = await request(app)
      .post('/api/users/login')
      .send({
        account: user0.phone,
        password: user0.password,
      })
    jwtTokenUser1 = response.text
  })
  test('test user check ', async () => {
    const response = await request(app)
      .post('/api/users/check')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send()
    expect(response.statusCode).toEqual(200)
  })
  test('test user check again', async () => {
    const response = await request(app)
      .post('/api/users/check')
      .set('Authorization', `Bearer ${jwtTokenUser1}`)
      .send()
    expect(response.statusCode).toEqual(404)
    expect(response.text).toEqual('ALREADY_CHECKED')
  })
})
