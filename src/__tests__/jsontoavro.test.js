'use strict'

const { jsonToAvro } = require('../jsonToAvro')

describe.only('Avro schema to mongoose tests', () => {
  test('It should convert the highlight to avro', () => {
    const hl = {
      _id: 'cjsg44vwp0001cr88mfe3kkep',
      event: {
        id: 'cjsg44vst0000cr88768nlnfz',
      },
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
    }
    const avroHighlight = jsonToAvro(require('../__mocks__/schema4'), hl)
    expect(avroHighlight).toEqual({
      createdAt: 1550843428551,
      traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
      eventId: 'cjsg44vyf0004cr88qro9k8mv',
      deleted: false,
      primaryAnnotationId: {
        string: 'cjsg44vxp0002cr88iuh3ymff',
      },
      video: {
        HighlightVideoRecord: {
          imageUrl: null,
          videoUrl: null,
          duration: 500,
          position: 10,
        },
      },
      annotations: [
        {
          createdAt: 1550843428526,
          actions: [
            {
              ScoreChangeAction: {
                team: 'home',
                type: 'increased',
              },
            },
          ],
          personId: null,
          team: { TeamEnum: 'home' },
          type: { FootballAnnotationTypeEnum: 'goal' },
          elapsedTime: 10,
          id: 'cjsg44vxp0002cr88iuh3ymff',
        },
      ],
      event: { id: 'cjsg44vst0000cr88768nlnfz' },
      _id: 'cjsg44vwp0001cr88mfe3kkep',
    })
  })
})
