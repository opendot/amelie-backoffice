import request from 'superagent'

import {
  makeAuthFlow,
  makeAuthReducer,
} from 'eazy-auth'
import { API_URL } from '../consts'

// // Inject token in Authorization header when provided
export const withToken = (token, baseRequest) => {
    if(!token || !token.token){
      return baseRequest
    }
    // here we should use token according to API rules
    //
    baseRequest.set('Authorization', `${token.token.tokenType} ${token.token.accessToken}`)
    baseRequest.set('access-token', `${token.token.accessToken}`)
    baseRequest.set('token-type', `Bearer`)
    baseRequest.set('client', `${token.token.client}`)
    baseRequest.set('expiry', `${token.token.expiry}`)
    baseRequest.set('uid', `${token.token.uid}`)
    return baseRequest

}

const me = (token) => {
  return token.user
}

const login = ({ email, password }) =>
  request.post(`${API_URL}/auth/sign_in`)
    .send({ email, password, server_ip: 'http://10.131.184.151:3001' })
    .then(({ body, headers }) => ({
    access_token : {
      token : {
          accessToken: headers['access-token'],
          client: headers.client,
          uid: headers.uid,
          tokenType: headers['token-type'],
          expiry: headers.expiry,
      },
      user: { ...body },
    }
  }))

const { authFlow: saga, authApiCall } = makeAuthFlow({
  meCall: me,
  loginCall: login,
})

const reducer = makeAuthReducer()

export {
  saga,
  authApiCall,
  reducer,
}
