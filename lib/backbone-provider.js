const React = require('react');
const {Children, Component} = React;
const PropTypes = require('prop-types');
const ConnectBackboneToReactContext = require('./context.js'); // eslint-disable-line no-unused-vars

class BackboneProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      models: props.models,
    };
  }

  render() {
    return (
      <ConnectBackboneToReactContext.Provider value={this.state}>
        {Children.only(this.props.children)}
      </ConnectBackboneToReactContext.Provider>
    );
  }
}

BackboneProvider.propTypes = {
  models: PropTypes.object,
  children: PropTypes.element.isRequired,
};
BackboneProvider.displayName = 'BackboneProvider';

module.exports = BackboneProvider;
