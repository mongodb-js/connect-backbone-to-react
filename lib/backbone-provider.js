const { Component, PropTypes, Children } = require('react');

class BackboneProvider extends Component {
  getChildContext() {
    return {
      models: this.props.models,
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
