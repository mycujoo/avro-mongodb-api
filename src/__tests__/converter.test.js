'use strict'
const mongoose = require('mongoose')
const { convertToMongoose, avroToJSON } = require('../converter')

const subs = require('./schema1.json')
const comps = require('./schema2.json')
const hl = require('./AvroHighlight.json')

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

  test('It should convert the HL doc properly to json', () => {
    const convertedHiglight = avroToJSON(hl)
    expect(convertedHiglight).toEqual({
      id: 'cjsg44vwp0001cr88mfe3kkep',
      event: 'cjsg44vst0000cr88768nlnfz',
      annotations: [
        {
          id: 'cjsg44vxp0002cr88iuh3ymff',
          elapsedTime: 10,
          type: 'goal',
          team: 'home',
          personId: null,
          actions: [
            {
              __type: 'ScoreChangeAction',
              type: 'increased',
              team: 'home',
            },
          ],
          createdAt: 1550843428526,
        },
      ],
      video: { position: 10, duration: 500, videoUrl: null, imageUrl: null },
      primaryAnnotationId: 'cjsg44vxp0002cr88iuh3ymff',
      deleted: false,
      eventId: 'cjsg44vyf0004cr88qro9k8mv',
      traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
      createdAt: 1550843428551,
    })
  })
})
