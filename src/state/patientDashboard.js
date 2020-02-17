import request from 'superagent'
import keyBy from 'lodash/keyBy'
import groupBy from 'lodash/groupBy'
import flatMap from 'lodash/flatMap'
import map from 'lodash/map'
import dayjs  from 'dayjs'
import { createSelector } from 'reselect'
import { rj } from 'redux-rocketjump'
import { extent } from 'd3'
import rjPosArgs from 'redux-rocketjump/plugins/positionalArgs'
import rjMap from 'redux-rocketjump/plugins/map'
import combineRjs from 'redux-rocketjump/plugins/combine'
import { authApiCall, withToken } from './auth'
import { API_URL } from '../consts'
import { DATE_FORMAT } from '../consts'
import { isTSAnyKeyword } from '@babel/types';

const config = {}

const GET_PATIENT_WIDGETS = 'GET_PATIENT_WIDGETS'
config.widgets = rj(rjPosArgs(), {
  type: GET_PATIENT_WIDGETS,
  api: t => id => withToken(t, request.get(`${API_URL}/patients/${id}/widgets`))
    .then(({ body }) => body)
})

const GET_PATIENT_DAILY_ACTIVITIES = 'GET_PATIENT_DAILY_ACTIVITIES'
config.dailyActivities = rj(rjPosArgs(), {
  type: GET_PATIENT_DAILY_ACTIVITIES,
  api: t => (id, { from_date, to_date }) => withToken(t, request.get(`${API_URL}/patients/${id}/daily_activities`))
    .query({ from_date, to_date })
    .then(({ body }) => {
      const sessionsByDate = keyBy(body, 'date')
      const start = dayjs(from_date, DATE_FORMAT)
      const startMonth = start.month()

      let sessions = []
      let current = start.clone()
      while (startMonth === current.month()) {
        const date = current.format(DATE_FORMAT)
        if (sessionsByDate[date]) {
          sessions.push(sessionsByDate[date])
        } else {
          sessions.push({
            date,
            sessions_count: 0,
            badges: false,
          })
        }
        current = current.add(1, 'days')
      }
      return sessions
    })
})

const GET_PATIENT_STATS = 'GET_PATIENT_STATS'
config.stats = rj(rjPosArgs(), {
  type: GET_PATIENT_STATS,
  api: t => (id, days ) => withToken(t, request.get(`${API_URL}/patients/${id}/stats`))
    .query({ days })
    .then(({ body }) => body)
})

const GET_PATIENT_BADGES = 'GET_PATIENT_BADGES'
config.badges = rj(rjPosArgs(), {
  type: GET_PATIENT_BADGES,
  api: t => (id) => withToken(t, request.get(`${API_URL}/patients/${id}/badges`))
    // .query()
    .then(({ body }) => body)
})

const GET_PATIENT_AVAILABLE_LEVELS = 'GET_PATIENT_AVAILABLE_LEVELS'
config.availableLevels = rj(rjPosArgs(), {
  type: GET_PATIENT_AVAILABLE_LEVELS,
  api: t => (id) => withToken(t, request.get(`${API_URL}/patients/${id}/available_levels`))
    .then(({ body }) => body)
})

