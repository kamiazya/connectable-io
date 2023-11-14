export interface Message<T = any> {
  id: string
  data: T
}

// export interface PubSubQueue<T = any> {
//   push(message: T): Promise<string>
//   pull(): Promise<Message<T> | null>
//   ack(id: string): Promise<void>
// }
