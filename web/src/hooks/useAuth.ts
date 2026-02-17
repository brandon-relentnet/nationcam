import { useLogto } from '@logto/react'
import { useCallback } from 'react'

const API_RESOURCE =
  import.meta.env['VITE_LOGTO_API_RESOURCE'] ?? 'https://api.nationcam.com'

/**
 * Thin wrapper around @logto/react that exposes auth state and helpers.
 */
export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    getAccessToken,
    fetchUserInfo,
  } = useLogto()

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
    login,
    logout,
    getToken,
    fetchUserInfo,
  }
}