const GET_AVAILABLE_EXERCISE_TREES = 'GET_AVAILABLE_EXERCISE_TREES '
config.availableExerciseTrees = rj(rjPosArgs(), {

  composeReducer: [(prevState, { type, payload, meta} ) => {
    if(type === 'PUT_EXERCISE_TREE_SUCCESS'){
      return {
        ...prevState,
        data: prevState.data.map(exercise => {
          if(exercise.exercise_tree.id === meta.id){
            return {...exercise, completed:payload.data.completed, force_completed:payload.data.force_completed}
          }
          return exercise
        })
      }
    }
    return prevState
  }],

  proxySelectors: {
    getExtent: ({ getData }) => createSelector(
      getData,
      tree => {
        if (tree === null) {
          return null
        }
        const allSessions = flatMap(tree, tree => tree.cognitive_sessions)
        const sessionsExtent = extent(allSessions, s => s.average_selection_speed_ms)
        return sessionsExtent
      }
    ),
    getGrouped: ({ getData }) => createSelector(
      getData,
      tree => {
        if (tree === null) {
          return null
        }
        const byBox = groupBy(tree, 'exercise_tree.box_id')
        const grouppedTree = map(byBox, treeByBox => {
          const box = {
            box_id: treeByBox[0].exercise_tree.box_id,
            box_name: treeByBox[0].exercise_tree.box_name,
          }
          const treeByBoxGrouped = map(
            groupBy(treeByBox, 'exercise_tree.target_id'),
            treeByTarget => {
              const target = {
                target_id: treeByTarget[0].exercise_tree.target_id,
                target_name: treeByTarget[0].exercise_tree.target_name,
              }
              return {
                target,
                tree: treeByTarget,
              }
            }
          )

          return {
            box,
            tree: treeByBoxGrouped,
          }
        })
        return grouppedTree
      }
    )
  },
  type: GET_AVAILABLE_EXERCISE_TREES,
  api: t => (id, levelId) => withToken(t, request.get(`${API_URL}/patients/${id}/levels/${levelId}/available_exercise_trees`))
    .then(({ body }) => body)
})

const GET_SESSION_FOR_TOOLTIP = 'GET_SESSION_FOR_TOOLTIP'
config.tooltipSessions = rj(rjMap(), {
  type: GET_SESSION_FOR_TOOLTIP,
  proxyActions: ({ loadKey }) => ({
    loadEx: (patientId, sessionId) => loadKey(sessionId, {
      patientId,
      sessionId,
    })
  }),
  api: t => ({ patientId, sessionId }) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/cognitive_sessions/${sessionId}`))
      .then(({ body }) => body)
})

const GET_EXERCISE_TREE = 'GET_EXERCISE_TREE'
config.exerciseTree = rj(rjPosArgs(), {
  type: GET_EXERCISE_TREE,
  api: t => (patientId, exerciseTreeId) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/available_exercise_trees/${exerciseTreeId}`))
      .then(({ body }) => body)
})


const PUT_EXERCISE_TREE = 'PUT_EXERCISE_TREE'
config.putExerciseTree = rj(
  rjMap({
    keepSucceded: false,
  }),
  {
  type: PUT_EXERCISE_TREE,
  proxyActions: ({ loadKey }) => ({
    putExerciseTree: (patientId, exerciseTreeId, exerciseTree) => loadKey(exerciseTreeId, {
      patientId,
      exerciseTreeId,
      exerciseTree,
    })
  }),
  api: t => ({patientId, exerciseTreeId, exerciseTree}) =>

    /*new Promise((resolve, reject) => {
      resolve({
        ...exerciseTree
      })
    })*/

    withToken(t, request.patch(`${API_URL}/patients/${patientId}/available_exercise_trees/${exerciseTreeId}`))
       .send(exerciseTree)
       .then(({ body }) => body)
})

const GET_SESSION_FOR_PLAYER = 'GET_SESSION_FOR_PLAYER'
config.playerSessions = rj(rjMap(), {
  type: GET_SESSION_FOR_PLAYER,
  proxyActions: ({ loadKey }) => ({
    loadForSession: (patientId, sessionId) => loadKey(sessionId, {
      patientId,
      sessionId,
    })
  }),
  api: t => ({ patientId, sessionId }) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/training_sessions/${sessionId}`))
      .query({ detailed: 'true' })
      .then(({ body }) => body)
})

const GET_SESSION_EVENTS_PLAYER = 'GET_SESSION_EVENTS_PLAYER'
config.sessionEventsForPlayer = rj(rjMap(), {
  type: GET_SESSION_EVENTS_PLAYER,
  proxyActions: ({ loadKey }) => ({
    loadForSession: (patientId, sessionId) => loadKey(sessionId, {
      patientId,
      sessionId,
    })
  }),
  api: t => ({ patientId, sessionId }) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/training_sessions/${sessionId}/session_events`))
      .query({ detailed: 'true' })
      .then(({ body }) => body)
})

