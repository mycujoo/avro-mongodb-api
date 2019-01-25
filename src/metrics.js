'use strict'

const Prometheus = require('prom-client')
const compression = require('compression')
const express = require('express')
const http = require('http')

function getMetrics(options, serverApp) {
  const app = express()
  app.use(compression())
  const server = http.createServer(app)

  app.get('/metrics', async (req, res) => {
    return res.status(200).send(Prometheus.register.metrics())
  })
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

  const { name, version } = options

  const queryCounter = new Prometheus.Counter({
    name: `${name}_request_counter`,
    labelNames: ['version', 'path'],
    help: `Number ${name} requests`,
  })

  const errorCounter = new Prometheus.Counter({
    name: `${name}_error_counter`,
    labelNames: ['version', 'path'],
    help: `Number ${name} errors`,
  })

  serverApp.use(async (req, res, next) => {
    const basepath = req.path

    queryCounter.labels(version, basepath).inc(1)

    res.once('finish', () => {
      if (res.statusCode !== 304 && res.statusCode !== 200)
        errorCounter.labels(version, basepath).inc(1)
    })
    next()
  })

  return { metricServer: server, errorCounter }
}

module.exports = { getMetrics }
