import request from 'superagent'
import { rj, makeActionTypes } from 'redux-rocketjump'
import combineRjs from 'redux-rocketjump/plugins/combine'
import rjPromise from 'redux-rocketjump/plugins/promise'
import { API_URL } from '../consts'
import { authApiCall, withToken } from './auth';

const config = {}

const GET_PREFERENCES = 'GET_PREFERENCES'
const UPDATE_PREFERENCES = 'UPDATE_PREFERENCES'




// reducer for updating preferences
const updateTypes = makeActionTypes(UPDATE_PREFERENCES)

const updatePreferencesReducer  = (prevState, action) => {
  if(action.type === updateTypes.success){
    if(!prevState || !prevState.data){
      return prevState
    }

    
    return {
      ...prevState,
      data: {
        ...prevState.data,
        ...action.payload.data,
      }
    } 
  }
  return  prevState
}

config.list = rj(
{
  type: GET_PREFERENCES,
  callApi: authApiCall,
  composeReducer: [updatePreferencesReducer],
  api: t => (params) => withToken(t, request.get(`${API_URL}/preferences`))
    .query(params)
    .then(({ body }) => body)
})

config.update = rj(rjPromise, {
  type: UPDATE_PREFERENCES,
  state: false,
  callApi: authApiCall,
  api: t => (preferences) => withToken(t, request.put(`${API_URL}/preferences/change`))
    .send(preferences)
    .then(({ body }) => body)
})

export const {
  connect: {
    list: {
      actions: {
        load: loadPreferences,
        unload: unloadPreferences,
      },
      selectors: {
        getData: getPreferences,
      },
    },
    update: {
      actions: {
        load: updatePreferences,
      }
    }
  },
  reducer,
  saga,
} = combineRjs(config, {
  state: 'preferences',
})
