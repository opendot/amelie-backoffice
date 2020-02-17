import { fork, put } from "redux-saga/effects";
import request from "superagent";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import omit from 'lodash/omit'
import { rj, takeEveryAndCancel } from "redux-rocketjump";
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
import { UPDATE_TARGET, DELETE_TARGET, ORDER_TARGETS } from './targets'
import { setError } from './errors'

// Namespace for actions
const NS = "@boxes/";

// actions
const GET_BOXES = `${NS}GET_BOXES`;
const GET_BOX = `${NS}GET_BOX`;
export const UPDATE_BOX = `${NS}UPDATE_BOX`;
export const DELETE_BOX = `${NS}DELETE_BOX`;
const CREATE_BOX = `${NS}CREATE_BOX`;
export const ORDER_BOXES = `${NS}ORDER_BOXES`;

// List
export const {
  actions: { load: loadBoxes, unload: unloadBoxes },
  selectors: { getData: getBoxes, isLoading: getBoxesLoading },
  reducer: listReducer,
  saga: listSaga
} = rj({
  type: GET_BOXES,
  state: "boxes.list",
  callApi: authApiCall,
  api: t => ({ levelId }) =>
    withToken(t, request.get(`${API_URL}/levels/${levelId}/boxes`)).then(
      ({ body }) => body
    )
})();


// Detail
export const {
  actions: { load: loadBox, unload: unloadBox },
  selectors: { getData: getBox, isLoading: getBoxLoading },
  reducer: detailReducer,
  saga: detailSaga
} = rj({
  type: GET_BOX,
  state: "boxes.detail",
  composeReducer: [
    makeUpdateReducer(UPDATE_BOX),
    //#TODO: document this! (allows updating from the UPDATE_TARGET ACTION)
    makeUpdateReducer(
      UPDATE_TARGET,
      'data.targets',
      (action, object) => action.payload.data.id === object.id,
      ({ payload: { data } }) => ({
        ...omit(data, 'targets'),
        exercise_trees_count: data.exercise_trees.length,
      })
    ),
    makeRemoveListReducer(DELETE_BOX, "data", null),
    makeRemoveListReducer(DELETE_TARGET, "data.targets", null),
    makeApplyOrderReducer(ORDER_TARGETS, 'data.targets'),
  ],
  callApi: authApiCall,
  api: t => ({ id, levelId }) =>
    withToken(t, request.get(`${API_URL}/levels/${levelId}/boxes/${id}`)).then(
      ({ body }) => body
    )
})();

// Update
export const {
  actions: { update: updateBox },
  selectors: {
    getUpdating: getBoxesUpdating,
    getFailures: getBoxesUpdatingFailures
  },
  reducer: updateBoxReducer,
  saga: updateBoxSaga
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_BOX,
  state: "boxes.update",
  callApi: authApiCall,
  api: t => ({levelId, box}) =>
    withToken(t, request.patch(`${API_URL}/levels/${levelId}/boxes/${box.id}`))
      .send(box)
      .then(({ body }) => body)
})();

// Delete
export const {
  actions: { performDelete: deleteBox, unload: clearDeleteBox },
  selectors: {
    getDeleting: getBoxesDeleting,
    getFailures: getBoxesDeletingFailures
  },
  reducer: deleteBoxReducer,
  saga: deleteBoxSaga
} = rj(rjDelete(), {
  type: DELETE_BOX,
  state: "boxes.delete",
  callApi: authApiCall,
  api: t => ({id, levelId}) =>
    withToken(t, request.delete(`${API_URL}/levels/${levelId}/boxes/${id}`)).then(
      ({ body }) => body
    )
})();

// create
export const {
  actions: { load: createBox },
  selectors: { getData: getCreatedBox, getError: getCreateBoxError },
  reducer: createBoxReducer,
  saga: createBoxSaga
} = rj(rjWithPromise, {
  type: CREATE_BOX,
  state: "boxes.create",
  callApi: authApiCall,
  api: t => ({ levelId, box }) =>
    withToken(t, request.post(`${API_URL}/levels/${levelId}/boxes/`))
      .send(box)
      .then(({ body }) => body)
})();

// reorder
export const {
  actions: { load: orderBoxes },
  selectors: { getData: getOrderBoxes, getError: getOrderBoxesError },
  reducer: orderBoxesReducer,
  saga: orderBoxesSaga
} = rj({
  type: ORDER_BOXES,
  state: "boxes.order",
  callApi: authApiCall,
  takeEffect: takeEveryAndCancel,
  failureEffect: function*(err) {
    yield put(setError(err.message || 'API error'))
  },
  api: t => ({ levelId, order }) =>
    withToken(t, request.put(`${API_URL}/levels/${levelId}/boxes/order`))
      .send(order)
      .then(({ body }) => body)
})();

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateBoxReducer,
  delete: deleteBoxReducer,
  create: createBoxReducer,
  order: orderBoxesReducer
});

export const saga = function*() {
  yield fork(listSaga);
  yield fork(detailSaga);
  yield fork(updateBoxSaga);
  yield fork(deleteBoxSaga);
  yield fork(createBoxSaga);
  yield fork(orderBoxesSaga);
};

export const getBoxChild = createSelector(getBox, box => {
  if (box) {
    return {
      ...box,
      child: box.targets,
      targets: undefined,
    }
  }
  return box;
});
