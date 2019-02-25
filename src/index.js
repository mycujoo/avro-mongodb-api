'use strict'

const _ = require('lodash')
const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const http = require('http')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
const { Consumer } = require('@mycujoo/kafka-clients')
const { Writable } = require('stream')
const ExpressCache = require('@mycujoo/express-cache')

const { convert, avroToJSON } = require('./converter')
const { connectMongoose } = require('./database')
const { getMetrics } = require('./metrics')

function getServer(app, options) {
  const server = http.createServer(app)
  const listen = server.listen.bind(server)
  const close = server.close.bind(server)

  server.close = () => {
    return new Promise((resolve, reject) => {
      close(resolve)
    })
  }

  server.listen = options => {
    return new Promise((resolve, reject) => {
      listen(options, resolve)
    })
  }

  return server
}

module.exports = {
  applyMagic: async (
    logger,
    schemas,
    { mongodb, kafka, cache, server, metrics, redis },
  ) => {
    // Convert all configured schemas/topics to mongoose schema's
    schemas = await Promise.all(
      _.map(schemas, convert.bind(null, kafka, logger)),
    )

    // Setup an express app and http server
    const app = express()
      .use(compression())
      .use(bodyParser.json())
      .use(methodOverride())

    // Use caching middleware if redis is configured
    if (redis) app.use(ExpressCache(redis))

    const router = express.Router()

    // Setup a metrics server
    const { metricServer, errorCounter } = getMetrics(metrics, app)

    // Connect to mongodb
    await connectMongoose({
      mongodb,
      logger,
      errorCounter,
      version: metrics.version,
    })

    // Create mongoose models and setup their API endpoints.
    const models = _.map(
      schemas,
      ({ modelName, schema, topic, uniqueProps, indexes = [] }) => {
        const mongooseSchema = new mongoose.Schema(schema, { strict: false })
        _.each(indexes, index => {
          mongooseSchema.index.apply(mongooseSchema, index)
        })
        const model = mongoose.model(modelName, mongooseSchema)

        restify.serve(router, model, {
          // Add cache-control headers incase cache was configured
          // Can improve naming and options here
          postRead: cache
            ? (req, res, next) => {
                if (req.erm.statusCode !== 200) return next()
                if (req.originalMethod !== 'GET') return next()

                res.setHeader('Cache-Control', `max-age=${cache.ttl}`)

                next()
              }
            : null,
        })
        logger.info(
          `REST API for ${modelName} available at http://${server.host}:${
            server.port
          }/api/v1/${modelName}`,
        )

        // Configure the kafka consumer
        const kafkaOpts = _.cloneDeep(kafka)
        kafkaOpts.consumer.topics = [topic]

        const consumer = new Consumer(kafkaOpts)

        consumer
          .on('error', error => {
            logger.error(error)
          })
          .once('ready', () => {
            logger.info('Kafka consumer is ready')
          })
          .pipe(
            new Writable({
              objectMode: true,
              write: (doc, enc, cb) => {
                const data = avroToJSON(doc)
                const query = _.pick(data, uniqueProps)
                model.findOneAndUpdate(query, data, { upsert: true }, cb)
              },
            }),
          )
        return model
      },
    )
    // Finish setting up the http API
    app.use(router)

    const appServer = getServer(app, server)

    const start = async () => {
      await appServer.listen(server)
      logger.info(`App server listen at ${server.port}`)
      await metricServer.listen(metrics)
      logger.info(`Metrics server listen at ${metrics.port}`)
    }

    const stop = async () => {
      await appServer.close()
      logger.info(`App server closed`)
      await metricServer.close()
      logger.info(`Metrics server closed`)
    }

    return {
      models,
      router,
      server: appServer,
      metrics: metricServer,
      start,
      stop,
    }
  },
}
