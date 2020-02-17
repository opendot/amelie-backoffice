import { fork } from 'redux-saga/effects'
import request from 'superagent'
import { combineReducers } from 'redux'
import { rj, makeActionTypes } from 'redux-rocketjump'
import rjUpdate from 'redux-rocketjump/plugins/update'
import rjDelete from 'redux-rocketjump/plugins/delete'
import rjMap from 'redux-rocketjump/plugins/map'
import rjWithPromise from 'redux-rocketjump/plugins/promise'
import rjList from 'redux-rocketjump/plugins/list'
import { makeUpdateReducer, makeRemoveListReducer, makeAddListReducer } from 'redux-rocketjump/plugins/hor'
import { authApiCall, withToken } from './auth'
import airettPaginationAdapter from './pagination'
import { API_URL } from '../consts'
import keyBy from 'lodash/keyBy'
import combineRjs from "redux-rocketjump/plugins/combine";


// Namespace for actions
const NS = '@users/'

// actions
const GET_USERS = `${NS}GET_USERS`
const GET_USER = `${NS}GET_USER`
const UPDATE_USER = `${NS}UPDATE_USER`
const UPDATE_USER_MAP = `${NS}UPDATE_USER_MAP`
const DELETE_USER = `${NS}DELETE_USER`
const CREATE_USER = `${NS}CREATE_USER`
const CHANGE_PASSWORD = `${NS}CHANGE_PASSWORD`

// enable/disable
const ENABLE_DISABLE_USER = `${NS}ENABLE_DISABLE_USER`

// patient association actions
export const DELETE_USER_PATIENT = `${NS}DELETE_USER_PATIENT`
export const ADD_USER_PATIENT = `${NS}ADD_USER_PATIENT`

// reducer for updating list on users status update
const enableDisableTypes = makeActionTypes(ENABLE_DISABLE_USER)

const enableDisableListReducer  = (prevState, action) => {
  if(action.type === enableDisableTypes.success){
    if(!prevState || !prevState.data.list){
      return prevState
    }
    const targetUsers = action.payload.params.users
    const prevUsers = prevState.data.list
    const targetUsersById = keyBy(targetUsers, 'id')
    const newList = prevUsers.map(item => ({
      ...item,
      disabled: targetUsersById[item.id] ? targetUsersById[item.id].disabled : item.disabled,
    }))
    return {
      ...prevState,
      data: {
        ...prevState.data,
        list: newList,
      }
    } 
  }
  return  prevState
}

