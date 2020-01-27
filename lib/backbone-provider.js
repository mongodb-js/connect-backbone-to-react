const { Children, createElement } = require('react');
const PropTypes = require('prop-types');
const { Provider } = require('./context');

function BackboneProvider() {
  return createElement(Provider, { value: this.props.models }, Children.only(this.props.children));
}

BackboneProvider.propTypes = {
  models: PropTypes.object,
  children: PropTypes.element.isRequired,
};
BackboneProvider.displayName = 'BackboneProvider';

module.exports = BackboneProvider;
