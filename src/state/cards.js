import { fork } from 'redux-saga/effects'
import request from 'superagent'
import { combineReducers } from 'redux'
import { rj } from 'redux-rocketjump'
import rjUpdate from 'redux-rocketjump/plugins/update'
import rjDelete from 'redux-rocketjump/plugins/delete'
import rjWithPromise from 'redux-rocketjump/plugins/promise'
import rjList from 'redux-rocketjump/plugins/list'
import { makeUpdateReducer, makeRemoveListReducer } from 'redux-rocketjump/plugins/hor'
import { authApiCall, withToken } from './auth'
import airettPaginationAdapter from './pagination'
import { API_URL } from '../consts'

// Namespace for actions
const NS = '@cards/'

// actions
const GET_CARDS = `${NS}GET_CARDS`
const GET_CARD = `${NS}GET_CARD`
const UPDATE_CARD = `${NS}UPDATE_CARD`
const DELETE_CARD = `${NS}DELETE_CARD`
const CREATE_CARD = `${NS}CREATE_CARD`


// List
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
    state: 'cards.list',
    composeReducer: [makeUpdateReducer(UPDATE_CARD), makeRemoveListReducer(DELETE_CARD)],
    callApi: authApiCall,
    api: t => (params) => withToken(t, request.get(`${API_URL}/cognitive_cards/`))
      .query(params)
      // .then(({ body }) => body),
  }
)()

// Detail
export const {
  actions: {
    load: loadCard,
    unload: unloadCard,
  },
  selectors: {
    getData: getCard,
    isLoading: getCardLoading,
  },
  reducer: detailReducer,
  saga: detailSaga,
} = rj({
  type: GET_CARD,
  state: 'cards.detail',
  callApi: authApiCall,
  api: t => ({ id }) => withToken(t, request.get(`${API_URL}/cognitive_cards/${id}`))
    .then(({ body }) => body)
})()

// Update
export const {
  actions: {
    update: updateCard,
  },
  selectors: {
    getUpdating: getCardsUpdating,
    getFailures: getCardsUpdatingFailures,
  },
  reducer: updateCardReducer,
  saga: updateCardSaga,
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_CARD,
  state: 'cards.update',
  callApi: authApiCall,
  api: t => (card) => withToken(t, request.patch(`${API_URL}/cognitive_cards/${card.id}`))
    .send(card)
    .then(({ body }) => body)
})()

// Delete
export const {
  actions: {
    performDelete: deleteCard,
  },
  selectors: {
    getDeleting: getCardsDeleting,
    getFailures: getCardsDeletingFailures,
  },
  reducer: deleteCardReducer,
  saga: deleteCardSaga,
} = rj(rjWithPromise, rjDelete(), {
  type: DELETE_CARD,
  state: 'cards.delete',
  callApi: authApiCall,
  api: t => ({id}) => withToken(t, request.delete(`${API_URL}/cognitive_cards/${id}`))
    .then(({ body }) => body)
})()

// create
export const {
  actions: {
    load: createCard,
  },
  selectors: {
    getData: getCreatedCard,
    getError: getCreateCardError,
  },
  reducer: createCardReducer,
  saga: createCardSaga,
} = rj(rjWithPromise, {
  type: CREATE_CARD,
  state: 'cards.create',
  callApi: authApiCall,
  api: t => ({card}) => withToken(t, request.post(`${API_URL}/cognitive_cards/`))
    .send(card)
    .then(({ body }) => body)
})()

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateCardReducer,
  delete: deleteCardReducer,
  create: createCardReducer,
})

export const saga = function *() {
  yield fork(listSaga)
  yield fork(detailSaga)
  yield fork(updateCardSaga)
  yield fork(deleteCardSaga)
  yield fork(createCardSaga)
}
