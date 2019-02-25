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
const hlTopic = `avro_mongodb_highlight-${Date.now()}_v2`

const schemaSet = {
  uniqueProps: ['id'],
  modelName: 'Followers',
  topic,
}

const highligthSchemaSet = {
  uniqueProps: ['id'],
  modelName: 'Highlights',
  topic: hlTopic,
}

const schemaSets = [highligthSchemaSet, schemaSet]

const gotInstance = got.extend({
  baseUrl: `http://localhost:${config.server.port}/api/v1`,
  json: true,
})

async function waitABit(abit) {
  await new Promise(resolve => {
    setTimeout(async () => {
      resolve()
    }, abit)
  })
}

beforeAll(async () => {
  await uploadSchema(`${topic}-value`, require('./schema1.json'))
  await uploadSchema(`${hlTopic}-value`, require('./highlight-value.json'))
  await uploadSchema(`${hlTopic}-key`, require('./highlight-key.json'))
  const uri = mongodbUri.format(config.mongodb)
  const connection = await MongoClient.connect(uri)
  const db = await connection.db(config.mongodb.database)
  await db.dropDatabase()
  await connection.close()
  const { start, stop } = await applyMagic(logger, schemaSets, config)
  await start()

  afterAll(async () => {
    await stop()
  })
})

describe('The avro mongodb api tests', () => {
  it('should create a message on kafka and retrieve it via the api', async () => {
    jest.setTimeout(15000)
    const producer = new Producer(_.extend({ topic }, config.kafka))

    await new Promise(resolve => {
      producer.once('ready', resolve)
    })

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

    // Omit random generated _id props
    follow = _.omit(follow, '_id')

    expect(follow).toEqual({
      id: 'test1',
      __v: 0,
      follows: [{ id: 'follow1', type: 'team' }],
      previousId: null,
    })
  })

  it('should create a HL on kafka and retrieve it via the api', async () => {
    jest.setTimeout(30000)
    const producer = new Producer(
      _.extend({ keyedMessages: true, topic: hlTopic }, config.kafka),
    )

    await new Promise(resolve => {
      producer.once('ready', resolve)
    })

    await producer.produce({
      key: 'cjsg44vwp0001cr88mfe3kkep',
      value: {
        id: 'cjsg44vwp0001cr88mfe3kkep',
        event: {
          id: 'cjsg44vst0000cr88768nlnfz',
        },
        annotations: [
          {
            id: 'cjsg44vxp0002cr88iuh3ymff',
            elapsedTime: 10,
            type: {
              FootballAnnotationTypeEnum: 'goal',
            },
            team: {
              TeamEnum: 'home',
            },
            personId: null,
            actions: [
              {
                ScoreChangeAction: {
                  type: 'increased',
                  team: 'home',
                },
              },
            ],
            createdAt: 1550843428526,
          },
        ],
        video: {
          HighlightVideoRecord: {
            position: 10,
            duration: 500,
            videoUrl: null,
            imageUrl: null,
          },
        },
        primaryAnnotationId: {
          string: 'cjsg44vxp0002cr88iuh3ymff',
        },
        deleted: false,
        eventId: 'cjsg44vyf0004cr88qro9k8mv',
        traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
        createdAt: 1550843428551,
      },
    })

    await waitABit(5000)
    const query = JSON.stringify({
      id: 'cjsg44vwp0001cr88mfe3kkep',
    })

    const res = await gotInstance.get(`Highlights?query=${query}`)

    let hl = res.body[0]

    // Omit random generated _id props
    hl = _.omit(hl, '_id')

    expect(hl).toEqual({
      id: 'cjsg44vwp0001cr88mfe3kkep',
      event: 'cjsg44vst0000cr88768nlnfz',
      annotations: [
        {
          id: 'cjsg44vxp0002cr88iuh3ymff',
          elapsedTime: 10,
          type: 'goal',
          team: 'home',
          personId: null,
          actions: [
            {
              __type: 'ScoreChangeAction',
              type: 'increased',
              team: 'home',
            },
          ],
          createdAt: 1550843428526,
        },
      ],
      video: { position: 10, duration: 500, videoUrl: null, imageUrl: null },
      primaryAnnotationId: 'cjsg44vxp0002cr88iuh3ymff',
      deleted: false,
      eventId: 'cjsg44vyf0004cr88qro9k8mv',
      traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
      createdAt: 1550843428551,
    })
  })
})
