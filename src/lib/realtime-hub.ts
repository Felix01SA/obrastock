import { EventEmitter } from 'events'

export interface RealtimeEvent {
  type: 'stock_update' | 'movement_created' | 'site_updated' | 'item_updated' | 'ping'
  obraSlug: string
  timestamp: string
  payload?: any
}

class RealtimeHub {
  private static instance: RealtimeHub
  private emitter: EventEmitter

  private constructor() {
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(200)
  }

  public static getInstance(): RealtimeHub {
    if (!RealtimeHub.instance) {
      RealtimeHub.instance = new RealtimeHub()
    }
    return RealtimeHub.instance
  }

  public broadcast(obraSlug: string, event: Omit<RealtimeEvent, 'timestamp' | 'obraSlug'>) {
    const fullEvent: RealtimeEvent = {
      ...event,
      obraSlug,
      timestamp: new Date().toISOString(),
    }
    this.emitter.emit(`obra:${obraSlug}`, fullEvent)
    this.emitter.emit('global', fullEvent)
  }

  public subscribe(obraSlug: string, listener: (event: RealtimeEvent) => void): () => void {
    const eventName = `obra:${obraSlug}`
    this.emitter.on(eventName, listener)
    return () => {
      this.emitter.off(eventName, listener)
    }
  }

  public subscribeGlobal(listener: (event: RealtimeEvent) => void): () => void {
    this.emitter.on('global', listener)
    return () => {
      this.emitter.off('global', listener)
    }
  }
}

export const realtimeHub = RealtimeHub.getInstance()
