'use strict'

module.exports = {
  mongodb: {
    hosts: [
      {
        host: 'mongodb',
        port: 27017,
      },
    ],
  },
  kafka: {
    avro: {
      schemaRegistry: 'http://schema-registry:8081',
      broker: 'broker:9092',
    },
    producer: {
      'metadata.broker.list': 'broker:9092',
      'partition.assignment.strategy': 'roundrobin',
    },
    consumer: {
      topicOptions: {
        'auto.offset.reset': 'earliest',
      },
      broker: {
        'group.id': 'test',
        'metadata.broker.list': 'broker:9092',
      },
    },
  },
  redis: {
    host: 'redis',
  },
}
