import { useLogto } from '@logto/react'
import { useCallback, useEffect, useState } from 'react'
import type { IdTokenClaims } from '@logto/react'

const API_RESOURCE =
  import.meta.env['VITE_LOGTO_API_RESOURCE'] ?? 'https://api.nationcam.com'

interface UserInfo {
  sub: string
  name: string | null
  picture: string | null
  email: string | null
  username: string | null
}

function claimsToUserInfo(claims: IdTokenClaims): UserInfo {
  return {
    sub: claims.sub,
    name: claims.name ?? null,
    picture: claims.picture ?? null,
    email: claims.email ?? null,
    username: claims.username ?? null,
  }
}

/**
 * Thin wrapper around @logto/react that exposes auth state, user info, and helpers.
 */
export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    getAccessToken,
    getIdTokenClaims,
  } = useLogto()

  const [user, setUser] = useState<UserInfo | null>(null)

  // When auth state settles, pull user info from the cached ID token claims.
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      setUser(null)
      return
    }
    let cancelled = false
    getIdTokenClaims().then((claims) => {
      if (cancelled || !claims) return
      setUser(claimsToUserInfo(claims))
    })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isLoading, getIdTokenClaims])

  const login = useCallback(() => {
    signIn(`${window.location.origin}/callback`)
  }, [signIn])

  const logout = useCallback(() => {
    signOut(window.location.origin)
  }, [signOut])

  /** Get an access token scoped to our API resource. */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      return (await getAccessToken(API_RESOURCE)) ?? null
    } catch {
      return null
    }
  }, [getAccessToken])

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getToken,
  }
}
