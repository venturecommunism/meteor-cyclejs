import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Tracker } from 'meteor/tracker'

import Rx from 'rx'

/**
 * @param {...Collection} collectionsArr Collections that should be manipulatable.
 * @return {Cycle.Driver} A Cycle driver that can be passed to Cycle.run.
 */
export const makeMongoDriver = (...collectionsArr) => {
  const collections = collectionsArr.reduce((m, c) => {
    if (!_collection.isPrototypeOf(c)) throw Meteor.Error('Use the cyclejs-mongo createCollection function to create collections')
    m[c.collection._name] = c.collection
    return m
  }, {})
  return (mongoRequests$) => {
    mongoRequests$.subscribe((req) => {
      const ck = req.collection || req.c || req[0]
      const c = collections[ck]
      if (!c) throw new Meteor.Error(`Undefined collection ${ck}`)
      const ak = req.action || req.a || req[1]
      if (!c[ak]) throw new Meteor.Error(`No such action ${ak}`)
      const args = req.arguments || req.s || req.slice(2)
      Array.prototype.isPrototypeOf(args)
        ? c[ak](...args)
        : c[ak](args)
    })
  }
}

/**
 * @param {string} name The name of the collection.
 * @return {CycleMongo.Collection} The collection Rx container
 */
export const createCollection = (name) => {
  const c = Object.create(_collection)
  c.collection = typeof name === 'string'
    ? new Mongo.Collection(name)
    : name
  return c
}

/**
 * A Rx container for a Mongo collection
 * @typedef {collection: Mongo.Collection} CycleMongo.Collection
 */
export const _collection = {
  find (...args) {
    if (Meteor.isClient) {
      return observableFromReactiveFn(() =>
        this.collection.find(...args).fetch()
      )
    } else {
      return Rx.Observable.from([this.collection.find(...args).fetch()])
    }
  },

  findOne (...args) {
    if (Meteor.isClient) {
      return observableFromReactiveFn(() => this.collection.findOne(...args))
    } else {
      return Rx.Observable.from([this.collection.findOne(...args)])
    }
  }
}

const observableFromReactiveFn = (fn, ...args) =>
  Rx.Observable.create((observer) => {
    Tracker.autorun(() => {
      observer.onNext(fn(...args))
    })
    return () => {}
  })

