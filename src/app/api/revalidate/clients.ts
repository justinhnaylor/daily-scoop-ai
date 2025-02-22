import { ReadableStreamController } from "stream/web"

export const clients = new Set<ReadableStreamController<Uint8Array>>()
export const getLastCheckTime = () => lastCheckTime
export const setLastCheckTime = (time: Date) => {
  lastCheckTime = time
}

let lastCheckTime = new Date()
