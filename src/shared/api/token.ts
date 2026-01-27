let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

const REFRESH_KEY = 'rt'

export const setRefreshToken = (token: string | null) => {
  document.cookie = `${REFRESH_KEY}=${token ? encodeURIComponent(token) : ''}; Path=/; SameSite=Lax`
}

export const getRefreshToken = () => {
  const found = document.cookie.split('; ').find(v => v.startsWith(`${REFRESH_KEY}=`))
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null
}

export const clearRefreshToken = () => {
  document.cookie = `${REFRESH_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}
