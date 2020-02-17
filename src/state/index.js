import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import createSagaMiddleware from 'redux-saga'
import { middleware as thunkMiddleware } from 'redux-saga-thunk'
import { makeAppsReducers, makeAppsSaga } from 'redux-rocketjump'
import * as auth from './auth'
import * as levels from './levels'
import * as boxes from './boxes'
import * as targets from './targets'
import * as cards from './cards'
import * as modalCards from './modalCards'
import * as feedbackPages from './feedbackPages'
import * as exercises from './exercises'
import * as users from './users'
import * as patients from './patients'
import * as geoEntities from './geoEntities'
import * as preferences from './preferences'
import * as notices from './notices'
import * as invites from './invites'
import * as patientDashboard from './patientDashboard'
import * as downloads from './downloads'
import * as password from './password'
import { errorsReducer } from './errors'

const APPS = {
  auth,
  levels,
  boxes,
  targets,
  cards,
  modalCards,
  feedbackPages,
  exercises,
  users,
  patients,
  geoEntities,
  preferences,
  notices,
  invites,
  patientDashboard,
  downloads,
  password,
}

const rootReducer = combineReducers({
  form: formReducer,
  errors: errorsReducer,
  ...makeAppsReducers(APPS),
})

const mainSaga = makeAppsSaga(APPS)

const preloadedState = undefined
const sagaMiddleware = createSagaMiddleware()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(
    applyMiddleware(thunkMiddleware, sagaMiddleware),
  )
)

sagaMiddleware.run(mainSaga)

export default store
