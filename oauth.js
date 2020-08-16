import axios from 'axios'
import { randomString, pkce } from './utils'

export const CLIENT_ID = process.env.CLIENT_ID || '6Yz1g0FzU2HyPPBuzs35kPb62EKWTs1Ld8Ax'
export const baseURL = process.env.VUE_APP_API_ENDPOINT || 'https://q.trap.jp/api/v3'
axios.defaults.baseURL = baseURL
axios.defaults.withCredentials = false

export function setAuthToken (token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export async function redirectAuthorizationEndpoint () {
  const state = randomString(10)
  const codeVerifier = randomString(43)
  const codeChallenge = await pkce(codeVerifier)

  console.log(baseURL, CLIENT_ID)

  sessionStorage.setItem(`login-code-verifier-${state}`, codeVerifier)

  const authorizationEndpointUrl = new URL(`${baseURL}/oauth2/authorize`)
  authorizationEndpointUrl.search = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state
  })
  window.location.assign(authorizationEndpointUrl)
}

export function fetchAuthToken (code, verifier) {
  return axios.post(`/oauth2/token`, new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code_verifier: verifier,
    code
  }))
}

export function revokeAuthToken (token) {
  return axios.post(`/oauth2/revoke`, new URLSearchParams({ token }))
}
