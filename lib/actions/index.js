import { CALL_API, Schemas } from '../middleware/api';
import { Schema, arrayOf } from 'normalizr'

export const ENTITY_REQUEST = 'ENTITY_REQUEST';
export const ENTITY_SUCCESS = 'ENTITY_SUCCESS';
export const ENTITY_FAILURE = 'ENTITY_FAILURE';


// Fetches an entity from the Craft API
// Relies on middleware API definted in ../middleware
function fetchEntity(type, slug) {
  const schemaName = type.toUpperCase().replace(/[-]/g, "_")
  let schema = Schemas[schemaName]
  if (!schema) {
    schema = new Schema(type, {
      idAttribute: 'slug'
    });
  }
  return {
    [CALL_API]: {
      types: [ ENTITY_REQUEST, ENTITY_SUCCESS, ENTITY_FAILURE ],
      endpoint: `${type}/${slug}`,
      schema: schema
    }
  }
}

// Fetches a single entity from Craft API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadEntity(type, slug) {
  return (dispatch, getState) => {
    if (getState().entities[type] && getState().entities[type][slug]) {
      return null
    }

    return dispatch(fetchEntity(type, slug));
  }
}

export const ENTITIES_REQUEST = 'ENTITIES_REQUEST';
export const ENTITIES_SUCCESS = 'ENTITIES_SUCCESS';
export const ENTITIES_FAILURE = 'ENTITIES_FAILURE';

// Fetches a page of entities.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchEntities(type, nextPageUrl) {
  const schemaName = `${type.toUpperCase().replace(/[-]/g, "_")}_ARRAY`
  let schema = Schemas[schemaName]
  if (!schema) {
    schema = arrayOf(new Schema(type, {
      idAttribute: 'slug'
    }));
  }
  return {
    type,
    [CALL_API]: {
      types: [ ENTITIES_REQUEST, ENTITIES_SUCCESS, ENTITIES_FAILURE ],
      endpoint: nextPageUrl,
      schema: schema
    }
  }
}


export function loadEntities(type, nextPage) {
  return (dispatch, getState) => {
    const {
      nextPageUrl = `${type}s`,
      pageCount = 0
    } = getState().pagination.entities[type] || {}

    if (pageCount > 0 && !nextPage) {
      return null;
    }

    return dispatch(fetchEntities(type, nextPageUrl));
  }
}

export const SEARCH_REQUEST = 'SEARCH_REQUEST';
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS';
export const SEARCH_FAILURE = 'SEARCH_FAILURE';
