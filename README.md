# connect-backbone-to-react [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Connect Backbone Models and Collections to React.

## Example

### connectBackboneToReact

```javascript
const UserModel = Backbone.Model.extend();
const UserCollection = Backbone.Collection.extend({ model: UserModel });

const userInstance = new UserModel({ name: 'Harry', laughs: true });
const userCollection = new UserCollection([userInstance]);

class MyComponent extends React.Component {
  render() {
    return (
      <div>
        My user laughs: {this.props.doesUserLaugh}

        <h4>All Users</h4>
        <div>
          {this.props.users.map(user => (
            <div key={user.name}>{user.name}</div>
          ))}
        </div>
      </div>
    );
  }
}

// Maps Models to properties to give to the React Component. Optional.
// Default behavior is to call `.toJSON()` on every Model and Collection.
const mapModelsToProps = (models) => {
  const { user, allUsers } = models;

  // Everything returned from this function will be given as a prop to your Component.
  return {
    doesUserLaugh: user.get('laughs'),
    users: allUsers.toJSON(),
    setUserLaughs(newVal) {
      user.set('laughs', newVal);
    },
  };
};

// Options.
const options = {
  // Should our event handler function be wrapped in a debounce function
  // to prevent many re-renders.
  debounce: false, // or `true`, or a number that will be used in the debounce function.

  // Define what events you want to listen to on your Backbone Model or Collection
  // that will cause your React Component to re-render.
  // By default it's ['all'] for every Model and Collection given.
  events: {
    user: ['change:name', 'change:laughs'],
    // You can disable listening to events by passing in `false` or an empty array.
  },

  // Define what modelTypes you expect to be contained on your `modelsMap` object.
  // Useful for validating that you'll be given what model type you expect.
  // Uses instanceof, and throws an error if instanceof returns false.
  // By default no modelTypes are defined.
  modelTypes: {
    user: UserModel,
    allUsers: UserCollection,
  },
};

const { connectBackboneToReact } = require('connect-backbone-to-react');

// Create our Connected Higher order Component (HOC).
const MyComponentConnected = connectBackboneToReact(mapModelsToProps, options)(MyComponent);
```

Now that you've created your HOC you can use it!

```javascript
// Map your Backbone Model and Collections to names that will be provided to
// your mapModelsToProps function.
const modelsMap = {
  user: userInstance,
  allUsers: userCollection,
},

ReactDOM.render(
  // Pass the modelsMap to the HOC via the models prop.
  <MyComponentConnected models={modelsMap} />,
  document.getElementById('app')
);
```

### BackboneProvider

Alternatively you might have a tree of connected Components. We shouldn't pass that `modelsMap` object from one component to another. Instead we can take inspiration from [react-redux's Provider component](https://github.com/reactjs/react-redux/blob/master/docs/api.md#provider-store).

```javascript
const { BackboneProvider } = require('connect-backbone-to-react');

const modelsMap = {
  user: userInstance,
  allUsers: userCollection,
},

ReactDOM.render(
  // Pass the modelsMap to the BackboneProvider via the models prop.
  // It will then get shared to every child connected component via React's context.
  <BackboneProvider models={modelsMap}>
    <MyComponentConnected>
      <MyComponentConnected />
    </MyComponentConnected>
  </BackboneProvider>,
  document.getElementById('app')
);
```

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/connect-backbone-to-react.svg
[travis_url]: https://travis-ci.org/mongodb-js/connect-backbone-to-react
[npm_img]: https://img.shields.io/npm/v/connect-backbone-to-react.svg
[npm_url]: https://npmjs.org/package/connect-backbone-to-react
