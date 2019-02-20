# avro-mongodb-api

## TODO:
Implement format function for schema's with custom typed unions. Or the intelligence to parse it on our own. 
Expand docs.
Expand testing

## What does it do
When you configure the avro-mongodb-api properly and give it a topic, it will do the following things:
* Download the schema from the schemaregistry and create a mongodb schema.
* It will setup a consumer for the topic and consume it's data into the database. The configuration option uniqueProps will determine if a message on the topic is an update or new document. E.g if two items come by with the same uniqueProp the last received item will be stored in the database and retrievable through the API.
* Setup up an API that you can query to retrieve the data, optionally cached with redis. 
* Setup a http server to host prometheus metrics. Error and request counters will be available at path /metrics
* You can supply your own logger, it must have an info and error function.

## How to query

https://florianholzapfel.github.io/express-restify-mongoose/#querying

## Example

There is a compose file included in this library that will setup your local zookeeper, kafka broker, schema registry, mongodb and redis. Don't forget to upload your kafka avro schema to the registry before running this lib!

```javascript
'use strict'

const { applyMagic } = require('@mycujoo/avro-mongodb-api')
const logger = require('@mycujoo/logger')

const topic = 'cmm_profiles_profile-updated_v2'

const config = {
  mongodb: {
    hosts: [{ host: 'localhost', port: 27017 }],
    database: topic,
    options: {},
  },
  server: {
    host: '0.0.0.0',
    port: 54321,
  },
  kafka: {
    topic,
    avro: {
      broker: 'localhost:9092',
      schemaRegistry: 'http://localhost:8081',
      parseOptions: {
        wrapUnions: true,
      },
    },
    consumer: {
      topicOptions: {
        'auto.offset.reset': 'earliest',
      },
      broker: {
          'group.id': 'profs-0',
          'metadata.broker.list': `localhost:9092`,
        },
    },
  },
  metrics: {
    name: 'myapi',
    version: '1.0.0',
    host: '0.0.0.0',
    port: 10255,
  },
  redis: {
    host: 'localhost',
    port: 6379,
    ttl: 630,
  },
  cache: {
    ttl: 630,
  },
}

applyMagic(
  logger,
  [
    {
      uniqueProps: [ 'id' ],
      modelName: 'MyModel',
      topic: config.kafka.topic,
    },
  ],
  config,
).then(async ({ start }) => {
  await start()
})

```

## Configuration options