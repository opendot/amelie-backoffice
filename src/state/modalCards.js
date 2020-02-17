import { fork } from 'redux-saga/effects'
import request from 'superagent'
import { combineReducers } from 'redux'
import { rj } from 'redux-rocketjump'
import rjMap from 'redux-rocketjump/plugins/map'
import rjList from 'redux-rocketjump/plugins/list'
import { authApiCall, withToken } from './auth'
import airettPaginationAdapter from './pagination'
import { API_URL } from '../consts'

// Namespace for actions
const NS = '@modalCards/'

// actions
const GET_CARDS = `${NS}GET_CARDS`
const GET_FORM_CARD = `${NS}GET_FORM_CARD`

export const {
  actions: {
    load: loadCards,
    unload: unloadCards,
  },
  selectors: {
    getList: getCards,
    isLoading: getCardsLoading,
    getCurrent: getCardsCurrentPage,
    getNumPages: getCardsNumPages,
  },
  reducer: listReducer,
  saga: listSaga,
} = rj(
  rjList({
    pageSize: 25,
    pagination: airettPaginationAdapter,
  }),
  {
    type: GET_CARDS,
    state: 'modalCards.list',
    callApi: authApiCall,
    api: t => (params) => withToken(t, request.get(`${API_URL}/cognitive_cards/`))
      .query(params)
  }
)()

// dict for forms
export const {
  actions: {
    loadKey: loadFormCard,
    unloadKey: unloadFormCard,
    unload: unloadFormCards,
  },
  selectors: {
    getMapData: getFormCards,
    getMapLoadings: getFormCardsLoading,
    getMapFailuers: getFormCardsFailures,
  },
  reducer: formCardsReducer,
  saga: formCardsSaga,
} = rj(rjMap(), {
  type: GET_FORM_CARD,
  state: 'modalCards.form',
  callApi: authApiCall,
  api: t => ({ id }) => withToken(t, request.get(`${API_URL}/cognitive_cards/${id}`))
    .then(({ body }) => body)
})()


export const reducer = combineReducers({
  list: listReducer,
  form: formCardsReducer,
})

export const saga = function *() {
  yield fork(listSaga)
  yield fork(formCardsSaga)
}
