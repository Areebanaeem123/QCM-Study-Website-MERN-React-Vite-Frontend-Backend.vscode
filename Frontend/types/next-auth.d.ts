import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      rank: number
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    rank: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    rank: number
  }
}





