import { reactive, toRefs } from 'vue'

const state = reactive({
  errors: [] as string[],
  forbidden: false,
})

export function useGlobalErrors() {
  function addError(message: string) {
    state.errors.push(message)
  }

  function dismiss(index: number) {
    state.errors.splice(index, 1)
  }

  function dismissAll() {
    state.errors.splice(0)
  }

  return {
    ...toRefs(state),
    addError,
    dismiss,
    dismissAll,
  }
}
