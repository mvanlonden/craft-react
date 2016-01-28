# Craft React

Bind your react component props to Craft's [element api](https://github.com/pixelandtonic/ElementAPI)

## Installation
`npm i --save craft-react`


## Config
Since we are using redux to manage our store we need to configure the provider on our top level component
```
import { configureStore } from 'craft-react'

const store = configureStore()

ReactDOM.render((
  <Provider store={ store }>
    <PostComponent />
  </Provider>
), rootNode
```

## Example

### Single entity with slug
For an craft element api configured as
```
'api/post/<slug:{slug}>' => function($slug) {
  return [
    'criteria' => [
      'section' => 'profile',
      'slug' => $slug
    ],
    'first' => true,
    'transformer' => function(EntryModel $entry) {

      return [
        'slug' => $entry->slug,
        'title' => $entry->title,
        'postDate' => $entry->postDate,
        'content' => $entry->content,
      ];
    },
  ];
}
```

At a front-end endpoint of `mysupercoolblog.com/post/a-post-slug`
```
import React, { Component } from 'react';
import loadContent from 'craft-react'

class PostComponent extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <h1>{ this.props.title }</h1>
      <span className="date">{ this.props.postDate }</h1>
      <p>{ this.props.content }</p>
    )
  }
}

export default loadContent()(PostComponent)
```

If the craft endpoints don't align with the front-end endpoints the `contentType` and the `slug` can be passed to the `loadContent` method
```
import React, { Component } from 'react';
import loadContent from 'craft-react'

class PostComponent extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <h1>{ this.props.title }</h1>
      <span className="date">{ this.props.postDate }</h1>
      <p>{ this.props.content }</p>
    )
  }
}

export default loadContent('post', 'a-post-slug')(PostComponent)
```

### Multiple entities

```
import React, { Component } from 'react';
import loadContent from 'craft-react'

class PostList extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return posts = this.props.posts.map((post) => {
        return <li>post.title</li>
      })
    return (
      <ul>
        { posts }
      </ul>
    )
  }
}

export default loadContent({ contentType: 'post', mapToProp: 'posts' }, null, true)(PostList)
```
pagination example coming soon...


## API
`loadContent([contentType || {contentType: 'type', mapToProps: 'propName'}], [slug], [isMultiple])(MyComponent)`
