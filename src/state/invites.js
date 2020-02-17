import request from 'superagent'
import { rj } from 'redux-rocketjump'
import combineRjs from 'redux-rocketjump/plugins/combine'
import rjPromise from 'redux-rocketjump/plugins/promise'
import { API_URL } from '../consts'
import { authApiCall, withToken } from './auth';

const config = {}

const GET_INVITES = 'GET_INVITES'
const CREATE_INVITES = 'CREATE_INVITES'


config.list = rj(
{
  type: GET_INVITES,
  callApi: authApiCall,
  api: t => (params) => withToken(t, request.get(`${API_URL}/invites`))
    .query(params)
    .then(({ body }) => body)
})

config.create = rj(rjPromise, {
  type: CREATE_INVITES,
  state: false,
  callApi: authApiCall,
  api: t => (invites) => withToken(t, request.post(`${API_URL}/invites`))
    .send(invites)
    .then(({ body }) => body)
})

export const {
  connect: {
    list: {
      actions: {
        load: loadInvites,
        unload: unloadInvites,
      },
      selectors: {
        getData: getInvites,
      },
    },
    create: {
      actions: {
        load: createInvites,
      }
    }
  },
  reducer,
  saga,
} = combineRjs(config, {
  state: 'invites',
})
