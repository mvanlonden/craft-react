import * as ActionTypes from '../actions';
import entities from './entities';
import paginate from './paginate';
import { combineReducers } from 'redux';
import { routeReducer } from 'redux-simple-router';

// Updates the pagination data for different actions.
const pagination = combineReducers({
  entities: paginate({
    mapActionToKey: action => action.type,
    types: [
      ActionTypes.ENTITIES_REQUEST,
      ActionTypes.ENTITIES_SUCCESS,
      ActionTypes.ENTITIES_FAILURE
    ]
  })
})


const rootReducer = combineReducers(Object.assign({}, {
  entities,
  pagination,
  routing: routeReducer
}));

export default rootReducer;
