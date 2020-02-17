import { fork } from 'redux-saga/effects'
import request from 'superagent'
import { combineReducers } from 'redux'
import { rj } from 'redux-rocketjump'
import rjUpdate from 'redux-rocketjump/plugins/update'
import rjDelete from 'redux-rocketjump/plugins/delete'
import rjMap from 'redux-rocketjump/plugins/map'
import rjWithPromise from 'redux-rocketjump/plugins/promise'
import rjList from 'redux-rocketjump/plugins/list'
import { makeUpdateReducer, makeRemoveListReducer } from 'redux-rocketjump/plugins/hor'
import { authApiCall, withToken } from './auth'
import { API_URL } from '../consts'
import airettPaginationAdapter from './pagination'

// Namespace for actions
const NS = '@feedbackPages/'

// actions
const GET_FEEDBACK_PAGES = `${NS}GET_FEEDBACK_PAGES`
const GET_FEEDBACK_PAGE = `${NS}GET_FEEDBACK_PAGE`
const UPDATE_FEEDBACK_PAGE = `${NS}UPDATE_FEEDBACK_PAGE`
const DELETE_FEEDBACK_PAGE = `${NS}DELETE_FEEDBACK_PAGE`
const CREATE_FEEDBACK_PAGE = `${NS}CREATE_FEEDBACK_PAGE`

const GET_FORM_FEEDBACK_PAGE = `${NS}GET_FORM_FEEDBACK_PAGE`

// List
export const {
  actions: {
    load: loadFeedbackPages,
    unload: unloadFeedbackPages,
  },
  selectors: {
    getList: getFeedbackPages,
    isLoading: getFeedbackPagesLoading,
    getCurrent: getFeedbackPagesCurrentPage,
    getNumPages: getFeedbackPagesNumPages,
  },
  reducer: listReducer,
  saga: listSaga,
} = rj(
  rjList({
    pageSize: 25,
    pagination: airettPaginationAdapter,
  }),
  {
    type: GET_FEEDBACK_PAGES,
    state: 'feedbackPages.list',
    composeReducer: [makeUpdateReducer(UPDATE_FEEDBACK_PAGE), makeRemoveListReducer(DELETE_FEEDBACK_PAGE)],
    callApi: authApiCall,
    api: t => (params) => withToken(t, request.get(`${API_URL}/feedback_pages/`))
      .query(params)
  }
)()

// Detail
export const {
  actions: {
    load: loadFeedbackPage,
    unload: unloadFeedbackPage,
  },
  selectors: {
    getData: getFeedbackPage,
    isLoading: getFeedbackPageLoading,
  },
  reducer: detailReducer,
  saga: detailSaga,
} = rj({
  type: GET_FEEDBACK_PAGE,
  state: 'feedbackPages.detail',
  callApi: authApiCall,
  api: t => ({ id }) => withToken(t, request.get(`${API_URL}/feedback_pages/${id}`))
    .then(({ body }) => body)
})()

// Update
export const {
  actions: {
    update: updateFeedbackPage,
  },
  selectors: {
    getUpdating: getFeedbackPagesUpdating,
    getFailures: getFeedbackPagesUpdatingFailures,
  },
  reducer: updateFeedbackPageReducer,
  saga: updateFeedbackPageSaga,
} = rj(rjUpdate(), {
  type: UPDATE_FEEDBACK_PAGE,
  state: 'feedbackPages.update',
  callApi: authApiCall,
  api: t => (feedbackPage) => withToken(t, request.patch(`${API_URL}/feedback_pages/${feedbackPage.id}`))
    .send(feedbackPage)
    .then(({ body }) => body)
})()

// Delete
export const {
  actions: {
    performDelete: deleteFeedbackPage,
  },
  selectors: {
    getDeleting: getFeedbackPagesDeleting,
    getFailures: getFeedbackPagesDeletingFailures,
  },
  reducer: deleteFeedbackPageReducer,
  saga: deleteFeedbackPageSaga,
} = rj(rjWithPromise, rjDelete(), {
  type: DELETE_FEEDBACK_PAGE,
  state: 'feedbackPages.delete',
  callApi: authApiCall,
  api: t => ({id}) => withToken(t, request.delete(`${API_URL}/feedback_pages/${id}`))
    .then(({ body }) => body)
})()

// create
export const {
  actions: {
    load: createFeedbackPage,
  },
  selectors: {
    getData: getCreatedFeedbackPage,
    getError: getCreateFeedbackPageError,
  },
  reducer: createFeedbackPageReducer,
  saga: createFeedbackPageSaga,
} = rj(rjWithPromise, {
  type: CREATE_FEEDBACK_PAGE,
  state: 'feedbackPages.create',
  callApi: authApiCall,
  api: t => ({feedbackPage}) => withToken(t, request.post(`${API_URL}/feedback_pages/`))
    .send(feedbackPage)
    .then(({ body }) => body)
})()

// dict for forms
export const {
  actions: {
    loadKey: loadFormFeedbackPage,
    unloadKey: unloadFormFeedbackPage,
    unload: unloadFormFeedbackPages,
  },
  selectors: {
    getMapData: getFormFeedbackPages,
    getMapLoadings: getFormFeedbackPagesLoading,
    getMapFailuers: getFormFeedbackPagesFailures,
  },
  reducer: formFeedbackPagesReducer,
  saga: formFeedbackPagesSaga,
} = rj(rjMap(), {
  type: GET_FORM_FEEDBACK_PAGE,
  state: 'feedbackPages.form',
  callApi: authApiCall,
  api: t => ({ id }) => withToken(t, request.get(`${API_URL}/feedback_pages/${id}`))
    .then(({ body }) => body)
})()


export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateFeedbackPageReducer,
  delete: deleteFeedbackPageReducer,
  create: createFeedbackPageReducer,
  form: formFeedbackPagesReducer,
})

export const saga = function *() {
  yield fork(listSaga)
  yield fork(detailSaga)
  yield fork(updateFeedbackPageSaga)
  yield fork(deleteFeedbackPageSaga)
  yield fork(createFeedbackPageSaga)
  yield fork(formFeedbackPagesSaga)
}
