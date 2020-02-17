import request from 'superagent'
import { rj } from 'redux-rocketjump'
import combineRjs from 'redux-rocketjump/plugins/combine'
import rjPromise from 'redux-rocketjump/plugins/promise'
import { API_URL } from '../consts'
import { authApiCall, withToken } from './auth';

const config = {}

const CREATE_DOWLOAD = 'CREATE_DOWLOAD'


config.create = rj(rjPromise, {
  type: CREATE_DOWLOAD,
  state: 'downloads',
  callApi: authApiCall,
  api: t => (data) => withToken(t, request.get(`${API_URL}/packages`))
    .query(data)
    .then(({ body }) => body)
})

export const {
  connect: {
    create: {
      actions: {
        load: createDownload,
      },
      selectors: {
        isLoading: getDownloadLoading,
        getData: getDownloadMessage,
        getError: getDownloadError,
      }
    }
  },
  reducer,
  saga,
} = combineRjs(config, {
  state: 'downloads',
})



