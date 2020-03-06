const assert = require('assert');
const {mount} = require('enzyme');
const {Model, Collection} = require('backbone');
const BackboneProvider = require('../lib/backbone-provider'); // eslint-disable-line no-unused-vars
const useBackboneContext = require('../lib/useBackboneContext');

describe('useBackboneContext', function() {
  let wrapper;

  function UnconnectedComponent() { // eslint-disable-line no-unused-vars
    const context = useBackboneContext();
    return (
      <div>
        <div className="name">
          {context.user.name}
        </div>
      </div>
    );
  }

  afterEach(function() {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('when the useBackboneContext hook is used outside of a provider', function() {
    it('throws a relevant error', function() {
      const expectedError = {
        message: 'useBackboneContext must be called within a provider',
      };
      assert.throws(() => mount(<UnconnectedComponent/>), expectedError);
    });
  });

  describe('when a descendent of the provider uses the useBackboneContext hook', function() {
    beforeEach(function() {
      const userModel = new Model({
        name: 'Harry',
        age: 25,
        hungry: true,
      });

      const userCollection = new Collection([userModel]);

      const modelsMap = {
        user: userModel,
        coll: userCollection,
      };

      wrapper = mount(
        <BackboneProvider models={modelsMap}>
          <UnconnectedComponent/>
        </BackboneProvider>
      );
    });

    it('renders the name as Harry ', function() {
      assert.equal(wrapper.find('.name').length, 1);
      assert.equal(wrapper.find('.name').text(), 'Harry');
    });

    describe('when the backbone data is updated', function() {
      beforeEach(function() {
        const model = new Model({
          name: 'Jill',
        });
        wrapper.setProps({
          models: {
            user: model,
          },
        });
      });

      it('should handle updates to passed props', function() {
        assert.equal(wrapper.find('.name').text(), 'Jill');
      });
    });
  });
});
