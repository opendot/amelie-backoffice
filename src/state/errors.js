import uuidV4 from 'uuid/v4'

// set error action
const SET_ERROR = 'SET_ERROR'
export const setError = (message, canDismiss=false) => ({
  type: SET_ERROR,
  message,
  canDismiss,
})

// unset error action (dismiss)
// set error action
const DISMISS_ERROR = 'DISMISS_ERROR'
export const dismissError = id => ({
  type: DISMISS_ERROR,
  id,
})

// reducer handling "global" errors in app
export const errorsReducer = (prevState=[], action) => {
  const { type, ...payload } = action
  switch (type) {
    case SET_ERROR: {
      const {message, canDismiss} = payload
      const error = {canDismiss, message, id: uuidV4()}
      return prevState.concat(error)
    }
    case DISMISS_ERROR: {
      const {id} = payload
      return prevState.filter(x => x.id !== id)
    }
    default:
      return prevState
  }
}

// selector for errors
export const getErrors = state => state.errors
