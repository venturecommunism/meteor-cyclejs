/* global Package */
/* global Npm */

Package.describe({
  name: 'kriegslustig:cyclejs-mongo',
  version: '0.1.0',
  summary: 'A Cycle.js driver for the Mongo interface',
  git: 'https://github.com/kriegslustig/meteor-cyclejs-mongo',
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.3.2.4')
  api.use(['ecmascript', 'mongo', 'tracker', 'meteor'])
  api.mainModule('main.js')
  Npm.depends({ rx: '4.1.0' })
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use(['tinytest', 'mongo'])
  api.use('kriegslustig:cyclejs-mongo')
  Npm.depends({ rx: '4.1.0' })
  api.mainModule('tests.js')
})
