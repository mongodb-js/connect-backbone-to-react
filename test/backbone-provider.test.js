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

  describe('when "modelsMap" is provided via BackboneProvider and a parent component', function() {
    it('merges models passed via BackboneProvider and a parent component', function() {
      class UserAndSettings extends Component {
        render() {
          return (
            <div>
              <div className="name">
                {this.props.user.name}
              </div>
              <div className="color">
                {this.props.settings.color}
              </div>
            </div>
          );
        }
      }
      // eslint-disable-next-line no-unused-vars
      const ConnectedUserAndSettings = connectBackboneToReact()(UserAndSettings);

      const settingsModel = new Model({
        color: 'purple',
      });
      const propsModelsMap = { settings: settingsModel };

      wrapper = mount(
        <BackboneProvider models={modelsMap}>
          <ConnectedUserAndSettings models={propsModelsMap}/>
        </BackboneProvider>
      );

      const modelsFromContext = wrapper
        .find('.name')
        .findWhere((n) => !n.type() && n.text() === userModel.get('name'))
        .length;
      const modelsFromParent = wrapper
        .find('.color')
        .findWhere((n) => !n.type() && n.text() === settingsModel.get('color'))
        .length;

      // Check that we've rendered data from models passed by both context and the parent component.
      assert.equal(modelsFromContext, 1);
      assert.equal(modelsFromParent, 1);
    });

    it('gives priority to models passed via a parent component', function() {
      const otherUserModel = new Model({
        name: 'Spencer',
        age: 22,
        hungry: true,
      });

      class PassingParent extends Component {
        render() {
          // We're using the same key (`user`) as the modelsMap passed via context.
          const propsModelsMap = { user: otherUserModel };

          return (
            <div>
              <div className="name">
                {this.props.user.name}
              </div>
              <div className="child-wrapper">
                <ConnectedChild models={propsModelsMap} />
              </div>
            </div>
          );
        }
      }
      // eslint-disable-next-line no-unused-vars
      const ConnectedPassingParent = connectBackboneToReact()(PassingParent);

      wrapper = mount(
        <BackboneProvider models={modelsMap}>
          <ConnectedPassingParent />
        </BackboneProvider>
      );

      const modelsFromContext = wrapper
        .find('.name')
        .findWhere((n) => !n.type() && n.text() === userModel.get('name'))
        .length;
      const modelsFromParent = wrapper
        .find('.child-wrapper')
        .find('.name')
        .findWhere((n) => !n.type() && n.text() === otherUserModel.get('name'))
        .length;

      // Check that we've given priority to models passed from the parent component.
      assert.equal(modelsFromContext, 1);
      assert.equal(modelsFromParent, 1);
    });
  });
});
