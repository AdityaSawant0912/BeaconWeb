"use client"
import { useSession } from "next-auth/react"

export default function SessionData() {
  const { data: session, status } = useSession()

  if (status === "authenticated") {
    return <p>Signed in as {session.user.name}</p>
  }

  return <a href="/api/auth/signin">Sign in</a>
}