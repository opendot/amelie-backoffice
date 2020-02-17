import { fork, put } from "redux-saga/effects";
import request from "superagent";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import omit from 'lodash/omit'
import { rj, takeEveryAndCancel } from "redux-rocketjump";
import rjUpdate from "redux-rocketjump/plugins/update";
import rjDelete from "redux-rocketjump/plugins/delete";
import rjWithPromise from "redux-rocketjump/plugins/promise";
import { setError } from './errors'
import {
  makeUpdateReducer,
  makeRemoveListReducer
} from "redux-rocketjump/plugins/hor";
import { makeApplyOrderReducer } from './utils'
import { authApiCall, withToken } from "./auth";
import { API_URL } from "../consts";
import { UPDATE_BOX, DELETE_BOX, ORDER_BOXES } from './boxes'

// Namespace for actions
const NS = "@levels/";

// actions
const GET_LEVELS = `${NS}GET_LEVELS`;
const GET_LEVEL = `${NS}GET_LEVEL`;
const UPDATE_LEVEL = `${NS}UPDATE_LEVEL`;
const DELETE_LEVEL = `${NS}DELETE_LEVEL`;
const CREATE_LEVEL = `${NS}CREATE_LEVEL`;
const ORDER_LEVELS = `${NS}ORDER_LEVELS`;

// List
export const {
  actions: { load: loadLevels, unload: unloadLevels },
  selectors: { getData: getLevels, isLoading: getLevelsLoading },
  reducer: listReducer,
  saga: listSaga
} = rj({
  type: GET_LEVELS,
  state: "levels.list",
  composeReducer: [
    makeUpdateReducer(UPDATE_LEVEL, 'data', undefined,
    ({ payload: { data } }) => ({
      ...omit(data, 'boxes'),
      boxes_count: data.boxes.length,
    })),
    makeRemoveListReducer(DELETE_LEVEL, "data", null),
    makeApplyOrderReducer(ORDER_LEVELS, 'data'),
  ],
  callApi: authApiCall,
  api: t => params =>
    withToken(t, request.get(`${API_URL}/levels`))
      .query(params)
      .then(({ body }) => body)
})();

// Detail
export const {
  actions: { load: loadLevel, unload: unloadLevel },
  selectors: { getData: getLevel, isLoading: getLevelLoading },
  reducer: detailReducer,
  saga: detailSaga
} = rj({
  type: GET_LEVEL,
  state: "levels.detail",
  composeReducer: [
    makeUpdateReducer(
      UPDATE_BOX,
      'data.boxes',
      (action, object) => action.payload.data.id === object.id,
      ({ payload: { data } }) => ({
        ...omit(data, 'targets'),
        targets_count: data.targets.length,
      })
    ),
    makeRemoveListReducer(
      DELETE_BOX,
      "data.boxes",
      null,
    ),
    makeApplyOrderReducer(
      ORDER_BOXES,
      'data.boxes'
    )
  ],
  callApi: authApiCall,
  api: t => ({ id }) =>
    withToken(t, request.get(`${API_URL}/levels/${id}`)).then(
      ({ body }) => body
    )
})();

// Update
export const {
  actions: { update: updateLevel },
  selectors: {
    getUpdating: getLevelsUpdating,
    getFailures: getLevelsUpdatingFailures
  },
  reducer: updateLevelReducer,
  saga: updateLevelSaga
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_LEVEL,
  state: "levels.update",
  callApi: authApiCall,
  api: t => level =>
    withToken(t, request.patch(`${API_URL}/levels/${level.id}`))
      .send(level)
      .then(({ body }) => body)
})();

// Delete
export const {
  actions: { performDelete: deleteLevel, unload: clearDeleteLevels },
  selectors: {
    getDeleting: getLevelsDeleting,
    getFailures: getLevelsDeletingFailures
  },
  reducer: deleteLevelReducer,
  saga: deleteLevelSaga
} = rj(rjDelete(), {
  type: DELETE_LEVEL,
  state: "levels.delete",
  callApi: authApiCall,
  api: t => ({ id }) =>
    withToken(t, request.delete(`${API_URL}/levels/${id}`)).then(
      ({ body }) => body
    )
})();

// create
export const {
  actions: { load: createLevel },
  selectors: { getData: getCreatedLevel, getError: getCreateLevelError },
  reducer: createLevelReducer,
  saga: createLevelSaga
} = rj(rjWithPromise, {
  type: CREATE_LEVEL,
  state: "levels.create",
  callApi: authApiCall,
  api: t => ({ level }) =>
    withToken(t, request.post(`${API_URL}/levels`))
      .send(level)
      .then(({ body }) => body)
})();

// reorder
export const {
  actions: { load: orderLevels },
  selectors: { getData: getOrderLevels, getError: getOrderLevelsError },
  reducer: orderLevelsReducer,
  saga: orderLevelsSaga
} = rj({
  type: ORDER_LEVELS,
  state: "levels.order",
  callApi: authApiCall,
  takeEffect: takeEveryAndCancel,
  failureEffect: function*(err) {
    yield put(setError(err.message || 'API error'))
  },
  api: t => ({ order }) =>
    withToken(t, request.put(`${API_URL}/levels/order`))
      .send(order)
      .then(({ body }) => body)
})();

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateLevelReducer,
  delete: deleteLevelReducer,
  create: createLevelReducer,
  order: orderLevelsReducer
});

export const saga = function*() {
  yield fork(listSaga);
  yield fork(detailSaga);
  yield fork(updateLevelSaga);
  yield fork(deleteLevelSaga);
  yield fork(createLevelSaga);
  yield fork(orderLevelsSaga);
};

export const getLevelChild = createSelector(getLevel, level => {
  if (level) {
    return {
      ...level,
      child: level.boxes,
      boxes: undefined,
    }
  }
  return level;
});
