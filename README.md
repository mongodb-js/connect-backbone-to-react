# connect-backbone-to-react [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

> Connect Backbone Models and Collections to React.

## Usage

`npm install connect-backbone-to-react` or `yarn add connect-backbone-to-react` in your React/Backbone project. See code samples below to how to integrate into your code.

## Example

[![Edit connectBackboneToReact](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/l5n4m0qk79?module=%2FDemo.js)

### connectBackboneToReact

```javascript
const UserModel = Backbone.Model.extend();
const UserCollection = Backbone.Collection.extend({ model: UserModel });

const userInstance = new UserModel({ name: "Harry", laughs: true });
const anotherUserInstance = new UserModel({ name: "Samantha", laughs: false });
const userCollection = new UserCollection([userInstance, anotherUserInstance]);

class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <p>My user laughs: {this.props.doesUserLaugh ? "yes" : "no"}</p>
        <button
          onClick={() => this.props.setUserLaughs(!this.props.doesUserLaugh)}
        >
          Toggle Laughing User
        </button>
        <h4>All Users</h4>
        <ul>
          {this.props.users.map(user => (
            <li key={user.name}>{user.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

// Maps Models to properties to give to the React Component. Optional.
// Default behavior is to call `.toJSON()` on every Model and Collection.
// Second argument are props given to the React Component.
const mapModelsToProps = (models, props) => {
  const { user, allUsers } = models;
  const { showOnlyLaughingUsers } = props;

  // Everything returned from this function will be given as a prop to your Component.
  return {
    doesUserLaugh: user.get("laughs"),
    users: showOnlyLaughingUsers
      ? allUsers.toJSON().filter(user => user.laughs === true)
      : allUsers.toJSON(),
    setUserLaughs(newVal) {
      user.set("laughs", newVal);
    }
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
    user: ["change:name", "change:laughs"]
    // You can disable listening to events by passing in `false` or an empty array.
  },

  // Define what modelTypes you expect to be contained on your `modelsMap` object.
  // Useful for validating that you'll be given what model type you expect.
  // Uses instanceof, and throws an error if instanceof returns false.
  // By default no modelTypes are defined.
  modelTypes: {
    user: UserModel,
    allUsers: UserCollection
  },

  // Enable access to the wrapped component's ref with the `withRef` option.
  // You can then access the wrapped component from the connected component's `getWrappedInstance()`.
  // This is similar to react-redux's connectAdvanced() HOC.
  // By default, `withRef` is false.
  withRef: true
};

const { connectBackboneToReact } = require("connect-backbone-to-react");

// Create our Connected Higher order Component (HOC).
const MyComponentConnected = connectBackboneToReact(
  mapModelsToProps,
  options
)(MyComponent);
```

Now that you've created your HOC you can use it!

```javascript
// Map your Backbone Model and Collections to names that will be provided to
// your mapModelsToProps function.
const modelsMap = {
  user: userInstance,
  allUsers: userCollection
};

ReactDOM.render(
  // Pass the modelsMap to the HOC via the models prop.
  <MyComponentConnected models={modelsMap} showOnlyLaughingUsers={true} />,
  document.getElementById("app")
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

## Rendering React Within Backbone.View

This library's focus is on sharing Backbone.Models with React Components. It is not concerned with how to render React Components within Backbone.Views. [The React docs provide a possible implementation for this interopt.](https://reactjs.org/docs/integrating-with-other-libraries.html#embedding-react-in-a-backbone-view)

## Local development

To develop this library locally, run the following commands in the project root directory:

1. `npm run watch`. The library will be automatically compiled in the background as you make changes.
2. `npm link` and then follow the instructions to use the local version of this library in another project that uses `connect-backbone-to-react`.

Run `npm test` to run the unit tests.

### Releasing a new version

1. Make sure you have up to date `node_modules` before you proceed. Can be done via `npm ci`
2. Update the version via: `npm run release -- --release-as=major|minor|patch`
3. Optionally manually edit the revised `CHANGELOG.md` file. Commit changes.
4. Follow the directions from step 2: run `git push --follow-tags origin master; npm publish` to publish
5. Rejoice!

## License

Apache 2.0

[travis_img]: https://img.shields.io/travis/mongodb-js/connect-backbone-to-react.svg
[travis_url]: https://travis-ci.org/mongodb-js/connect-backbone-to-react
[npm_img]: https://img.shields.io/npm/v/connect-backbone-to-react.svg
[npm_url]: https://npmjs.org/package/connect-backbone-to-react
