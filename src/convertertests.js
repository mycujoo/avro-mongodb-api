'use strict'

const { avroToJSON } = require('./converter')

const doc = {
  id: 'cjsg44vwp0001cr88mfe3kkep',
  event: {
    id: 'cjsg44vst0000cr88768nlnfz',
  },
  annotations: [
    {
      id: 'cjsg44vxp0002cr88iuh3ymff',
      elapsedTime: 10,
      type: {
        FootballAnnotationTypeEnum: 'goal',
      },
      team: {
        TeamEnum: 'home',
      },
      personId: null,
      actions: [
        {
          ScoreChangeAction: {
            type: 'increased',
            team: 'home',
          },
        },
      ],
      createdAt: 1550843428526,
    },
  ],
  video: {
    HighlightVideoRecord: {
      position: 10,
      duration: 500,
      videoUrl: null,
      imageUrl: null,
    },
  },
  primaryAnnotationId: {
    string: 'cjsg44vxp0002cr88iuh3ymff',
  },
  deleted: false,
  eventId: 'cjsg44vyf0004cr88qro9k8mv',
  traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
  createdAt: 1550843428551,
}

const res = avroToJSON(doc)
// console.log('res', res)

// const shouldBe = {
//   id: 'cjsg44vwp0001cr88mfe3kkep',
//   event: 'cjsg44vst0000cr88768nlnfz',
//   annotations: [
//     {
//       id: 'cjsg44vxp0002cr88iuh3ymff',
//       elapsedTime: 10,
//       type: 'goal',
//       team: 'home',
//       personId: null,
//       actions: [
//         {
//           id: 'cjsg44vxp0002cr88iuh3ymff',
//           elapsedTime: 10,
//           type: 'goal',
//           team: 'home',
//           personId: null,
//           actions: [
//             { __type: 'ScoreChangeAction', type: 'increased', team: 'home' },
//           ],
//           createdAt: 1550843428526,
//         },
//       ],
//       createdAt: 1550843428526,
//     },
//   ],
//   video: { position: 10, duration: 500, videoUrl: null, imageUrl: null },
//   primaryAnnotationId: 'cjsg44vxp0002cr88iuh3ymff',
//   deleted: false,
//   eventId: 'cjsg44vyf0004cr88qro9k8mv',
//   traceToken: 'cjsg44vyf0005cr88k2b7b9pc',
//   createdAt: 1550843428551,
// }
