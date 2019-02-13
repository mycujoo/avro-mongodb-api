'use strict'

const config = require('config')
const got = require('got')

function uploadSchema(topic, schema) {
  const schemaName = `${topic}-value`

  const gotInstance = got.extend({
    baseUrl: config.kafka.avro.schemaRegistry,
    headers: {
      'Content-Type': 'application/vnd.schemaregistry.v1+json',
    },
  })

  const uri = `/subjects/${schemaName}/versions`
  const stringifiedSchema = JSON.stringify(JSON.stringify(schema))

  const payload = `{"schema":${stringifiedSchema}}`

  return gotInstance.post(uri, { body: payload })
}

module.exports = uploadSchema
