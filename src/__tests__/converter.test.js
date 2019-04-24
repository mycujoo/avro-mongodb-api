'use strict'
const mongoose = require('mongoose')
const { convertToMongoose } = require('../converter')

const subs = require('./schema1.json')
const comps = require('./schema2.json')

describe('Avro schema to mongoose tests', () => {
  test('It should convert the subscription avro schema to mongoose', () => {
    const mongooseSubs = convertToMongoose(subs)
    expect(mongooseSubs).toEqual({
      id: { type: String },
      previousId: { type: String },
      follows: { type: [mongoose.Schema.Types.Mixed] },
    })
  })
  test('It should convert the competitions avro schema to mongoose', () => {
    const mongooseComps = convertToMongoose(comps)
    expect(mongooseComps).toEqual({
      active: { type: Boolean },
      ageCategories: { type: String },
      competitionDisciplines: { type: String },
      competitionGenders: { type: String },
      competitionSports: { type: String },
      createdAt: { type: Number },
      description: { type: String },
      division: { type: String },
      entities: {
        type: [mongoose.Schema.Types.Mixed],
      },
      eventId: { type: String },
      id: { type: String },
      internationalName: { type: String },
      localLanguage: { type: String },
      localName: { type: String },
      logoUrl: { type: String },
      shortName: { type: String },
      traceToken: { type: String },
    })
  })
})
