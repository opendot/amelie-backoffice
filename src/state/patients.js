import { fork } from 'redux-saga/effects'
import request from 'superagent'
import { combineReducers } from 'redux'
import { rj, makeActionTypes } from 'redux-rocketjump'
import rjUpdate from 'redux-rocketjump/plugins/update'
import rjDelete from 'redux-rocketjump/plugins/delete'
import rjWithPromise from 'redux-rocketjump/plugins/promise'
import rjList from 'redux-rocketjump/plugins/list'
import { makeUpdateReducer, makeRemoveListReducer } from 'redux-rocketjump/plugins/hor'
import { authApiCall, withToken } from './auth'
import airettPaginationAdapter from './pagination'
import { API_URL } from '../consts'
import { DELETE_USER_PATIENT, ADD_USER_PATIENT } from './users'

// Namespace for actions
const NS = '@users/'

// actions
const GET_PATIENTS = `${NS}GET_PATIENTS`
const GET_PATIENT = `${NS}GET_PATIENT`
const UPDATE_PATIENT = `${NS}UPDATE_PATIENT`
const DELETE_PATIENT = `${NS}DELETE_PATIENT`
const CREATE_PATIENT = `${NS}CREATE_PATIENT`


// List
export const {
  actions: {
    load: loadPatients,
    unload: unloadPatients,
  },
  selectors: {
    getList: getPatients,
    isLoading: getPatientsLoading,
    getCurrent: getPatientsCurrentPage,
    getNumPages: getPatientsNumPages,
  },
  reducer: listReducer,
  saga: listSaga,
} = rj(
  rjList({
    pageSize: 5,
    pagination: airettPaginationAdapter,
  }),
  {
    type: GET_PATIENTS,
    state: 'patients.list',
    composeReducer: [makeUpdateReducer(UPDATE_PATIENT), makeRemoveListReducer(DELETE_PATIENT)],
    callApi: authApiCall,
    api: t => (params) => withToken(t, request.get(`${API_URL}/patients/`))
      .query(params)
      // .then(({ body }) => body),
  }
)()




// this reducer is for keeping user detail in sync when adding and removing patients
const addPatientTypes = makeActionTypes(ADD_USER_PATIENT)
const deletePatientTypes = makeActionTypes(DELETE_USER_PATIENT)

const addRemovePatientReducer  = (prevState, action) => {

  if(action.type === addPatientTypes.success){

    const userData = prevState.data
    if(!userData || !action.meta.giver){
      return prevState
    }

    const targetPatientId = action.payload.params.patientId
    if(targetPatientId === userData.id){
      const users = (userData.users || []).concat(action.meta.giver)
      return {
        ...prevState,
        data: {
          ...prevState.data,
          users
        }
      }
    }
  }

  if(action.type === deletePatientTypes.success){
    const userData = prevState.data
    if(!userData){
      return prevState
    }
    const targetUserId = action.payload.params.id
    const targetPatientId = action.payload.params.patientId
    if(targetPatientId === userData.id){

      const users = (userData.users || []).filter(item => item.id !== targetUserId)
      return {
        ...prevState,
        data: {
          ...prevState.data,
          users
        }
      }
    }

  }

  return  prevState
}

// Detail
export const {
  actions: {
    load: loadPatient,
    unload: unloadPatient,
  },
  selectors: {
    getData: getPatient,
    isLoading: getPatientLoading,
  },
  reducer: detailReducer,
  saga: detailSaga,
} = rj({
  type: GET_PATIENT,
  state: 'patients.detail',
  composeReducer: [makeUpdateReducer(UPDATE_PATIENT), addRemovePatientReducer],
  callApi: authApiCall,
  api: t => ({ id, ...params }) => withToken(t, request.get(`${API_URL}/patients/${id}`))
    .query(params)
    .then(({ body }) => body)
})()

// Update
export const {
  actions: {
    update: updatePatient,
  },
  selectors: {
    getUpdating: getPatientsUpdating,
    getFailures: getPatientsUpdatingFailures,
  },
  reducer: updatePatientReducer,
  saga: updatePatientSaga,
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_PATIENT,
  state: 'patients.update',
  callApi: authApiCall,
  api: t => (patient) => withToken(t, request.patch(`${API_URL}/patients/${patient.id}`))
    .send(patient)
    .then(({ body }) => body)
})()

// Delete
export const {
  actions: {
    performDelete: deletePatient,
  },
  selectors: {
    getDeleting: getPatientDeleting,
    getFailures: getPatientDeletingFailures,
  },
  reducer: deletePatientReducer,
  saga: deletePatientSaga,
} = rj(rjWithPromise, rjDelete(), {
  type: DELETE_PATIENT,
  state: 'patients.delete',
  callApi: authApiCall,
  api: t => ({id}) => withToken(t, request.delete(`${API_URL}/patients/${id}`))
    .then(({ body }) => body)
})()

// create
export const {
  actions: {
    load: createPatient,
  },
  selectors: {
    getData: getCreatedPatient,
    getError: getCreatePatientError,
  },
  reducer: createPatientReducer,
  saga: createPatientSaga,
} = rj(rjWithPromise, {
  type: CREATE_PATIENT,
  state: 'patients.create',
  callApi: authApiCall,
  api: t => (patient) => withToken(t, request.post(`${API_URL}/patients/`))
    .send(patient)
    .then(({ body }) => body)
})()

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updatePatientReducer,
  delete: deletePatientReducer,
  create: createPatientReducer,
})

export const saga = function *() {
  yield fork(listSaga)
  yield fork(detailSaga)
  yield fork(updatePatientSaga)
  yield fork(deletePatientSaga)
  yield fork(createPatientSaga)
}
