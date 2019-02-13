// 'use strict'

// const _ = require('lodash')
// const config = require('config')
// const got = require('got')
// const mongodbUri = require('mongodb-uri')
// const { MongoClient } = require('mongodb')
// const logger = require('@mycujoo/logger')
// const { Producer } = require('@mycujoo/kafka-clients')

// const { applyMagic } = require('../')
// const uploadSchema = require('../uploadSchema')

// const topic = `avro_mongodb_test-${Date.now()}_v2`

// const schemaSet = {
//   uniqueProps: ['id'],
//   modelName: 'Followers',
//   topic,
// }
// const schemaSets = [schemaSet]

// const gotInstance = got.extend({
//   baseUrl: `http://localhost:${config.server.port}/api/v1`,
//   json: true,
// })

// async function waitABit(abit) {
//   await new Promise(resolve => {
//     setTimeout(async () => {
//       resolve()
//     }, abit)
//   })
// }

// beforeAll(async () => {
//   await uploadSchema(topic, require('./schema1.json'))
//   const uri = mongodbUri.format(config.mongodb)
//   const connection = await MongoClient.connect(uri)
//   const db = await connection.db(config.mongodb.database)
//   await db.dropDatabase()
//   await connection.close()
//   const { start, stop } = await applyMagic(logger, schemaSets, config)
//   await start()

//   afterAll(async () => {
//     await stop()
//   })
// })

// describe('The avro mongodb api tests', () => {
//   it('should create a message on kafka and retrieve it via the api', async () => {
//     const producer = new Producer(_.extend({ topic }, config.kafka))
//     await new Promise(resolve => {
//       producer.once('ready', resolve)
//     })
//     jest.setTimeout(15000)
//     await producer.produce({
//       id: 'test1',
//       previousId: null,
//       follows: [{ id: 'follow1', type: 'team' }],
//     })
//     await waitABit(3000)
//     const query = JSON.stringify({
//       id: 'test1',
//     })

//     const res = await gotInstance.get(`Followers?query=${query}`)
//     let follow = res.body[0]

//     // Omit random generated _id props
//     follow = _.omit(follow, '_id')
//     follow.follows = _.map(follow.follows, follow => {
//       return _.omit(follow, '_id')
//     })

//     expect(follow).toEqual({
//       id: 'test1',
//       __v: 0,
//       follows: [{ id: 'follow1', type: 'team' }],
//       previousId: null,
//     })
//   })
// })
