import { Meteor } from 'meteor/meteor'
import { makeMongoDriver } from 'meteor/kriegslustig:cyclejs-mongo'
import { State } from '/imports/collections'

import { run } from '@cycle/core'
import { makeDOMDriver, button, p, h } from '@cycle/dom'

const intent = (DOM) =>
  ({
    more$: DOM.select('button').events('click')
  })

const model = (actions) =>
  [
    State.find()
      .map((res) => res.length),
    actions.more$
      .map((n) => ['state', 'insert', { value: 'click' }])
  ]

const view = (state$) =>
  state$.map((n) =>
    h('main', [
      p(`You have clicked the button ${n} times`),
      button('Click Me!')
    ])
  )

const main = (sources) => {
  const [state$, mongoRequests$] = model(intent(sources.DOM))
  return { DOM: view(state$), mongo: mongoRequests$ }
}

Meteor.startup(() => {
  const drivers = {
    DOM: makeDOMDriver('#app'),
    mongo: makeMongoDriver(State)
  }
  run(main, drivers)
})

