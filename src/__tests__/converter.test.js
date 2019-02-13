'use strict'

const { convertToMongoose } = require('../converter')

const subs = require('./schema1.json')
const comps = require('./schema2.json')
const hls = require('./schema3.json')

describe('Avro schema to mongoose tests', () => {
  test('It should convert the subscription avro schema to mongoose', () => {
    const mongooseSubs = convertToMongoose(subs)
    expect(mongooseSubs).toEqual({
      id: { type: String },
      previousId: { type: String },
      follows: { type: [{ id: { type: String }, type: { type: String } }] },
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
        type: [{ id: { type: String }, organizer: { type: Boolean } }],
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

  test.only('It should convert the hls avro schema to mongoose', () => {
    const mongooseComps = convertToMongoose(hls)
  })
})
