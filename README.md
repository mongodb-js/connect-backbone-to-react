# connect-backbone-to-react [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Connect Backbone Models and Collections to React.

## Example

```javascript
const userModel = new Backbone.Model({ name: 'Harry', laughs: true });
const userCollection = new Backbone.Collection([userModel]);

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

const WrappedComponent = connectBackboneToReact(
  // Map your Backbone Model and Collections to names that will be provided to
  // connectBackboneToReact's mapModelsToProps function.
  {
    user: userModel,
    allUsers: userCollection,
  },

  // Maps Models to properties to give to the React Component. Optional.
  // Default behavior is to call `.toJSON()` on every Model and Collection.
  function mapModelsToProps(models) {
    const { user, allUsers } = models;

    // Everything returned from this function will be given as a prop to your Component.
    return {
      doesUserLaugh: user.get('laughs'),
      users: allUsers.toJSON(),
      setUserLaughs(newVal) {
        user.set('laughs', newVal);
      },
    };
  }

  // Options.
  {
    // Should our event handler function be wrapped in a debounce function
    // to prevent many re-renders.
    debounce: false, // or `true`, or a number that will be used in the debounce function.

    // Define what events you want to listen to on your Backbone Model or Collection
    // that will cause your React Component to re-render.
    // By default it's ['all'] for every Model and Collection given.
    events: {
      user: ['change:name', 'change:laughs'], // You can disable listening to events by passing in `false`.
    },
  }
)(MyComponent);

ReactDOM.render(
  <WrappedComponent />,
  document.getElementById('app')
);
```

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/connect-backbone-to-react.svg
[travis_url]: https://travis-ci.org/mongodb-js/connect-backbone-to-react
[npm_img]: https://img.shields.io/npm/v/connect-backbone-to-react.svg
[npm_url]: https://npmjs.org/package/connect-backbone-to-react
