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

        this.setModels(props, context);

        this.state = mapModelsToProps(this.models, this.props);

        this.createNewProps = this.createNewProps.bind(this);
        this.setWrappedInstance = this.setWrappedInstance.bind(this);

        if (debounce) {
          const debounceWait = typeof debounce === 'number' ? debounce : 0;
          this.createNewProps = debounceFn(this.createNewProps, debounceWait);
        }

        this.createEventListeners();
      }

      setModels(props, context) {
        const models = Object.assign({}, context.models, props.models);
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
        if (this.hasBeenUnmounted) {
          return;
        }

        this.setState(mapModelsToProps(this.models, this.props));
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

      componentWillReceiveProps(nextProps, nextContext) {
        this.setModels(nextProps, nextContext);
        this.createNewProps();

        // Bind event listeners for each model that changed.
        Object.keys(this.models).forEach(mapKey => {
          const model = this.models[mapKey];

          // Retrieve old versions of the model from props and context for comparison.
          const propsModel = this.props.models ? this.props.models[mapKey] : undefined;
          const contextModel = this.context.models ? this.context.models[mapKey] : undefined;

          // Do not attempt to create event listeners on an undefined model.
          if (!model) {
            // Instead, if it was previously defined, remove the old listeners.
            if (propsModel) {
              this.removeEventListener(mapKey, propsModel);
              // If a model with the matching mapKey exists in both props and context,
              // we only remove listeners from the one in props. We do this because
              // only the one in props is actually used in this.models, per the
              // Object.assign in setModel.
            } else if (contextModel) {
              this.removeEventListener(mapKey, contextModel);
            }
            return;
          }

          if ((propsModel === model) || (contextModel === model)) return; // Did not change.

          this.createEventListener(mapKey, model);
        });
      }

      componentWillUnmount() {
        if (debounce) {
          this.createNewProps.cancel();
        }

        Object.keys(this.models).forEach(mapKey => {
          const model = this.models[mapKey];
          // Do not attempt to remove event listeners on an undefined model.
          if (!model) return;
          this.removeEventListener(mapKey, model);
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
    ConnectBackboneToReact.contextTypes = propTypes;

    return hoistStatics(ConnectBackboneToReact, WrappedComponent);
  };
};
