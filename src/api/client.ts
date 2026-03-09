import { ApiError } from './core/ApiError'
import { useGlobalErrors } from '@/stores/errors'

const { addError, forbidden } = useGlobalErrors()

export async function requestWrapper<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.log("ERROR")
    console.log(error)
    if (error instanceof ApiError && error.status === 401) {
      console.log("FORBIDDEN!")
      forbidden.value = true
    } else if (error instanceof ApiError) {
      addError(error.body?.detail ?? error.message)
    } else if (error instanceof Error) {
      addError(error.message)
    }
    throw error
  }
}
