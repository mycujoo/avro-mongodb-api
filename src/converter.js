'use strict'

const _ = require('lodash')
const debug = require('debug')('avro-mongodb-api:converter')
const got = require('got')
const mongoose = require('mongoose')

async function getSchemaForTopic({ logger, schemaRegistry, topic }) {
  const url = `${schemaRegistry}/subjects/${topic}-value/versions/latest`

  logger.info(`Getting value schema for topic ${topic}`)

  debug('Getting schema from registry')
  const response = await got.get(url, { json: true })
  debug('Schema registry response', response)
  const subject = response.body

  if (!subject || !subject.schema)
    throw new Error(
      `No schema found in registry ${schemaRegistry} for topic: ${topic}`,
    )
  logger.info(
    `Using value schema for topic ${topic} version: ${subject.version}, id: ${
      subject.id
    }`,
  )
  return JSON.parse(subject.schema)
}

function convertToMongoose({ name, fields }) {
  const res = _.map(fields, getField)
  return _.reduce(
    res,
    (m, c, v) => {
      return _.extend(m, c)
    },
    {},
  )
}

function getField({ name, type, doc, items, fields }) {
  if (typeof type === 'object' && !Array.isArray(type))
    return getFieldTypeFromObject(type, name, items)

  return Array.isArray(type)
    ? getArrayType(type, items, name)
    : getFlatType(type, items, fields, name)
}

function getFieldTypeFromObject(obj, nm) {
  const { name, type, items } = obj
  if (type === 'array') {
    return getFlatType(type, items, null, nm)
  }

  return getField({ name, type, items })
}

function getArrayType(type, items, name) {
  const realType = _.find(type, item => {
    return item !== 'null'
  })
  if (typeof realType === 'object') {
    if (realType.type) {
      return getFlatType(realType.type, realType.items, null, name)
    } else throw new Error(`Failed to parse this union ${name}`)
  }

  return getFlatType(realType, items, null, name)
}

function getFlatType(type, items, fields, name) {
  switch (type) {
    case 'string':
      return wrapInObject(name, String)
    case 'int':
      return wrapInObject(name, Number)
    case 'double':
      return wrapInObject(name, Number)
    case 'boolean':
      return wrapInObject(name, Boolean)
    case 'long':
      return wrapInObject(name, Number)
    case 'array':
      return wrapInObject(name, [mongoose.Schema.Types.Mixed])
    case 'enum':
      return wrapInObject(name, String)
    case 'record':
      return convertToMongoose({ fields })
    default:
      throw new Error(`Unknown flat type: ${JSON.stringify(type)}`)
  }
}

function wrapInObject(k, v) {
  const obj = {}
  obj[k] = { type: v }
  return obj
}

async function convert(
  kafka,
  logger,
  { uniqueProps, modelName, topic, indexes, postSave, preSave },
) {
  const schema = await getSchemaForTopic({
    topic: topic,
    schemaRegistry: kafka.avro.schemaRegistry,
    logger,
  })
  debug(`${modelName} received schema`, schema)

  const mongooseSchema = convertToMongoose(schema)
  _.each(uniqueProps, prop => {
    mongooseSchema[prop].unique = true
  })
  debug(`${modelName} build mongoose schema`, schema)

  return {
    modelName,
    topic,
    schema: mongooseSchema,
    uniqueProps,
    indexes,
    postSave,
    preSave,
  }
}

module.exports = {
  convert,
  convertToMongoose,
  getArrayType,
  getField,
  getFieldTypeFromObject,
  getFlatType,
  wrapInObject,
}
