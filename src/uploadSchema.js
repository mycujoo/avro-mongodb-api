'use strict'

const config = require('config')
const debug = require('debug')('avro-mongodb-api:uploadSchema')
const got = require('got')

async function uploadSchema(topic, schema) {
  const gotInstance = got.extend({
    baseUrl: config.avro.schemaRegistry,
    headers: {
      'Content-Type': 'application/vnd.schemaregistry.v1+json',
    },
  })

  const uri = `/subjects/${topic}/versions`
  const stringifiedSchema = JSON.stringify(JSON.stringify(schema))

  const payload = `{"schema":${stringifiedSchema}}`
  debug(`Uploading avro schema to uri`, uri)
  debug(`Uploading avro schema payload`, payload)
  const res = await gotInstance.post(uri, { body: payload })
  debug(`Uploaded avro schema, response:`, res)
}

module.exports = uploadSchema
