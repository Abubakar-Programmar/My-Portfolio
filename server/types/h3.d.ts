import type { AdminContext } from '../utils/auth'

declare module 'h3' {
  interface H3EventContext {
    admin?: AdminContext
  }
}

export {}