// List
export const {
  actions: {
    load: loadUsers,
    unload: unloadUsers,
  },
  selectors: {
    getList: getUsers,
    isLoading: getUsersLoading,
    getCurrent: getUsersCurrentPage,
    getNumPages: getUsersNumPages,
  },
  reducer: listReducer,
  saga: listSaga,
} = rj(
  rjList({
    pageSize: 25,
    pagination: airettPaginationAdapter,
  }),
  {
    type: GET_USERS,
    state: 'users.list',
    composeReducer: [makeUpdateReducer(UPDATE_USER), makeRemoveListReducer(DELETE_USER), makeAddListReducer(CREATE_USER), enableDisableListReducer],
    callApi: authApiCall,
    api: t => (params) => withToken(t, request.get(`${API_URL}/users/`))
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
    if(!userData){
      return prevState
    }
    const targetUserId = action.payload.params.id
    if(targetUserId === userData.id){
      const patients = (userData.patients || []).concat(action.payload.data)
      return {
        ...prevState,
        data: {
          ...prevState.data,
          patients
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
    if(targetUserId === userData.id){
      
      const patients = (userData.patients || []).filter(item => item.id !== targetPatientId)
      return {
        ...prevState,
        data: {
          ...prevState.data,
          patients
        }
      }
    }
    
  }
  
  return  prevState
}

// Detail
export const {
  actions: {
    load: loadUser,
    unload: unloadUser,
  },
  selectors: {
    getData: getUser,
    isLoading: getUserLoading,
  },
  reducer: detailReducer,
  saga: detailSaga,
} = rj({
  type: GET_USER,
  state: 'users.detail',
  callApi: authApiCall,
  composeReducer: [addRemovePatientReducer, makeUpdateReducer(UPDATE_USER)],
  api: t => ({ id }) => withToken(t, request.get(`${API_URL}/users/${id}`))
    .then(({ body }) => body)
})()

// Update from detail
export const {
  actions: {
    update: updateUser,
  },
  selectors: {
    getUpdating: getUsersUpdating,
    getFailures: getUsersUpdatingFailures,
  },
  reducer: updateUserReducer,
  saga: updateUserSaga,
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_USER,
  state: 'users.update',
  callApi: authApiCall,
  api: t => (user) => withToken(t, request.patch(`${API_URL}/users/${user.id}`))
    .send(user)
    .then(({ body }) => body)
})()


// Update map
export const {
  actions: {
    load: updateUserMap,
  },
  selectors: {
    getData: getUpdateUserMap,
    getError: getUpdateUserMapErrors,
  },
  reducer: updateUserMapReducer,
  saga: updateUserMapSaga,
} = rj(rjWithPromise, rjMap(), {
  type: UPDATE_USER_MAP,
  state: 'users.updateMap',
  callApi: authApiCall,
  api: t => (user) => withToken(t, request.patch(`${API_URL}/users/${user.id}`))
    .send(user)
    .then(({ body }) => body)
})()


// Delete
export const {
  actions: {
    performDelete: deleteUser,
  },
  selectors: {
    getDeleting: getUserDeleting,
    getFailures: getUserDeletingFailures,
  },
  reducer: deleteUserReducer,
  saga: deleteUserSaga,
} = rj(rjWithPromise, rjDelete(), {
  type: DELETE_USER,
  state: 'users.delete',
  callApi: authApiCall,
  api: t => ({id}) => withToken(t, request.delete(`${API_URL}/users/${id}`))
    .then(({ body }) => body)
})()


// add patient
export const {
  actions: {
    load: addUserPatient,
  },
  selectors: {
    getLoading: getUserPatientAdding,
    getError: getUserPatientAddingFailures,
  },
  reducer: addUserPatientReducer,
  saga: addUserPatientSaga,
} = rj(rjWithPromise, {
  type: ADD_USER_PATIENT,
  state: 'users.addPatient',
  callApi: authApiCall,
  api: t => ({id, patientId}) => withToken(t, request.patch(`${API_URL}/users/${id}/patients/${patientId}`))
    .then(({ body }) => body)
})()

// Delete patient
export const {
  actions: {
    load: deleteUserPatient,
  },
  selectors: {
    getLoading: getUserPatientDeleting,
    getError: getUserPatientDeletingFailures,
  },
  reducer: deleteUserPatientReducer,
  saga: deleteUserPatientSaga,
} = rj(rjWithPromise, {
  type: DELETE_USER_PATIENT,
  state: 'users.deletePatient',
  callApi: authApiCall,
  api: t => ({id, patientId}) => withToken(t, request.delete(`${API_URL}/users/${id}/patients/${patientId}`))
    .then(({ body }) => body)
})()

// create
export const {
  actions: {
    load: createUser,
  },
  selectors: {
    getData: getCreatedUser,
    getError: getCreateUserError,
  },
  reducer: createUserReducer,
  saga: createUserSaga,
} = rj(rjWithPromise, {
  type: CREATE_USER,
  state: 'users.create',
  callApi: authApiCall,
  api: t => (user) => withToken(t, request.post(`${API_URL}/auth/`))
    .send(user)
    .then(({ body }) => body)
})()


// disable/enable
export const {
  actions: {
    load: enableDisableUsers,
  },
  selectors: {
    getLoading: getEnableDisableUsersLoading,
    getError: getEnableDisableUsersFailures,
  },
  reducer: enableDisableUsersReducer,
  saga: enableDisableUsersSaga,
} = rj(rjWithPromise, {
  type: ENABLE_DISABLE_USER,
  state: 'users.enableDisable',
  callApi: authApiCall,
  api: t => ({users}) => withToken(t, request.put(`${API_URL}/users/disable`))
    .send({users})
    .then(({ body }) => body)
})()


export const {

      actions: {
        load: changePassword,
        unload: resetChangePassword
      },
      selectors: {
        isLoading: getChangePasswordLoading,
        getData: getChangePasswordMessage,
        getError: getChangePasswordError,
      },
  reducer: passwordReducer,
  saga: passwordSaga,
} = rj(rjWithPromise, {
  type: CHANGE_PASSWORD,
  state: 'users.passwordChange',
  callApi: authApiCall,
  api: t => (data) => withToken(t, request.put(`${API_URL}/auth/password`))
      .send(data)
      .then(({ body }) => body)
})()


export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateUserReducer,
  updateMap: updateUserMapReducer,
  delete: deleteUserReducer,
  create: createUserReducer,
  deletePatient: deleteUserPatientReducer,
  addPatient: addUserPatientReducer,
  enableDisable: enableDisableUsersReducer,
  passwordChange: passwordReducer
})

export const saga = function *() {
  yield fork(listSaga)
  yield fork(detailSaga)
  yield fork(updateUserSaga)
  yield fork(updateUserMapSaga)
  yield fork(deleteUserSaga)
  yield fork(createUserSaga)
  yield fork(deleteUserPatientSaga)
  yield fork(addUserPatientSaga)
  yield fork(enableDisableUsersSaga)
  yield fork(passwordSaga)
}
