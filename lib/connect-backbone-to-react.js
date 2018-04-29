const hoistStatics = require('hoist-non-react-statics');
const { Component, createElement } = require('react');
const PropTypes = require('prop-types');
const debounceFn = require('lodash.debounce');

function getDisplayName(name) {
  return `connectBackboneToReact(${name})`;
}

function defaultMapModelsToProps(models) {
  return Object.keys(models).reduce((acc, modelKey) => {
    const model = models[modelKey];
    if (!model) return;

    acc[modelKey] = model.toJSON();
    return acc;
  }, {});
}

module.exports = function connectBackboneToReact(
  mapModelsToProps,
  options = {}
) {
  if (typeof mapModelsToProps !== 'function') {
    mapModelsToProps = defaultMapModelsToProps;
  }

  const {
    debounce = false,
    events = {},
    modelTypes = {},
  } = options;

  function getEventNames(modelName) {
    let eventNames = events[modelName];

    // Allow turning off event handlers by setting events to false.
    if (eventNames === false) {
      return [];
    }

    if (!Array.isArray(eventNames)) {
      return ['all'];
    }

    return eventNames;
  }

  function validateModelTypes(modelsMap) {
    return Object.keys(modelTypes).forEach(modelKey => {
      const ModelConstructor = modelTypes[modelKey];
      const modelInstance = modelsMap[modelKey];

      const isInstanceOfModel = modelInstance instanceof ModelConstructor;
      if (!isInstanceOfModel) {
        throw new Error(`"${modelKey}" model found on modelsMap does not match type required.`);
      }
    });
  }

  return function createWrapper(WrappedComponent) {
    const wrappedComponentName = WrappedComponent.displayName
      || WrappedComponent.name
      || 'Component';

    const displayName = getDisplayName(wrappedComponentName);

    class ConnectBackboneToReact extends Component {
      constructor(props, context) {
        super(props, context);

        const models = props.models || context.models;
        this.setModels(models);

        this.state = mapModelsToProps(this.models, this.props);

        this.createNewProps = this.createNewProps.bind(this);

        if (debounce) {
          const debounceWait = typeof debounce === 'number' ? debounce : 0;
          this.createNewProps = debounceFn(this.createNewProps, debounceWait);
        }

        this.createEventListeners();
      }

      setModels(models) {
        validateModelTypes(models);
        this.models = models;
      }

      createEventListeners() {
        Object.keys(this.models).forEach(mapKey => {
          const model = this.models[mapKey];
          // Do not attempt to create event listeners on an undefined model.
          if (!model) return;

          this.createEventListener(mapKey, model);
        });
      }

      createEventListener(modelName, model) {
        getEventNames(modelName).forEach(name => {
          model.on(name, this.createNewProps, this);
        });
      }

      createNewProps() {
        // Bail out if our component has been unmounted.
        // The only case where this flag is encountered is when this component
        // is unmounted within an event handler but the 'all' event is still triggered.
        // It is covered in a test case.
        if (this.hasBeenUnmounted) {
          return;
        }

        this.setState(mapModelsToProps(this.models, this.props));
      }

      componentWillReceiveProps(nextProps, nextContext) {
        this.setModels(nextProps, nextContext);
        this.createNewProps();

        // Bind event listeners for each model that changed.
        Object.keys(this.models).forEach(mapKey => {
          const model = this.models[mapKey];
          if ((this.props.models && this.props.models[mapKey] === this.models[mapKey]) ||
            (this.context.models && this.context.models[mapKey] === this.models[mapKey])) {
            return; // Did not change.
          }

          this.createEventListener(mapKey, model);
        });
      }

      componentWillReceiveProps(nextProps, nextContext) {
        const models = nextProps.models || nextContext.models;
        this.setModels(models);
        this.createNewProps();
      }

      componentWillUnmount() {
        if (debounce) {
          this.createNewProps.cancel();
        }

        Object.keys(this.models).forEach(mapKey => {
          const model = this.models[mapKey];
          // Do not attempt to remove event listeners on an undefined model.
          if (!model) return;

          getEventNames(mapKey).forEach(name => {
            model.off(name, this.createNewProps, this);
          });
        });

        this.hasBeenUnmounted = true;
      }

      render() {
        const wrappedProps = Object.assign(
          {},
          this.state,
          this.props
        );

        // Don't pass through models prop.
        wrappedProps.models = undefined;

        return createElement(WrappedComponent, wrappedProps);
      }
    }

    const propTypes = {
      models: PropTypes.object,
    };

    ConnectBackboneToReact.WrappedComponent = WrappedComponent;
    ConnectBackboneToReact.displayName = displayName;
    ConnectBackboneToReact.propTypes = propTypes;
    ConnectBackboneToReact.contextTypes = propTypes;

    return hoistStatics(ConnectBackboneToReact, WrappedComponent);
  };
};
