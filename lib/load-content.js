import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadEntity, loadEntities } from './actions'
import { isObject, merge } from 'lodash'
import { camelizeKeys } from 'humps'



export default function loadContent(contentType, slug, isMultiple) {
  if (isObject(contentType)) {
    var { mapToProp } = contentType
    contentType = contentType.contentType
  }

  function loadData(contentType, slug, props) {
    // Load profile for slug
    if (isMultiple) {
      return props.loadEntities(contentType)
    }
    props.loadEntity(contentType, slug);
  }

  return function wrapWithLoadContent(WrappedComponent) {
    class LoadContent extends Component {
      constructor(props) {
        super(props)
      }

      componentWillMount() {
        contentType = contentType ? contentType : this.props.contentType
        slug = slug ? slug : this.props.slug
        loadData(contentType, slug, this.props);
      }

      render() {
        if (this.props.isLoading) {
          return <h1>Loading...</h1>
        }
        let { loadEntity, loadEntities, isLoading, ...childProps } = this.props
        childProps = camelizeKeys(childProps)
        return <WrappedComponent {...childProps} />
      }
    }


    // Takes the redux state and maps it to the props of the component
    function mapStateToProps(state) {
      const {
        routing: {
          path
        }
      } = state
      let props = {}

      if (isMultiple) {
        const entities = state.entities[contentType]
        props[mapToProp] = entities
        props.isLoading = !props[mapToProp]
        return props
      }

      const pathSplit = path.split('/')
      contentType = contentType ? contentType : pathSplit[1]
      slug = slug ? slug : pathSplit[2]
      let metaProps = {
        contentType: contentType,
        slug: slug,
      }

      const contentEntity = state.entities[contentType]
      if (!contentEntity) {
        return merge(metaProps, {
          isLoading: true
        })
      }
      const currentEntity = contentEntity[slug]

      props[contentType] = currentEntity
      return merge(props, metaProps, {
        isLoading: !props[contentType]
      })
    }

    // Map actions to component props and wrap component in higher order component to connect to redux
    return connect(mapStateToProps, { loadEntity, loadEntities })(LoadContent)
  }
}
