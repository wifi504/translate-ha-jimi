// import type { WorkerThread } from '@/utils/worker/thread-util.ts'
// import { Queue } from '@/utils/queue.ts'
//
// interface Work {
//   id: number
//   workerThread: WorkerThread
// }
//
// export class WorkerPool {
//   private workerKey: number = 0
//   private workerSize: number
//   private waitingQueue: Queue<Work> = new Queue()
//   private workingQueue: Queue<Work> = new Queue()
//
//   constructor(workerSize: number = 2) {
//     this.workerSize = workerSize
//   }
//
//   /**
//    * 向线程池提交任务
//    *
//    * @param workerThread 工作线程
//    */
//   async submit(workerThread: WorkerThread) {
//     // 工作队列空闲，直接工作
//     if (this.workingQueue.size() < this.workerSize) {
//       this.workingQueue.enqueue({ id: this.workerKey++, workerThread })
//     }
//     // 工作队列阻塞，进入等待队列
//   }
// }
