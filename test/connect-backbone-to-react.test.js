const assert = require('assert');
const { mount } = require('enzyme');
const sinon = require('sinon');
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
  const UserModel = Model.extend({});

  let userCollection;
  const UserCollection = Collection.extend({
    model: UserModel,
  });

  let settingsModel;
  const SettingsModel = Model.extend({});

  let userOnSpy;
  let userOffSpy;
  let collOnSpy;
  let collOffSpy;

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

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    userModel = new UserModel({
      name: 'Harry',
      age: 25,
      hungry: true,
    });

    userCollection = new UserCollection([userModel]);

    userOnSpy = sandbox.spy(userModel, 'on');
    collOnSpy = sandbox.spy(userCollection, 'on');
    userOffSpy = sandbox.spy(userModel, 'off');
    collOffSpy = sandbox.spy(userCollection, 'off');

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
    let forceUpdateSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      if (wrapper.exists()) wrapper.unmount();
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
      stub.prop('changeName')(newName);
      wrapper.update();
      assert.equal(userModel.get('name'), newName);
      assert.equal(wrapper.find(TestComponent).prop('name'), newName);

      assert.equal(forceUpdateSpy.callCount, 4);
    });

    it('updates properties when model and collections change', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      wrapper.update();
      assert.equal(wrapper.find('.name').text(), 'Banana');
      assert.equal(userModel.get('name'), newName);
      assert.equal(wrapper.find(TestComponent).prop('name'), newName);

      assert.equal(forceUpdateSpy.callCount, 4);
    });

    it('creates listeners for every model', function() {
      assert(userOnSpy.calledOnce);
      assert.equal(userOnSpy.firstCall.args[0], ['all']);

      assert(collOnSpy.calledOnce);
      assert.equal(collOnSpy.firstCall.args[0], ['all']);
    });

    it('removes listeners when unmounting', function() {
      wrapper.unmount();

      assert(userOffSpy.calledOnce);
      assert.equal(userOffSpy.firstCall.args[0], ['all']);

      assert(collOffSpy.calledOnce);
      assert.equal(collOffSpy.firstCall.args[0], ['all']);
    });

    it('does not pass through the models prop to the wrapped component', function() {
      assert.equal(stub.props().models, undefined);
    });
  });

  describe('when mounted with debounce set to true', function() {
    let forceUpdateSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(
        mapModelsToProps,
        { debounce: true }
      )(TestComponent);
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      if (wrapper.exists()) wrapper.unmount();
    });

    it('updates properties when model and collections change', function(done) {
      const newName = 'Banana';
      userModel.set('name', newName);

      setTimeout(() => {
        wrapper.update();
        assert.equal(wrapper.find('.name').text(), 'Banana');
        assert.equal(userModel.get('name'), newName);
        assert.equal(wrapper.find(TestComponent).prop('name'), newName);

        assert.equal(forceUpdateSpy.callCount, 1);

        done();
      }, 0);
    });

    it('does not throw when unmounted while debounce is running', function() {
      const newName = 'Banana';
      userModel.set('name', newName);

      wrapper.unmount();

      assert.equal(userModel.get('name'), newName);
      assert.equal(stub.props().name, 'Harry');

      assert.equal(forceUpdateSpy.callCount, 0);
    });
  });

  describe('when mounted with an undefined model', function() {
    afterEach(function() {
      wrapper.unmount();
    });

    it('the default should mount and unmount the component successfully', function() {
      const ConnectedTest = connectBackboneToReact()(TestComponent);
      const eventListenerSpy = sandbox.spy(ConnectedTest.prototype, 'createEventListener');
      wrapper = mount(<ConnectedTest models={{user: null}} />);
      assert.equal(eventListenerSpy.callCount, 0);
    });
  });

  describe('when mounted with custom event names', function() {
    let forceUpdateSpy;
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
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('sets one event handler on the userModel', function() {
      assert(userOnSpy.calledOnce);
      assert.equal(userOnSpy.firstCall.args[0], ['change:name']);
    });

    it('sets 0 event handlers on the userCollection', function() {
      assert.equal(collOnSpy.called, false);
    });

    it('updates properties when model\'s name changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      wrapper.update();

      assert.equal(userModel.get('name'), newName);
      assert.equal(wrapper.find(TestComponent).prop('name'), newName);
    });

    it('rerenders when tracked property changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      assert.equal(forceUpdateSpy.callCount, 1);
    });

    it('does not update properties when non tracked property changes', function() {
      const newAge = 99;
      userModel.set('age', newAge);

      assert.equal(userModel.get('age'), newAge);
      assert.equal(stub.props().age, 25);

      assert.equal(forceUpdateSpy.callCount, 0);
    });

    it('does not rerender when non tracked property changes', function() {
      const newAge = 99;
      userModel.set('age', newAge);
      assert.equal(forceUpdateSpy.callCount, 0);
    });
  });

  describe('when custom event options disable event tracking', function() {
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact( // eslint-disable-line no-unused-vars
        mapModelsToProps,
        {
          events: {
            user: [],
            coll: false,
          },
        }
      )(TestComponent);

      wrapper = mount(<ConnectedTest models={modelsMap} />);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('sets 0 event handlers on the userModel', function() {
      assert.equal(userOnSpy.called, false);
    });

    it('sets 0 event handlers on the userCollection', function() {
      assert.equal(collOnSpy.called, false);
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
    let forceUpdateSpy;
    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact()(TestComponent);
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('uses default mapModelsToProps function', function() {
      assert.equal(stub.props().user.name, 'Harry');
      assert.equal(stub.props().user.age, 25);
      assert.equal(stub.props().user.hungry, true);
    });

    it('creates default event listeners of "all" for every model', function() {
      assert(userOnSpy.calledOnce);
      assert.equal(userOnSpy.firstCall.args[0], ['all']);

      assert(collOnSpy.calledOnce);
      assert.equal(collOnSpy.firstCall.args[0], ['all']);
    });

    it('re-renders props when model changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      wrapper.update();

      assert.equal(wrapper.find(TestComponent).getElement().props.user.name, 'Banana');

      assert.equal(forceUpdateSpy.callCount, 4);
    });
  });

  describe('when given modelsMap and event options', function() {
    let forceUpdateSpy;
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
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
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
      assert(userOnSpy.calledOnce);
      assert.equal(userOnSpy.firstCall.args[0], ['change:name']);
    });

    it('sets 0 event handlers on the userCollection', function() {
      assert.equal(collOnSpy.called, false);
    });

    it('re-renders props when model changes', function() {
      const newName = 'Banana';
      userModel.set('name', newName);
      wrapper.update();

      assert.equal(wrapper.find(TestComponent).getElement().props.user.name, 'Banana');

      assert.equal(forceUpdateSpy.callCount, 1);
    });
  });

  describe('when modelTypes are defined on the options object', function() {
    describe('and the model given is not an instance of required modelType', function() {
      let forceUpdateSpy;
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
        forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

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
        assert.equal(forceUpdateSpy.callCount, 0);
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
        assert(errObj === undefined);
      });
    });
  });

  describe('when using props in mapModelsToProps', function() {
    function mapWithProps({ coll }, { name }) {
      if (!name) return {};
      const user = coll.findWhere({ name });
      return {
        name: user.get('name'),
        age: user.get('age'),
        hungry: user.get('hungry'),
      };
    }

    let a;
    let b;
    let forceUpdateSpy;
    beforeEach(function() {
      let ConnectedTest = connectBackboneToReact(mapWithProps)(TestComponent);
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');
      a = new UserModel({
        name: 'A',
        age: '10',
        hungry: false,
      });
      b = new UserModel({
        name: 'B',
        age: '20',
        hungry: false,
      });

      const models = {
        coll: new UserCollection([a, b]),
      };

      wrapper = mount(<ConnectedTest models={models} name={'A'} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('retrieves the correct model based on props', function() {
      assert.equal(stub.find('.name').text(), a.get('name'));
      assert.equal(stub.find('.age').text(), a.get('age'));

      // Using props should not increase the number of times forceUpdate is called.
      assert.equal(forceUpdateSpy.calledOnce, false);
    });

    it('update the models based on new props', function() {
      wrapper.setProps({ name: 'B'});
      b.set('hungry', true);

      assert.equal(stub.find('.name').text(), b.get('name'));
      assert.equal(stub.find('.age').text(), b.get('age'));
    });
  });

  describe('when passed props change', function() {
    let newName;
    let newAge;
    let newUserModel;

    beforeEach(function() {
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);

      wrapper = mount(React.createElement(ConnectedTest, { models: modelsMap }));
      stub = wrapper.find(TestComponent);

      newName = 'Robert';
      newAge = '30';

      newUserModel = new UserModel({
        name: newName,
        age: newAge,
        hungry: false,
      });
      const newModelsMap = {
        user: newUserModel,
        coll: userCollection,
      };

      wrapper.setProps({ models: newModelsMap });
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('renders the new props', function() {
      assert.equal(stub.find('.name').text(), newName);
      assert.equal(stub.find('.age').text(), newAge);
      assert.equal(stub.find('.hungry').text(), 'not hungry');
    });

    it('listen for updates', function() {
      newName = 'Bob';
      newUserModel.set('name', newName);

      assert.equal(stub.find('.name').text(), newName);
    });
  });

  describe('when passed props change to include', function() {
    let ConnectedTest;
    let createListenerSpy;
    let removeListenerSpy;

    beforeEach(function() {
      ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);
      wrapper = mount(<ConnectedTest models={modelsMap} />);

      createListenerSpy = sandbox.spy(ConnectedTest.prototype, 'createEventListener');
      removeListenerSpy = sandbox.spy(ConnectedTest.prototype, 'removeEventListener');

      const decoratorUserModel = new UserModel({
        name: 'Robert',
        age: '30',
        hungry: false,
      });

      const initialModelsMap = {
        user: userModel,
        coll: userCollection,
        decorator: decoratorUserModel,
      };

      wrapper.setProps({ models: initialModelsMap });
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('calls createEventListener once due to decoratorUserModel being added as a model', function() {
      assert.equal(createListenerSpy.callCount, 1);
      assert.equal(createListenerSpy.firstCall.args[0], 'decorator');
    });

    it('does not call removeEventListener', function() {
      assert.equal(removeListenerSpy.callCount, 0);
    });

    describe('an undefined model', function() {
      beforeEach(function() {
        const newModelsMap = {
          user: userModel,
          coll: userCollection,
          decorator: undefined,
        };

        wrapper.setProps({ models: newModelsMap });
      });

      it('does not call createEventListener again', function() {
        assert.equal(createListenerSpy.callCount, 1);
      });

      it('calls removeEventListener once for decoratorUserModel', function() {
        assert.equal(removeListenerSpy.callCount, 1);
        assert.equal(removeListenerSpy.firstCall.args[0], 'decorator');
      });
    });
  });

  describe('when unmounted in an event listener and subscribed to "all" event', function() {
    // To add more color, "all" event handlers are triggered after individual event handlers.
    // That is to say, if you trigger "foo" the sequence of event handlers called is:
    // "foo" -> all event handlers (which can include additional triggers) -> "all" -> event handlers.
    // When you .off('all') within an event handler Backbone reassigns the "all" array of handlers
    // such that when you get to triggering the "all" event handlers that array has not been updated.
    // This is the line that reassigns that array: https://github.com/jashkenas/backbone/blob/bd50e2e4a4af5c09bc490185aab215794d42258b/backbone.js#L296
    // So that when you get here https://github.com/jashkenas/backbone/blob/bd50e2e4a4af5c09bc490185aab215794d42258b/backbone.js#L357
    // the "allEvents" value is stale.

    const arbitraryEvent = 'arbitraryEvent';
    let forceUpdateSpy;

    beforeEach(function() {
      // eslint-disable-next-line no-unused-vars
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);
      forceUpdateSpy = sandbox.spy(ConnectedTest.prototype, 'forceUpdate');

      wrapper = mount(<ConnectedTest models={modelsMap} />);

      // Subscribe to an arbitrary event.
      userModel.on(arbitraryEvent, function() {
        // When called it unmounts an component.
        wrapper.unmount();

        // But because we're subscribed to the "all" event it will still trigger that handler,
        // calling forceUpdate when it shouldn't.
      });

      // Trigger the event.
      userModel.trigger(arbitraryEvent);
    });

    it('does not call forceUpdate', function() {
      assert.equal(forceUpdateSpy.called, false);
    });
  });

  describe('when NOT configured to provide ref to the wrapped component', function() {
    beforeEach(function() {
      // eslint-disable-next-line no-unused-vars
      const ConnectedTest = connectBackboneToReact(mapModelsToProps)(TestComponent);

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('should throw an error when getWrappedInstance() is called', function() {
      assert.throws(function() {
        wrapper.instance().getWrappedInstance();
      });
    });
  });

  describe('when configured to provide ref to the wrapped component', function() {
    beforeEach(function() {
      // eslint-disable-next-line no-unused-vars
      const ConnectedTest = connectBackboneToReact(
        mapModelsToProps,
        { withRef: true }
      )(TestComponent);

      wrapper = mount(<ConnectedTest models={modelsMap} />);
      stub = wrapper.find(TestComponent);
    });

    afterEach(function() {
      wrapper.unmount();
    });

    it('should return the wrapped component via getWrappedInstance()', function() {
      assert.equal(wrapper.instance().getWrappedInstance(), stub.instance());
    });

    describe('and the returned wrapped component', function() {
      let randomName;

      beforeEach(function() {
        randomName = Math.random().toString();
      });

      it('should be able to update the actual component', function() {
        wrapper.instance().getWrappedInstance().props.changeName(randomName);
        assert.equal(stub.instance().props.name, randomName);
      });

      it('should reflect the changes made to the actual component', function() {
        stub.instance().props.changeName(randomName);
        assert.equal(wrapper.instance().getWrappedInstance().props.name, randomName);
      });

      it('should reflect the changes made to the data model', function() {
        userModel.set('name', randomName);
        assert.equal(wrapper.instance().getWrappedInstance().props.name, randomName);
      });
    });
  });
});
