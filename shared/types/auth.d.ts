declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
  }

  interface SecureSessionData {
    sid: string
  }
}

export {}
