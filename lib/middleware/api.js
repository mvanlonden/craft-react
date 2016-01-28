import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'
import 'isomorphic-fetch'


// Extracts the next page URL from Craft API response.
function getNextPageUrl(body) {
  const nextLink = body.meta.pagination.links.next;
  if (!nextLink) {
    return null
  }

  return nextLink;
}


const API_ROOT = 'http://prod-churchill.ideo.com/api/1.0/'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
function callApi(endpoint, schema) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1 && endpoint.indexOf('http') === -1) ? API_ROOT + endpoint : endpoint

  return fetch(fullUrl)
    .then(response =>
      response.json().then(json => ({ json, response }))
    ).then(({ json, response }) => {

      if (!response.ok) {
        return Promise.reject(json)
      }

      // If response contains meta data, prase the next page url, otherwise return null
      const nextPageUrl = json.meta ? getNextPageUrl(json) : null;

      // Populate schema with data, exclude meta data
      if (json.data) {
        json = json.data;
      }

      // console.log('json', json);
      if (json.items) {
        json = json.items
      }
      // console.log('json2', json);

      const camelizedJson = camelizeKeys(json)

      return Object.assign({},
        normalize(camelizedJson, schema),
        { nextPageUrl }
      )
    })
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const profileSchema = new Schema('profile', {
  idAttribute: 'slug'
})

const locationSchema = new Schema('location', {
  idAttribute: 'slug'
})

const caseStudySchema = new Schema('case-study', {
  idAttribute: 'slug'
})

const postSchema = new Schema('post', {
  idAttribute: 'slug'
})

const blogSchema = new Schema('blog', {
  idAttribute: 'slug'
})

const newsSchema = new Schema('news', {
  idAttribute: 'slug'
})

// TODO: change to get id from Craft
function generateSlug(entity) {
  return entity.sys.id;
}
const searchResultSchema = new Schema('search-result', {
  // TODO: change to slug
  idAttribute: generateSlug
  // idAttribute: 'slug'
})

// Schemas for Craft API responses.
export const Schemas = {
  PROFILE: profileSchema,
  SEARCH_RESULT_ARRAY: arrayOf(searchResultSchema),
  CASE_STUDY: caseStudySchema,
  LOCATION: locationSchema,
  LOCATION_ARRAY: arrayOf(locationSchema),
  POST: postSchema,
  NEWS: newsSchema,
  BLOG: blogSchema,
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API')

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = callAPI
  const { schema, types } = callAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))
  return callApi(endpoint, schema).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => next(actionWith({
      type: failureType,
      error: error.message || 'Something bad happened'
    }))
  )
}
