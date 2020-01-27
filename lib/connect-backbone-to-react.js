const hoistStatics = require('hoist-non-react-statics');
const { Component, createElement } = require('react');
const PropTypes = require('prop-types');
const debounceFn = require('lodash.debounce');
const BackboneToReactContext = require('./context');

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
    withRef = false,
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

        this.componentIsMounted = false;

        this.createNewProps = this.createNewProps.bind(this);
        this.setWrappedInstance = this.setWrappedInstance.bind(this);

        if (debounce) {
          const debounceWait = typeof debounce === 'number' ? debounce : 0;
          this.createNewProps = debounceFn(this.createNewProps, debounceWait);
        }

        this.createEventListeners();
      }

      getModels() {
        const models = Object.assign({}, this.context, this.props.models);
        validateModelTypes(models);
        return models;
      }

      createEventListeners() {
        const models = this.getModels();
        Object.keys(models).forEach(mapKey => {
          const model = models[mapKey];
          // Do not attempt to create event listeners on an undefined model.
          if (!model) return;

          this.createEventListener(mapKey, model);
        });

        // Store a reference to the models with event listeners for the next update.
        this.prevModels = models;
      }

      createEventListener(modelName, model) {
        getEventNames(modelName).forEach(name => {
          model.on(name, this.createNewProps, this);
        });
      }

      removeEventListener(modelName, model) {
        getEventNames(modelName).forEach(name => {
          model.off(name, this.createNewProps, this);
        });
      }

      createNewProps() {
        // Bail out if our component has been unmounted.
        // The only case where this flag is encountered is when this component
        // is unmounted within an event handler but the 'all' event is still triggered.
        // It is covered in a test case.
        // Also bails if we haven't yet mounted, to avoid warnings in strict mode.
        if (!this.componentIsMounted) {
          return;
        }
        this.forceUpdate();
      }

      setWrappedInstance(ref) {
        this.wrappedInstance = ref;
      }

      getWrappedInstance() {
        if (!withRef) {
          throw new Error('getWrappedInstance() requires withRef to be true.');
        }

        return this.wrappedInstance;
      }

      componentDidMount() {
        this.componentIsMounted = true;
      }

      componentDidUpdate() {
        // add and remove listeners
        const models = this.getModels();
        const prevModels = this.prevModels;

        // Bind event listeners for each model that changed.
        Object.keys(Object.assign({}, models, prevModels)).forEach(mapKey => {
          const model = models[mapKey];
          const prevModel = prevModels[mapKey];

          // Do not attempt to create event listeners on an undefined model.
          if (!model) {
            // Instead, if it was previously defined, remove the old listeners.
            if (prevModel) {
              this.removeEventListener(mapKey, prevModel);
            }
            return;
          }

          if (prevModel === model) return; // Did not change.

          this.createEventListener(mapKey, model);
        });

        // Store a reference to the models with event listeners for the next update.
        this.prevModels = models;
      }

      componentWillUnmount() {
        if (debounce) {
          this.createNewProps.cancel();
        }

        Object.keys(this.prevModels).forEach(mapKey => {
          const model = this.prevModels[mapKey];
          // Do not attempt to remove event listeners on an undefined model.
          if (!model) return;
          this.removeEventListener(mapKey, model);
        });

        this.componentIsMounted = false;
      }

      render() {
        const wrappedProps = Object.assign(
          {},
          mapModelsToProps(this.getModels(), this.props),
          this.props
        );

        // Don't pass through models prop.
        wrappedProps.models = undefined;

        if (withRef) {
          wrappedProps.ref = this.setWrappedInstance;
        }

        return createElement(WrappedComponent, wrappedProps);
      }
    }

    const propTypes = {
      models: PropTypes.object,
    };

    ConnectBackboneToReact.WrappedComponent = WrappedComponent;
    ConnectBackboneToReact.displayName = displayName;
    ConnectBackboneToReact.propTypes = propTypes;
    ConnectBackboneToReact.contextType = BackboneToReactContext;

    return hoistStatics(ConnectBackboneToReact, WrappedComponent);
  };
};
