'use strict'

const serverPort = process.env.SERVER_PORT || 3007
const metricsPort = process.env.METRICS_PORT || 10257

module.exports = {
  server: {
    host: '0.0.0.0',
    port: serverPort,
  },
  metrics: {
    name: 'avroMongodbApi',
    version: 1,
    host: '0.0.0.0',
    port: metricsPort,
  },
  mongodb: {
    hosts: [{ host: 'localhost', port: 27017 }],
    database: 'test_database',
    options: {},
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: null,
    ttl: 10,
  },
  kafka: {
    avro: {
      broker: 'localhost:9092',
      schemaRegistry: 'http://localhost:8081',
    },
    producer: { 'metadata.broker.list': `localhost:9092` },
    consumer: {
      parseToJson: true,
      topicOptions: {
        'auto.offset.reset': 'earliest',
      },
      broker: {
        'group.id': 'test5',
        'metadata.broker.list': 'localhost:9092',
      },
    },
  },
  cache: {
    ttl: 60,
  },
}
