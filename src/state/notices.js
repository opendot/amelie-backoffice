import request from 'superagent'
import { rj, makeActionTypes } from 'redux-rocketjump'
import combineRjs from 'redux-rocketjump/plugins/combine'
import rjPromise from 'redux-rocketjump/plugins/promise'
import positionalArgs from "redux-rocketjump/plugins/positionalArgs"
import { createSelector } from 'reselect'
import rjMap from 'redux-rocketjump/plugins/map'
import { API_URL } from '../consts'
import { authApiCall, withToken } from './auth';

const config = {}

const GET_NOTICES = 'GET_NOTICES'
const GET_UNREAD_NOTICES = 'GET_UNREAD_NOTICES'
const UPDATE_NOTICE = 'UPDATE_NOTICE'


// reducer for updating preferences
const updateTypes = makeActionTypes(UPDATE_NOTICE)

const updateNoticeReducer =  (prevState, action) => {
  if(action.type === updateTypes.success){
    
    if(!prevState || !prevState.data){
      return prevState
    }
    const prevData = prevState.data.map(item => {
      if(!action.payload || !action.payload.data){
        return item
      }
      return item.id === action.payload.data.id ? action.payload.data : item
    })
    
    return {
      ...prevState,
      data: prevData,
    } 
  }
  return  prevState
}

config.list = rj(
{
  type: GET_NOTICES,
  callApi: authApiCall,
  composeReducer: [updateNoticeReducer],
  api: t => (params) => withToken(t, request.get(`${API_URL}/notices`))
    .query(params)
    .then(({ body }) => body)
})

config.unread = rj(
  {
    type: GET_UNREAD_NOTICES,
    callApi: authApiCall,
    composeReducer: [updateNoticeReducer],
    proxySelectors: {
      getData: ({ getData }) => createSelector(
        getData, 
        items => items === null ? null : items.filter(x => !x.read)
      )
    },
    api: t => () => withToken(t, request.get(`${API_URL}/notices`))
      .query({read: false})
      .then(({ body }) => body)
  })

config.update = rj(rjMap(), rjPromise, {
  type: UPDATE_NOTICE,
  state: false,
  callApi: authApiCall,
  api: t => ({id, read}) => withToken(t, request.put(`${API_URL}/notices/${id}`))
    .send({read})
    .then(({ body }) => body)
})

export const {
  connect: {
    list: {
      actions: {
        load: loadNotices,
        unload: unloadNotices,
      },
      selectors: {
        getData: getNotices,
      },
    },
    unread: {
      actions: {
        load: loadUnreadNotices,
        unload: unloadUnreadNotices,
      },
      selectors: {
        getData: getUnreadNotices,
      },
    },
    update: {
      actions: {
        load: updateNotice,
      }
    }
  },
  reducer,
  saga,
} = combineRjs(config, {
  state: 'notices',
})
