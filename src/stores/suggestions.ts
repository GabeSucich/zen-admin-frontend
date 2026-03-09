import { reactive, toRefs } from 'vue'
import { CalendarSuggestionsService } from '@/api'
import { requestWrapper } from '@/api/client'
import type { CalendarEventClientSuggestionResponse } from '@/api'

const state = reactive({
  suggestions: [] as CalendarEventClientSuggestionResponse[],
})

export function useSuggestionsStore() {
  async function loadSuggestions() {
    state.suggestions = await requestWrapper(
      CalendarSuggestionsService.getUnconfirmedSuggestions(),
    )
  }

  return {
    ...toRefs(state),
    loadSuggestions,
  }
}
