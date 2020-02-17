import get from 'lodash/get'
import keyBy from 'lodash/keyBy'
import { set } from 'object-path-immutable'
import { makeActionTypes } from 'redux-rocketjump'

export const makeApplyOrderReducer = (baseActionType, statePath) => {
  const matchActionType = makeActionTypes(baseActionType).success
  return (prevState, action) => {
    if (action.type === matchActionType) {
      const list = get(prevState, statePath)
      if (Array.isArray(list)) {
        const order = action.payload.data
        const listById = keyBy(list, 'id')
        const newList = order.map(({ id }) => listById[id])
        return set(prevState, statePath, newList)
      }
      return prevState
    }
    return prevState
  }
}
