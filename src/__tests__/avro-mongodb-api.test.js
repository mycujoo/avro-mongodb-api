'use strict'

const _ = require('lodash')
const config = require('config')
const got = require('got')
const mongodbUri = require('mongodb-uri')
const { MongoClient } = require('mongodb')
const logger = require('@mycujoo/logger')
const { Producer } = require('@mycujoo/kafka-clients')

const { applyMagic } = require('../')
const uploadSchema = require('../uploadSchema')

const topic = `avro_mongodb_test-${Date.now()}_v2`

const schemaSet = {
  schema: require('./schema1.json'),
  uniqueProps: ['id'],
  modelName: 'Followers',
  topic,
}
const schemaSets = [schemaSet]

const gotInstance = got.extend({
  baseUrl: `http://localhost:${config.server.port}/api/v1`,
  json: true,
})

let producer

async function waitABit(abit) {
  await new Promise(resolve => {
    setTimeout(async () => {
      resolve()
    }, abit)
  })
}

beforeAll(async () => {
  await uploadSchema(topic, schemaSet.schema)
  const uri = mongodbUri.format(config.mongodb)
  const connection = await MongoClient.connect(uri)
  const db = await connection.db(config.mongodb.database)
  await db.dropDatabase()
  await connection.close()
  const { start, stop } = await applyMagic(logger, schemaSets, config)
  await start()
  producer = new Producer(_.extend({ topic }, config.kafka))
  await new Promise(resolve => {
    producer.once('ready', resolve)
  })
  afterAll(async () => {
    await stop()
  })
})

describe('The avro mongodb api tests', () => {
  it('should create a message on kafka and retrieve it via the api', async () => {
    jest.setTimeout(15000)
    await producer.produce({
      id: 'test1',
      previousId: null,
      follows: [{ id: 'follow1', type: 'team' }],
    })
    await waitABit(3000)
    const query = JSON.stringify({
      id: 'test1',
    })

    const res = await gotInstance.get(`Followers?query=${query}`)
    let follow = res.body[0]
    follow = _.omit(follow, '_id')
    follow.follows[0] = _.omit(follow.follows[0], '_id')

    expect(follow).toEqual({
      id: 'test1',
      __v: 0,
      follows: [{ id: 'follow1', type: 'team' }],
      previousId: null,
    })
  })
})
