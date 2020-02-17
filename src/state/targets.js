import { fork, put } from "redux-saga/effects";
import request from "superagent";
import { combineReducers } from "redux";
import { rj, takeEveryAndCancel, makeActionTypes } from "redux-rocketjump";
import rjUpdate from "redux-rocketjump/plugins/update";
import rjDelete from "redux-rocketjump/plugins/delete";
import rjWithPromise from "redux-rocketjump/plugins/promise";
import {
  makeUpdateReducer,
  makeRemoveListReducer
} from "redux-rocketjump/plugins/hor";
import { makeApplyOrderReducer } from './utils'
import { authApiCall, withToken } from "./auth";
import { API_URL } from "../consts";
import { setError } from './errors'
import { DELETE_EXERCISE, UPDATE_EXERCISE, ORDER_EXERCISES } from './exercises'

// Namespace for actions
const NS = "@targets/";
const GET_TARGETS = `${NS}GET_TARGETS`;
const GET_TARGET = `${NS}GET_TARGET`;
export const UPDATE_TARGET = `${NS}UPDATE_TARGET`;
export const DELETE_TARGET = `${NS}DELETE_TARGET`;
const CREATE_TARGET = `${NS}CREATE_TARGET`;
export const ORDER_TARGETS = `${NS}ORDER_TARGETS`;

// List
export const {
  actions: { load: loadTargets, unload: unloadTargets },
  selectors: { getData: getTargets, isLoading: getTargetsLoading },
  reducer: listReducer,
  saga: listSaga
} = rj({
  type: GET_TARGETS,
  state: "targets.list",
  composeReducer: [
    makeUpdateReducer(UPDATE_TARGET),
    makeRemoveListReducer(DELETE_TARGET, "data", undefined)
  ],
  callApi: authApiCall,
  api: t => ({ boxId }) =>
    withToken(t, request.get(`${API_URL}/boxes/${boxId}/targets`))
      //.query(params)
      .then(({ body }) => body)
})();

// Detail
export const {
  actions: { load: loadTarget, unload: unloadTarget },
  selectors: { getData: getTarget, isLoading: getTargetLoading },
  reducer: detailReducer,
  saga: detailSaga
} = rj({
  type: GET_TARGET,
  state: "targets.detail",
  composeReducer : [
    makeRemoveListReducer(DELETE_EXERCISE, 'data.exercise_trees', null),
    (prevState, { type, meta, payload }) => {
      if (type === makeActionTypes(UPDATE_EXERCISE).success) {
        return {
          ...prevState,
          data: {
            ...prevState.data,
            exercise_trees: prevState.data.exercise_trees.map(excercise => {
              if (meta.id === excercise.id) {
                if (meta.newId) {
                  return {
                    ...excercise,
                    id: payload.data.id,
                  }
                } else {
                  return payload.data
                }
              }
              return excercise
            })
          }
        }
      }
      return prevState
    },
    makeApplyOrderReducer(ORDER_EXERCISES, 'data.exercise_trees'),
  ],
  callApi: authApiCall,
  api: t => ({ id, boxId }) =>
    withToken(t, request.get(`${API_URL}/boxes/${boxId}/targets/${id}`)).then(
      ({ body }) => body
    )
})();

// Update
export const {
  actions: { update: updateTarget },
  selectors: {
    getUpdating: getTargetsUpdating,
    getFailures: getTargetsUpdatingFailures
  },
  reducer: updateTargetReducer,
  saga: updateTargetSaga
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_TARGET,
  state: "targets.update",
  callApi: authApiCall,
  api: t => ({boxId, target}) =>
    withToken(t, request.patch(`${API_URL}/boxes/${boxId}/targets/${target.id}`))
      .send(target)
      .then(({ body }) => body)
})();

// Delete
export const {
  actions: { performDelete: deleteTarget, unload: clearDeleteTarget },
  selectors: {
    getDeleting: getTargetsDeleting,
    getFailures: getTargetsDeletingFailures
  },
  reducer: deleteTargetReducer,
  saga: deleteTargetSaga
} = rj(rjDelete(), {
  type: DELETE_TARGET,
  state: "targets.delete",
  callApi: authApiCall,
  api: t => ({ id, boxId }) =>
    withToken(t, request.delete(`${API_URL}/boxes/${boxId}/targets/${id}`)).then(
      ({ body }) => body
    )
})();

// create
export const {
  actions: { load: createTarget },
  selectors: { getData: getCreatedTarget, getError: getCreateTargetError },
  reducer: createTargetReducer,
  saga: createTargetSaga
} = rj(rjWithPromise, {
  type: CREATE_TARGET,
  state: "targets.create",
  callApi: authApiCall,
  api: t => ({ boxId, target }) =>
    withToken(t, request.post(`${API_URL}/boxes/${boxId}/targets/`))
      .send(target)
      .then(({ body }) => body)
})();

// reorder
export const {
  actions: { load: orderTargets },
  selectors: { getData: getOrderTargets, getError: getOrderTargetsError },
  reducer: orderTargetsReducer,
  saga: orderTargetsSaga
} = rj({
  type: ORDER_TARGETS,
  state: "targets.order",
  callApi: authApiCall,
  takeEffect: takeEveryAndCancel,
  failureEffect: function*(err) {
    yield put(setError(err.message || 'API error'))
  },
  api: t => ({ boxId, order }) =>
    withToken(t, request.put(`${API_URL}/boxes/${boxId}/targets/order`))
      .send(order)
      .then(({ body }) => body)
})();

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateTargetReducer,
  delete: deleteTargetReducer,
  create: createTargetReducer,
  order: orderTargetsReducer
});

export const saga = function*() {
  yield fork(listSaga);
  yield fork(detailSaga);
  yield fork(updateTargetSaga);
  yield fork(deleteTargetSaga);
  yield fork(createTargetSaga);
  yield fork(orderTargetsSaga);
};
