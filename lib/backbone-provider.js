const { Children, createElement } = require('react');
const PropTypes = require('prop-types');
const { Provider } = require('./context');

function BackboneProvider(props) {
  return createElement(Provider, { value: props.models }, Children.only(props.children));
}

BackboneProvider.propTypes = {
  models: PropTypes.object,
  children: PropTypes.element.isRequired,
};
BackboneProvider.displayName = 'BackboneProvider';

module.exports = BackboneProvider;
