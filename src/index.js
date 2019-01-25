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

const { convert } = require('./converter')
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
    schemas = _.map(schemas, convert)

    const app = express()
      .use(compression())
      .use(bodyParser.json())
      .use(methodOverride())

    if (redis) app.use(ExpressCache(redis))

    const router = express.Router()

    const { metricServer, errorCounter } = getMetrics(metrics, app)

    await connectMongoose({
      mongodb,
      logger,
      errorCounter,
      version: metrics.version,
    })

    const models = _.map(
      schemas,
      ({ modelName, schema, topic, uniqueProps }) => {
        const model = mongoose.model(
          modelName,
          new mongoose.Schema(schema, { strict: false }),
        )

        restify.serve(router, model, {
          postRead: cache
            ? (req, res, next) => {
                if (req.erm.statusCode !== 200) return next()
                if (req.originalMethod !== 'GET') return next()

                res.setHeader('Cache-Control', `max-age=${cache.ttl}`)

                next()
              }
            : null,
        })

        const kafkaOpts = _.cloneDeep(kafka)
        kafkaOpts.consumer.topics = [topic]

        const consumer = new Consumer(kafkaOpts)

        consumer.pipe(
          new Writable({
            objectMode: true,
            write: (doc, enc, cb) => {
              const query = _.pick(doc, uniqueProps)
              model.findOneAndUpdate(query, doc, { upsert: true }, cb)
            },
          }),
        )
      },
    )

    app.use(router)

    const appServer = getServer(app, server)

    const start = async () => {
      await appServer.listen(server)
      logger.info(`App server listen at ${server.port}`)
      if (metricServer) {
        await metricServer.listen(metrics)
        logger.info(`Metrics server listen at ${metrics.port}`)
      }
    }

    const stop = async () => {
      await appServer.close()
      logger.info(`App server closed`)
      if (metricServer) {
        await metricServer.close()
        logger.info(`Metrics server closed`)
      }
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
