'use strict'

const _ = require('lodash')
const config = require('config')
const logger = require('@mycujoo/logger')
const { Producer } = require('@mycujoo/kafka-clients')

const { applyMagic } = require('../')
const uploadSchema = require('../uploadSchema')

const topic = 'fun_subscriptions_subscription-updated_v2'

const schemaSet = {
  schema: require('./schema1.json'),
  uniqueProps: ['id'],
  modelName: 'Followers',
  topic,
}
const schemaSets = [schemaSet]

let stopServers
let producer

beforeAll(async () => {
  const { start, stop } = await applyMagic(logger, schemaSets, config)
  stopServers = stop
  await start()
  await uploadSchema(topic, schemaSet.schema)
  producer = new Producer(_.extend({ topic }, config.kafka))
  await new Promise(resolve => {
    producer.once('ready', resolve)
  })
})

afterAll(async () => {
  await stopServers()
})

describe('The avro mongodb api tests', () => {})
