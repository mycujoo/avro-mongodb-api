'use strict'

const _ = require('lodash')

function jsonToAvro(schema, object) {
  const res = processRecord(object, schema)
  const doc = res[schema.name]
  console.log('doc', doc.annotations[0])
  console.log('doc', doc)
  console.log('doc', doc.annotations[0])

  return doc
}

module.exports = {
  jsonToAvro,
}

function processField(json, { name, doc, type }) {
  const options = {
    string: value => {
      return value
    },
    enum: value => {
      return value
    },
    boolean: value => {
      return value
    },
    long: value => {
      return value
    },
    int: value => {
      return value
    },
    array: value => {},
    object: value => {},
  }

  const option = options[type]

  if (option) {
    const obj = {}
    obj[name] = options[type](json)
    return obj
  }
  if (Array.isArray(type)) {
    const obj = {}
    obj[name] = processArrayType(json, type)
    return obj
  }
  if (typeof type === 'object' && type.type) {
    if (type.type === 'record') {
      const obj = {}
      if (type.items) {
        obj[name] = _.map(type.items, processRecord.bind(json))
      } else {
        const rec = processRecord(json, type)
        obj[name] = rec[type.name]
      }
      return obj
    }

    if (type.type === 'array') {
      const obj = {}
      obj[name] = _.map(json, item => {
        const rec = processRecord(item, type.items)
        return rec[type.items.name]
      })
      return obj
    }
  }
  throw new Error(`Found an unknown avro type: ${JSON.stringify(type)}`)
}

function processRecord(json, { type, name, doc, fields }) {
  const obj = {}
  obj[name] = _.reduce(
    fields,
    (m, field) => {
      const res = processField(json[field.name], field)
      return _.assign(res, m)
      // const obj = {}
      // console.log('key', key)
      // console.log('json[key]', json[key])
      // const doc = processField(json[key], value)
      // obj[key] = doc
      // return _.assign(obj, m)
    },
    {},
  )
  return obj
}

function processArrayType(json, array) {
  const nulllessArray = _.without(array, 'null')

  if (nulllessArray.length === 1) {
    const obj = {}
    if (typeof nulllessArray[0] !== 'object') obj[nulllessArray[0]] = json
    // if (typeof nulllessArray[0].type == ret) obj[nulllessArray[0]] = json
    else {
      return processRecord(json, nulllessArray[0])
    }
    return obj
  }
  return console.log('omg we have a bigger array then expected')
}
