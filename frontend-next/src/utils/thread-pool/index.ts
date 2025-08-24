import type { Status, Task } from './thread'
import type { EventProcessor } from './worker'
import Thread from './thread'
import ThreadPool from './thread-pool'
import { defineWorker, postToMain, receiveEvent, requestTerminate } from './worker'

export type { EventProcessor, Status, Task }
export { defineWorker, postToMain, receiveEvent, requestTerminate, Thread }
export default ThreadPool
