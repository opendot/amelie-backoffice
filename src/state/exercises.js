import { fork } from "redux-saga/effects";
import request from "superagent";
import { combineReducers } from "redux";
import { createSelector } from 'reselect'
import get from 'lodash/get'
import orderBy from 'lodash/orderBy'
import { rj, takeEveryAndCancel, makeActionTypes } from "redux-rocketjump";
import rjUpdate from "redux-rocketjump/plugins/update";
import rjDelete from "redux-rocketjump/plugins/delete";
import rjWithPromise from "redux-rocketjump/plugins/promise";
import {
  makeUpdateReducer,
  makeRemoveListReducer
} from "redux-rocketjump/plugins/hor";
import { authApiCall, withToken } from "./auth";
import { API_URL } from "../consts";

// Namespace for actions
const NS = "@exercises/";

// actions
const GET_EXERCISES = `${NS}GET_EXERCISES`;
const GET_EXERCISE = `${NS}GET_EXERCISE`;
export const UPDATE_EXERCISE = `${NS}UPDATE_EXERCISE`;
export const DELETE_EXERCISE = `${NS}DELETE_EXERCISE`;
const CREATE_EXERCISE = `${NS}CREATE_EXERCISE`;
export const ORDER_EXERCISES = `${NS}ORDER_EXERCISES`;

// List
export const {
  actions: { load: loadExercises, unload: unloadExercises },
  selectors: { getData: getExercises, isLoading: getExercisesLoading },
  reducer: listReducer,
  saga: listSaga
} = rj({
  type: GET_EXERCISES,
  state: "exercises.list",
  composeReducer: [
    // makeUpdateReducer(UPDATE_EXERCISE),
    makeRemoveListReducer(DELETE_EXERCISE, "data", undefined)
  ],
  callApi: authApiCall,
  api: t => ({ targetId }) =>
    withToken(
      t,
      request.get(`${API_URL}/targets/${targetId}/exercise_trees`)
    ).then(({ body }) => body)
})();

// Detail
export const {
  actions: { load: loadExercise, unload: unloadExercise },
  selectors: { getData: getExercise, isLoading: getExerciseLoading },
  reducer: detailReducer,
  saga: detailSaga
} = rj({
  type: GET_EXERCISE,
  state: "exercises.detail",
  callApi: authApiCall,
  proxyReducers: (prevState, { type, meta, payload }) => {
    if (
      type === makeActionTypes(UPDATE_EXERCISE).success &&
      meta.newId &&
      meta.id === prevState.data.id
    ) {
      return {
        ...prevState,
        data: {
          ...prevState.data,
          id: payload.data.id
        }
      }
    }
    return prevState
  },
  proxySelectors: {
    getData: ({ getData }) => createSelector(
      getData,
      exercise => {
        if (exercise === null) {
          return null
        }
        return {
          ...exercise,
          pages: get(exercise, 'pages', []).map(page => ({
            ...page,
            cards: orderBy(get(page, 'cards', []), 'x_pos'),
          }))
        }
      }
    )
  },
  api: t => ({ id, targetId }) =>
    withToken(
      t,
      request.get(`${API_URL}/targets/${targetId}/exercise_trees/${id}`)
    ).then(({ body }) => body)
})();

// Update
export const {
  actions: { update: updateExercise },
  selectors: {
    getUpdating: getExercisesUpdating,
    getFailures: getExercisesUpdatingFailures
  },
  reducer: updateExerciseReducer,
  saga: updateExerciseSaga
} = rj(rjWithPromise, rjUpdate(), {
  type: UPDATE_EXERCISE,
  state: "exercises.update",
  callApi: authApiCall,
  proxyActions: {
    update: ({ load }) => (obj, meta = {}) =>
         load(obj, { id: obj.id, newId: obj.newId, ...meta }),
  },
  api: t => ({targetId, id, ...exercise}) =>
    withToken(t, request.put(`${API_URL}/targets/${targetId}/exercise_trees/${id}`))
      .send({...exercise, id: exercise.newId, newId: undefined})
      .then(({ body }) => body)
})();

// Delete
export const {
  actions: { performDelete: deleteExercise, unload: clearDeleteExcercise },
  selectors: {
    getDeleting: getExercisesDeleting,
    getFailures: getExercisesDeletingFailures
  },
  reducer: deleteExerciseReducer,
  saga: deleteExerciseSaga
} = rj(rjDelete(), {
  type: DELETE_EXERCISE,
  state: "exercises.delete",
  callApi: authApiCall,
  api: t => ({ targetId, id }) =>
    withToken(t, request.delete(`${API_URL}/targets/${targetId}/exercise_trees/${id}`)).then(
      ({ body }) => body
    )
})();

// create
export const {
  actions: { load: createExercise },
  selectors: { getData: getCreatedExercise, getError: getCreateExerciseError },
  reducer: createExerciseReducer,
  saga: createExerciseSaga
} = rj(rjWithPromise, {
  type: CREATE_EXERCISE,
  state: "exercises.create",
  callApi: authApiCall,
  api: t => ({ targetId, exercise }) =>
    withToken(t, request.post(`${API_URL}/targets/${targetId}/exercise_trees`))
      .send(exercise)
      .then(({ body }) => body)
})();

// reorder
export const {
  actions: { load: orderExercises },
  selectors: { getData: getOrderExercises, getError: getOrderExercisesError },
  reducer: orderExercisesReducer,
  saga: orderExercisesSaga
} = rj({
  type: ORDER_EXERCISES,
  state: "exercises.order",
  callApi: authApiCall,
  takeEffect: takeEveryAndCancel,
  api: t => ({ targetId, order }) =>
    withToken(
      t,
      request.put(`${API_URL}/targets/${targetId}/exercise_trees/order`)
    )
      .send(order)
      .then(({ body }) => body)
})();

export const reducer = combineReducers({
  list: listReducer,
  detail: detailReducer,
  update: updateExerciseReducer,
  delete: deleteExerciseReducer,
  create: createExerciseReducer,
  order: orderExercisesReducer
});

export const saga = function*() {
  yield fork(listSaga);
  yield fork(detailSaga);
  yield fork(updateExerciseSaga);
  yield fork(deleteExerciseSaga);
  yield fork(createExerciseSaga);
  yield fork(orderExercisesSaga);
};
