const hoistStatics = require('hoist-non-react-statics');
const { Component, createElement } = require('react');
const debounceFn = require('lodash.debounce');
const isArray = require('lodash.isArray');

function getDisplayName(name) {
  return `connectBackboneToReact(${name})`;
}

function defaultModelsToProps(models) {
  return Object.keys(models).reduce((acc, modelKey) => {
    const model = models[modelKey];
    acc[modelKey] = model.toJSON();
    return acc;
  }, {});
}

module.exports = function connectBackboneToReact(
  modelsMap = {},
  modelsToProps = defaultModelsToProps,
  options = {}
) {
  if (arguments.length === 2 && typeof modelsToProps !== 'function') {
    options = modelsToProps;
    modelsToProps = defaultModelsToProps;
  }

  const {
    debounce = false,
    events = {},
  } = options;

  function getEventNames(modelName) {
    let eventNames = events[modelName];

    // Allow turning off event handlers by setting events to false.
    if (eventNames === false) {
      return [];
    }

    if (!isArray(eventNames)) {
      eventNames = [];
    }

    if (eventNames.length === 0) {
      eventNames.push('all');
    }

    return eventNames;
  }

  return function createWrapper(WrappedComponent) {
    function getProps() {
      return modelsToProps(modelsMap);
    }

    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    const displayName = getDisplayName(wrappedComponentName);

    class Connect extends Component {
      constructor(state, props) {
        super(state, props);

        this.state = getProps();

        this.createNewProps = this.createNewProps.bind(this);

        if (debounce) {
          const debounceWait = typeof debounce === 'number' ? debounce : 0;
          this.createNewProps = debounceFn(this.createNewProps, debounceWait);
        }

        this.createEventListeners();
      }

      createEventListeners() {
        Object.keys(modelsMap).forEach(mapKey => {
          const model = modelsMap[mapKey];

          getEventNames(mapKey).forEach(name => {
            model.on(name, this.createNewProps, this);
          });
        });
      }

      createNewProps() {
        this.setState(getProps());
      }

      componentWillUnmount() {
        if (debounce) {
          this.createNewProps.cancel();
        }

        Object.keys(modelsMap).forEach(mapKey => {
          const model = modelsMap[mapKey];

          getEventNames(mapKey).forEach(name => {
            model.off(name, this.createNewProps, this);
          });
        });
      }

      render() {
        const wrappedProps = Object.assign({}, this.state, this.props);
        return createElement(WrappedComponent, wrappedProps);
      }
    }

    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = displayName;

    return hoistStatics(Connect, WrappedComponent);
  };
};
