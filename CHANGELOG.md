# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.1.0"></a>
# [3.1.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v3.0.0...v3.1.0) (2022-07-05)


### Features

* Support React 17 and 18 as peerDependencies ([eee15fb](https://github.com/mongodb-js/connect-backbone-to-react/commit/eee15fb))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v2.0.0...v3.0.0) (2020-01-30)

* Now requires at least React v16.6.0
* Removed usage of legacy Context API
* Moved to new React Context API
* Functionality should be equivalent, but with all things be sure to test your application.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.6.1...v2.0.0) (2020-01-15)

* Now requires at least React v16.3.0.

<a name="1.6.1"></a>
## [1.6.1](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.6.0...v1.6.1) (2018-10-26)


### Bug Fixes

* adds check for null model to componentWillReceiveProps ([#21](https://github.com/mongodb-js/connect-backbone-to-react/issues/21)) ([9793020](https://github.com/mongodb-js/connect-backbone-to-react/commit/9793020))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.5.0...v1.6.0) (2018-06-07)


### Features

* Add access to wrapped component's ref ([#20](https://github.com/mongodb-js/connect-backbone-to-react/issues/20)) ([b33b567](https://github.com/mongodb-js/connect-backbone-to-react/commit/b33b567))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.4.0...v1.5.0) (2017-12-11)


### Bug Fixes

* Add missing `assert` to test ([127d808](https://github.com/mongodb-js/connect-backbone-to-react/commit/127d808))


### Features

* Add watch mode for local development ([4e7fe43](https://github.com/mongodb-js/connect-backbone-to-react/commit/4e7fe43))
* Merge models passed from context and props ([#15](https://github.com/mongodb-js/connect-backbone-to-react/issues/15)) ([cf2b9e8](https://github.com/mongodb-js/connect-backbone-to-react/commit/cf2b9e8)), closes [#14](https://github.com/mongodb-js/connect-backbone-to-react/issues/14)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.3.0...v1.4.0) (2017-09-20)


### Features

* Add props as second arg to mapModelsToProps ([d971b884e](https://github.com/mongodb-js/connect-backbone-to-react/commit/d971b884e))




<a name="1.3.2"></a>
## [1.3.2](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.3.1...v1.3.2) (2017-09-18)


### Bug Fixes

* Handle error when passed an undefined model ([e5f09c9](https://github.com/mongodb-js/connect-backbone-to-react/commit/e5f09c9))
* Handle null models in default mapping ([ab0a0e2](https://github.com/mongodb-js/connect-backbone-to-react/commit/ab0a0e2))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.3.0...v1.3.1) (2017-09-15)


### Bug Fixes

* Add models existence check on props update ([469073c](https://github.com/mongodb-js/connect-backbone-to-react/commit/469073c))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.2.0...v1.3.0) (2017-09-13)


### Features

* Fix bug where models were not listened to when they were set as properties, after initial construction. ([7187bc7](https://github.com/mongodb-js/connect-backbone-to-react/commit/7187bc7))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.1.0...v1.2.0) (2017-06-21)


### Features

* Update state when props passed to connected components change ([3e2f59f](https://github.com/mongodb-js/connect-backbone-to-react/commit/3e2f59f))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.0.1...v1.1.0) (2017-04-28)


### Features

* Support React 15.5+ ([bbea532](https://github.com/mongodb-js/connect-backbone-to-react/commit/bbea532))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/mongodb-js/connect-backbone-to-react/compare/v1.0.0...v1.0.1) (2017-03-17)


### Bug Fixes

* Don't call createNewProps if component has been unmounted. ([1a83663](https://github.com/mongodb-js/connect-backbone-to-react/commit/1a83663))
* Rename Connect to ConnectBackboneToReact ([f2899c6](https://github.com/mongodb-js/connect-backbone-to-react/commit/f2899c6)), closes [#4](https://github.com/mongodb-js/connect-backbone-to-react/issues/4)
* Spy on setState for most test assertions. ([f3253d2](https://github.com/mongodb-js/connect-backbone-to-react/commit/f3253d2))



<a name="1.0.0"></a>
# 1.0.0 (2017-03-01)


### Bug Fixes

* Actually add packages we depend on to our dependencies list. ([3783799](https://github.com/mongodb-js/connect-backbone-to-react/commit/3783799))
* PR feedback from Justin ([f5764d0](https://github.com/mongodb-js/connect-backbone-to-react/commit/f5764d0))


### Features

* Add modelTypes as an option you can set. ([0ce0b46](https://github.com/mongodb-js/connect-backbone-to-react/commit/0ce0b46))
* Add standard-version for automating changelog creation. ([214ae1f](https://github.com/mongodb-js/connect-backbone-to-react/commit/214ae1f))
* Create BackboneProvider ([52c41c0](https://github.com/mongodb-js/connect-backbone-to-react/commit/52c41c0))
* Initial import of all functionality! ([0b16681](https://github.com/mongodb-js/connect-backbone-to-react/commit/0b16681))
* Move react to peerDep ([0d62b8b](https://github.com/mongodb-js/connect-backbone-to-react/commit/0d62b8b))
* Update API for connectBackboneToReact to require passing modelsMap through as a prop. ([2a23d8d](https://github.com/mongodb-js/connect-backbone-to-react/commit/2a23d8d))
