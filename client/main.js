import { Meteor } from 'meteor/meteor'
import { makeMongoDriver } from 'meteor/kriegslustig:cyclejs-mongo'
import { taskspending } from '/imports/collections'

import { run } from '@cycle/core'
import { makeDOMDriver, button, p, h } from '@cycle/dom'

const intent = (DOM) =>
  ({
    more$: DOM.select('button').events('click')
  })

const model = (actions) =>
  [
    taskspending.find()
      .map((res) => res.length),
    actions.more$
      .map((n) => ['taskspending', 'insert', { value: 'click' }])
  ]

const view = (taskspending$) =>
  taskspending$.map((n) =>
    h('main', [
      p(`You have clicked the button ${n} times`),
      button('Click Me!')
    ])
  )

const main = (sources) => {
  const [taskspending$, mongoRequests$] = model(intent(sources.DOM))
  return { DOM: view(taskspending$), mongo: mongoRequests$ }
}

Meteor.startup(() => {
  const drivers = {
    DOM: makeDOMDriver('#app'),
    mongo: makeMongoDriver(taskspending)
  }
  run(main, drivers)
})

