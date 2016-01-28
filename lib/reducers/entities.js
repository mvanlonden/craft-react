import merge from 'lodash/object/merge'
import keys from 'lodash/object/keys'
import has from 'lodash/object/has'
import forEach from 'lodash/collection/forEach'


// Updates an entity cache in response to any action with response.entities.
export default function entities(state = {}, action) {
  if (action.response && action.response.entities) {
    forEach(action.response.entities, (value, key) => {
      !has(state, key) ? state.key = {}
    })
    return merge({}, state, action.response.entities)
  }

  return state

}
