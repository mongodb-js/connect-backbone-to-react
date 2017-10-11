const assert = require('assert');
const { mount } = require('enzyme');
const sinon = require('sinon');
const React = require('react');
const { Component } = React;
const { Model, Collection } = require('backbone');
const BackboneProvider = require('../lib/backbone-provider'); // eslint-disable-line no-unused-vars
const connectBackboneToReact = require('../lib/connect-backbone-to-react');

describe('BackboneProvider', function() {
  let sandbox;
  let wrapper;
  let componentStub;
  let modelsMap;

  let userModel;
  let userCollection;

  class Child extends Component {
    render() {
      return (
        <div className="name">
          {this.props.user.name}
        </div>
      );
    }
  }

  // eslint-disable-next-line no-unused-vars
  const ConnectedChild = connectBackboneToReact()(Child);

  class Parent extends Component {
    render() {
      return (
        <div>
          <div className="name">
            {this.props.user.name}
          </div>
          <ConnectedChild />
        </div>
      );
    }
  }

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    userModel = new Model({
      name: 'Harry',
      age: 25,
      hungry: true,
    });

    userCollection = new Collection([userModel]);

    modelsMap = {
      user: userModel,
      coll: userCollection,
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('when "modelsMap" is provided via BackboneProvider', function() {
    let renderSpy;
    beforeEach(function() {
      const ConnectedParent = connectBackboneToReact()(Parent);
      renderSpy = sandbox.spy(ConnectedParent.prototype, 'render');

      wrapper = mount(
        <BackboneProvider models={modelsMap}>
          <ConnectedParent />
        </BackboneProvider>
      );
      componentStub = wrapper.find(Parent);

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('passes mapped models and collections as properties to wrapped component', function() {
      assert.deepEqual(componentStub.props().user, userModel.toJSON());
      assert.deepEqual(componentStub.props().coll, userCollection.toJSON());
    });

    it('two instances of Harry text are rendered', function() {
      assert.equal(wrapper.find('.name').length, 2);
    });

    it('every connected Component is given the same "modelsMap"', function() {
      assert(
        wrapper.find('.name').everyWhere(n => n.text() === 'Harry')
      );
    });

    it('should handle updates to passed props', function() {
      const model = new Model({ name: 'Jill' });
      wrapper.setProps({ models: { user: model }});

      assert(wrapper.find('.name').everyWhere(n => n.text() === 'Jill'));
    });
  });
});
