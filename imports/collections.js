import { createCollection } from 'meteor/kriegslustig:cyclejs-mongo'

export const taskspending = createCollection('taskspending')
export const tasksbacklog = createCollection('tasksbacklog')
export const Timer = createCollection('timer')
export const tmpmutation = createCollection('tmpmutation')


