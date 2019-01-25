'use strict'
const _ = require('lodash')

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
  return getFlatType(realType, items, null, name)
}

function getFlatType(type, items, fields, name) {
  switch (type) {
    case 'string':
      return wrapInObject(name, String)
    case 'int':
      return wrapInObject(name, Number)
    case 'boolean':
      return wrapInObject(name, Boolean)
    case 'long':
      return wrapInObject(name, Number)
    case 'array':
      return wrapInObject(name, [convertToMongoose(items)])
    case 'enum':
      return wrapInObject(name, String)
    case 'record':
      return convertToMongoose({ fields })
    default:
      throw new Error(`Unknown flat type: ${type}`)
  }
}

function wrapInObject(k, v) {
  const obj = {}
  obj[k] = { type: v }
  return obj
}

function convert({ schema, uniqueProps, modelName, topic }) {
  const mongooseSchema = convertToMongoose(schema)
  _.each(uniqueProps, prop => {
    mongooseSchema[prop].unique = true
  })
  return { modelName, topic, schema: mongooseSchema, uniqueProps }
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
