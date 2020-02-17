import { makePasswordFlow, makePasswordReducer } from 'eazy-auth'
import request from 'superagent'
import { API_URL } from '../consts'

const recover = (email) =>
    request.post(`${API_URL}/auth/password/`)
        .send({ email })

const checkResetToken = (token) =>
    request.get(`${API_URL}/auth/check-reset-token/${token}/`)

const resetPassword = (resetToken, password) =>
    request.post(`${API_URL}/auth/reset-password/${resetToken}/`)
        .send({
            password,
        })

export const saga = makePasswordFlow({
    recoverPasswordCall: recover,
    checkResetPasswordTokenCall: checkResetToken,
    resetPasswordCall: resetPassword,
})

export const reducer = makePasswordReducer()