const GET_SESSION_TRACKING_PLAYER = 'GET_SESSION_TRACKING_PLAYER'
config.sessionTrackingForPlayer = rj(rjMap(), {
  type: GET_SESSION_TRACKING_PLAYER,
  proxyActions: ({ loadKey }) => ({
    loadForSession: (patientId, sessionId) => loadKey(sessionId, {
      patientId,
      sessionId,
    })
  }),
  api: t => ({ patientId, sessionId }) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/training_sessions/${sessionId}/tracker_raw_data`))
      .then(({ body }) => body)
})

const GET_COMUNICATIVE_SESSIONS = 'GET_COMUNICATIVE_SESSIONS'
config.comunicativeSessions = rj(rjPosArgs(), {
  type: GET_COMUNICATIVE_SESSIONS,
  api: t => (patientId) =>
    withToken(t, request.get(`${API_URL}/patients/${patientId}/training_sessions`))
      .query({ type: 'CommunicationSession' })
      .then(({ body }) => body)
})

const GET_GEO_STATS = 'GET_GEO_STATS'
config.geoStats = rj(rjPosArgs(), {
  type: GET_GEO_STATS,
  api: t => (params = {}) =>
    withToken(t, request.get(`${API_URL}/georeferenced_stats`))
      .query(params)
      .then(({ body }) => body)
})

export const {
  connect: {
    widgets: {
      actions: {
        load: loadPatientWidgets,
        unload: unloadPatientWidgets,
      },
      selectors: {
        getData: getPatientWidgets,
      },
    },
    dailyActivities: {
      actions: {
        load: loadPatientActivities,
        unload: unloadPatientActivities,
      },
      selectors: {
        getData: getPatientActivities,
      },
    },
    stats: {
      actions: {
        load: loadPatientStats,
        unload: unloadPatientStats,
      },
      selectors: {
        getData: getPatientStats,
      },
    },
    badges: {
      actions: {
        load: loadPatientBadges,
        unload: unloadPatientBadges,
      },
      selectors: {
        getData: getPatientBadges,
      },
    },
    availableLevels: {
      actions: {
        load: loadPatientAvailableLevels,
        unload: unloadPatientAvailableLevels,
      },
      selectors: {
        getData: getPatientAvailableLevels,
      }
    },
    availableExerciseTrees: {
      actions: {
        load: loadAvailableExerciseTrees,
        unload: unloadAvailableExerciseTrees,
      },
      selectors: {
        // getData: getAvailableExerciseTrees,
        getExtent: getSessionsExtent,
        getGrouped: getAvailableExerciseTreesGrouped,
      }
    },
    tooltipSessions: {
      actions: {
        loadEx: loadSessionForTooltip,
        unload: unloadAllSessionsForTooltip,
      },
      selectors: {
        getMapData: getSessionsForTooltip,
      }
    },
    exerciseTree: {
      actions: {
        load: loadExerciseTree,
        unload: unloadExerciseTree,
      },
      selectors: {
        getData: getExerciseTree,
      }
    },

    putExerciseTree: {
      actions: {
        putExerciseTree
      },
      selectors: {
        getMapLoadings: getPutExerciseTreeUpdating,
      }
    },

    sessionEventsForPlayer: {
      actions: {
        loadForSession: loadSessionEventsForPlayer,
        unloadKey: unloadSessionEventsForPlayer,
      },
      selectors: {
        getMapData: getSessionsEventsForPlayer,
      }
    },
    sessionTrackingForPlayer: {
      actions: {
        loadForSession: loadSessionTrackingForPlayer,
        unloadKey: unloadSessionTrackingorPlayer,
      },
      selectors: {
        getMapData: getSessionsTrackingForPlayer,
      }
    },
    playerSessions: {
      actions: {
        loadForSession: loadSessionForPlayer,
        unloadKey: unloadSessionForPlayer,
      },
      selectors: {
        getMapData: getSessionsForPlayer,
      }
    },
    comunicativeSessions: {
      actions: {
        load: loadComunicativeSessions,
        unload: unloadComunicativeSessions,
      },
      selectors: {
        getData: getComunicativeSessions,
      },
    },
    geoStats: {
      actions: {
        load: loadGeoStats,
        unload: unloadGeoStats,
      },
      selectors: {
        getData: getGeoStats,
      }
    }
  },
  reducer,
  saga,
} = combineRjs(config, {
  state: 'patientDashboard',
  callApi: authApiCall,
})
