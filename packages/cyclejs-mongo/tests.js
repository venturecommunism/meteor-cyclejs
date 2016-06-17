import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tinytest } from 'meteor/tinytest'
import Rx from 'rx'

import { makeMongoDriver, createCollection, _collection } from 'meteor/kriegslustig:cyclejs-mongo'

const testColl = createCollection('test')

if (Meteor.isServer) {
  testColl.collection.allow({ update: () => true, insert: () => true, remove: () => true })
}

Tinytest.add('cyclejs-mongo - createCollection', (test) => {
  test.isTrue(Mongo.Collection.prototype.isPrototypeOf(testColl.collection))
  test.isTrue(_collection.isPrototypeOf(testColl))
})

Tinytest.addAsync('cyclejs-mongo – makeMongoDriver – With long keys', (test, done) => {
  const driver = makeMongoDriver(testColl)
  const action = [{
    collection: 'test',
    action: 'insert',
    arguments: { test: 1 }
  }]
  driver(Rx.Observable.from(action))
  testColl.findOne({ test: 1 })
    .subscribe((v) => {
      if (!v) return
      test.equal(v.test, action[0].arguments.test)
      done()
    })
})

Tinytest.addAsync('cyclejs-mongo – makeMongoDriver – With short keys', (test, done) => {
  const driver = makeMongoDriver(testColl)
  const action = [{
    c: 'test',
    a: 'insert',
    s: [{ test: 2 }]
  }]
  driver(Rx.Observable.from(action))
  testColl.findOne({ test: 2 })
    .subscribe((v) => {
      if (!v) return
      test.equal(v.test, action[0].s[0].test)
      done()
    })
})

Tinytest.addAsync('cyclejs-mongo – makeMongoDriver – With an array', (test, done) => {
  const driver = makeMongoDriver(testColl)
  const action = [['test', 'insert', { test: 3 }]]
  driver(Rx.Observable.from(action))
  testColl.findOne({ test: 3 })
    .subscribe((v) => {
      console.log(v)
      if (!v) return
      test.equal(v.test, action[0][2].test)
      done()
    })
})

