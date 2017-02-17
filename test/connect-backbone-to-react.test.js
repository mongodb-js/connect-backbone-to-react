const assert = require('assert');
const { mount } = require('enzyme');
const sinon = require('sinon');
const _ = require('lodash');
const React = require('react');
const { Component } = React;
const { Model, Collection } = require('backbone');
const connectBackboneToReact = require('../lib/connect-backbone-to-react');

describe('connectBackboneToReact', function() {
  let sandbox;
  let wrapper;
  let stub;
  let modelsMap;
  let mapModelsToProps;

  let userModel;
  const UserModel = Model.extend({
  });

  let userCollection;
  const UserCollection = Collection.extend({
    model: UserModel,
  });

  let settingsModel;
  const SettingsModel = Model.extend({
  });

  class TestComponent extends Component {
    render() {
      return (
        <div>
          <div className="name">
            {this.props.name}
          </div>
          <div className="age">
            {this.props.age}
          </div>
          <div className="hungry">
            {this.props.hungry ? 'hungry' : 'not hungry'}
          </div>
        </div>
      );
    }
  }

  function getModelEventHandlerNames(model, instance) {
    return _.reduce(model._events, (acc, events, eventName) => {
      const eventListeners = events.filter(e => e.context === instance);

      if (eventListeners.length > 0) {
        acc.push(eventName);
      }

      return acc;
    }, []);
  }

  function getEventHandlersSetCount(model, instance) {
    return getModelEventHandlerNames(model, instance).length;
  }

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    userModel = new UserModel({
      name: 'Harry',
      age: 25,
      hungry: true,
    });

    userCollection = new UserCollection([userModel]);

    modelsMap = {
      user: userModel,
      coll: userCollection,
    };

    mapModelsToProps = function({ user, coll }) {
      return {
        name: user.get('name'),
        age: user.get('age'),
        hungry: user.get('hungry'),
        changeName: function(newName) {
          user.set('name', newName);
        },
        users: coll.toJSON(),
      };
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('when mounted', function() {
    let renderSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);
      renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('passes mapped models and collections as properties to wrapped component', function() {
      assert.equal(stub.props().name, 'Harry');
      assert.equal(stub.props().age, 25);
      assert.equal(stub.props().hungry, true);
      assert.equal(typeof stub.props().changeName, 'function');
      assert.deepEqual(stub.props().users, [ { name: 'Harry', age: 25, hungry: true } ]);
    });

    it('renders wrapped component', function() {
      assert.equal(wrapper.find('.name').text(), 'Harry');
      assert.equal(wrapper.find('.age').text(), '25');
      assert.equal(wrapper.find('.hungry').text(), 'hungry');
    });

    it('updates properties when props function changes models and collections ', function() {
      const newName = 'The Loud One';
      stub.props().changeName(newName);
      assert.equal(userModel.get('name'), newName);
      assert.equal(stub.props().name, newName);

      assert.equal(renderSpy.callCount, 4);
    });

    it('updates properties when model and collections change', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      assert.equal(userModel.get('name'), newName);
      assert.equal(stub.props().name, newName);

      assert.equal(renderSpy.callCount, 4);
    });

    it('creates listeners for every model', function() {
      const wrapperInstance = wrapper.instance();
      Object.keys(modelsMap).forEach(modelKey => {
        const model = modelsMap[modelKey];

        assert.equal(getEventHandlersSetCount(model, wrapperInstance), 1);
      });
    });

    it('removes listeners when unmounting', function() {
      const wrapperInstance = wrapper.instance();
      wrapper.unmount();

      Object.keys(modelsMap).forEach(modelKey => {
        const model = modelsMap[modelKey];

        assert.equal(getEventHandlersSetCount(model, wrapperInstance), 0);
      });
    });

    it('does not pass through the models prop to the wrapped component', function() {
      assert.equal(stub.props().models, undefined);
    });
  });

  describe('when mounted with debounce set to true', function() {
    let renderSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(
        mapModelsToProps,
        { debounce: true }
      )(TestComponent);
      renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('updates properties when model and collections change', function(done) {
      const newName = 'Banana';
      userModel.set('name', newName);

      setTimeout(() => {
        assert.equal(userModel.get('name'), newName);
        assert.equal(stub.props().name, newName);

        assert.equal(renderSpy.callCount, 1);

        done();
      }, 0);
    });

    it('does not throw when unmounted while debounce is running', function() {
      const newName = 'Banana';
      userModel.set('name', newName);

      wrapper.unmount();

      assert.equal(userModel.get('name'), newName);
      assert.equal(stub.props().name, 'Harry');

      assert.equal(renderSpy.callCount, 0);
    });
  });

  describe('when mounted with custom event names', function() {
    let renderSpy;
    let wrapperInstance;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(
        mapModelsToProps,
        {
          events: {
            user: ['change:name'],
            coll: false,
          },
        }
      )(TestComponent);
      renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
      wrapperInstance = wrapper.instance();

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('sets one event handler on the userModel', function() {
      assert.equal(getEventHandlersSetCount(userModel, wrapperInstance), 1);
      assert.deepEqual(getModelEventHandlerNames(userModel, wrapperInstance), ['change:name']);
    });

    it('sets 0 event handlers on the userCollection', function() {
      assert.equal(getEventHandlersSetCount(userCollection, wrapperInstance), 0);
    });

    it('updates properties when model\'s name changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);

      assert.equal(userModel.get('name'), newName);
      assert.equal(stub.props().name, newName);
    });

    it('rerenders when tracked property changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      assert.equal(renderSpy.callCount, 1);
    });

    it('does not update properties when non tracked property changes', function() {
      const newAge = 99;
      userModel.set('age', newAge);

      assert.equal(userModel.get('age'), newAge);
      assert.equal(stub.props().age, 25);

      assert.equal(renderSpy.callCount, 0);
    });

    it('does not rerender when non tracked property changes', function() {
      const newAge = 99;
      userModel.set('age', newAge);
      assert.equal(renderSpy.callCount, 0);
    });
  });

  describe('when mounted with props given to connected component', function() {
    let connectedProps = {
      fruit: 'banana',
      peeled: true,
      age: 1,
    };

    beforeEach(function() {
      // eslint-disable-next-line no-unused-vars
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);
      wrapper = mount(<ConnectedTest models={modelsMap} {...connectedProps} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('passes connectedProps through', function() {
      assert.equal(stub.props().fruit, 'banana');
      assert.equal(stub.props().peeled, true);
    });

    it('overwrites mapModelsToProps', function() {
      assert.equal(stub.props().age, 1);
    });
  });

  describe('when only given modelsMap object', function() {
    let renderSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact()(TestComponent);
      renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('uses default mapModelsToProps function', function() {
      assert.equal(stub.props().user.name, 'Harry');
      assert.equal(stub.props().user.age, 25);
      assert.equal(stub.props().user.hungry, true);
    });

    it('creates default event listeners for every model', function() {
      const wrapperInstance = wrapper.instance();
      Object.keys(modelsMap).forEach(modelKey => {
        const model = modelsMap[modelKey];

        assert.equal(getEventHandlersSetCount(model, wrapperInstance), 1);
      });
    });

    it('creates default event handlers of "all"', function() {
      const wrapperInstance = wrapper.instance();
      Object.keys(modelsMap).forEach(modelKey => {
        const model = modelsMap[modelKey];

        assert.deepEqual(getModelEventHandlerNames(model, wrapperInstance), ['all']);
      });
    });

    it('re-renders props when model changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);

      assert.equal(stub.props().user.name, 'Banana');

      assert.equal(renderSpy.callCount, 4);
    });
  });

  describe('when given modelsMap and options object', function() {
    let renderSpy;
    let wrapperInstance;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(
        null,
        {
          events: {
            user: ['change:name'],
            coll: false,
          },
        }
      )(TestComponent);
      renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);

      wrapperInstance = wrapper.instance();

      // Don't track initial render.
      renderSpy.reset();
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('uses default mapModelsToProps function', function() {
      assert.equal(stub.props().user.name, 'Harry');
      assert.equal(stub.props().user.age, 25);
      assert.equal(stub.props().user.hungry, true);
    });

    it('sets one event handler on the userModel', function() {
      assert.deepEqual(getModelEventHandlerNames(userModel, wrapperInstance), ['change:name']);
    });

    it('sets 0 event handlers on the userCollection', function() {
      assert.equal(getEventHandlersSetCount(userCollection, wrapperInstance), 0);
    });

    it('re-renders props when model changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);

      assert.equal(stub.props().user.name, 'Banana');

      assert.equal(renderSpy.callCount, 1);
    });
  });

  describe('when modelTypes are defined on the options object', function() {
    describe('and the model given is not an instance of required modelType', function() {
      let renderSpy;
      let errObj;

      beforeEach(function() {
        const ConnectedTest = connectBackboneToReact(
          null,
          {
            modelTypes: {
              user: UserModel,
            },
          }
        )(TestComponent);
        renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

        settingsModel = new SettingsModel();
        modelsMap = {
          user: settingsModel,
        };

        try {
          wrapper = mount(<ConnectedTest models={modelsMap} />);
        } catch (e) {
          errObj = e;
        }
      });

      it('does not render', function() {
        assert.equal(renderSpy.callCount, 0);
      });

      it('throws an error', function() {
        assert(errObj);
        assert.equal(errObj.message, '"user" model found on modelsMap does not match type required.');
      });
    });

    describe('and the modelType required is a parent class', function() {
      let renderSpy;
      let errObj;

      beforeEach(function() {
        const ConnectedTest = connectBackboneToReact(
          null,
          {
            modelTypes: {
              user: Model,
            },
          }
        )(TestComponent);
        renderSpy = sandbox.spy(ConnectedTest.prototype, 'render');

        try {
          wrapper = mount(<ConnectedTest models={modelsMap} />);
        } catch (e) {
          errObj = e;
        }
      });

      it('renders', function() {
        assert.equal(renderSpy.callCount, 1);
      });

      it('does not throw an error', function() {
        assert(errObj == null);
      });
    });
  });
});
