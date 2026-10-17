import { afterEach, expect, it } from 'vitest'
import { useClientSession } from './session'

const storageKey = 'selava-client-session'
const session = {
  token: 'jwt-cliente',
  customer: { id: 17, email: 'ana@example.com' },
}

afterEach(() => {
  useClientSession.getState().clearSession()
  sessionStorage.clear()
})

it('guarda únicamente el token y la identidad mínima en sessionStorage', () => {
  useClientSession.getState().setSession(session)

  const serialized = sessionStorage.getItem(storageKey)
  expect(serialized).not.toBeNull()
  expect(JSON.parse(serialized!)).toMatchObject({ state: { session } })
  expect(serialized).not.toContain('password')
})

it('restaura la sesión al recargar la aplicación y elimina sus datos al salir', async () => {
  useClientSession.getState().setSession(session)
  const serialized = sessionStorage.getItem(storageKey)!

  useClientSession.setState({ session: null })
  sessionStorage.setItem(storageKey, serialized)
  await useClientSession.persist.rehydrate()

  expect(useClientSession.getState().session).toEqual(session)

  useClientSession.getState().clearSession()
  expect(useClientSession.getState().session).toBeNull()
  expect(sessionStorage.getItem(storageKey)).not.toContain('jwt-cliente')
})
