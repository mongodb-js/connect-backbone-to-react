const {useContext} = require('react');
const Context = require('./context');

function useBackboneContext() {
  const backboneContext = useContext(Context);

  if (backboneContext === undefined) {
    throw new Error('useBackboneContext must be called within a provider');
  }

  return Object.keys(backboneContext)
    .reduce((jsonContext, key) => {
      jsonContext[key] = backboneContext[key].toJSON();
      return jsonContext;
    }, {});
}

module.exports = useBackboneContext;
