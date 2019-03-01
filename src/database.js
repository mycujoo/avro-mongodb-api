'use strict'

const debug = require('debug')('avro-mongodb-api:database')
const mongoose = require('mongoose')
const mongodbUri = require('mongodb-uri')

async function connectMongoose({ mongodb, logger, errorCounter, version }) {
  const reconnect = () => {
    logger.error('Mongodb reconnection in 2 seconds...')
    errorCounter.labels(version, 'connection').inc(1)
    setTimeout(
      connectMongoose.bind(null, { mongodb, logger, errorCounter, version }),
      2000,
    )
  }

  try {
    const uri = mongodbUri.format(mongodb)
    debug('Database connection to uri', uri)
    const { connection } = await mongoose.connect(uri, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })

    logger.info('Mongodb connected to', uri)
    connection.once('disconnected', reconnect)
  } catch (error) {
    logger.error('Mongodb failed to connect', error.message)
    reconnect()
  }
}

module.exports = { connectMongoose }
