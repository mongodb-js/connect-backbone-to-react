const { Component, PropTypes, Children } = require('react');

class BackboneProvider extends Component {
  constructor(props, context) {
    super(props, context);

    this.modelsMap = props.models;
  }

  getChildContext() {
    return {
      models: this.modelsMap,
    };
  }

  render() {
    return Children.only(this.props.children);
  }
}

BackboneProvider.propTypes = {
  models: PropTypes.object,
  children: PropTypes.element.isRequired,
};
BackboneProvider.childContextTypes = {
  models: PropTypes.object,
};
BackboneProvider.displayName = 'BackboneProvider';

module.exports = BackboneProvider;
