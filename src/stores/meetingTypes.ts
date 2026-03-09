import { reactive, toRefs } from 'vue'
import { MeetingTypesService } from '@/api'
import { requestWrapper } from '@/api/client'
import type { MeetingTypeResponse } from '@/api'

const state = reactive({
  meetingTypes: [] as MeetingTypeResponse[],
})

export function useMeetingTypesStore() {
  async function loadMeetingTypes() {
    state.meetingTypes = await requestWrapper(
      MeetingTypesService.getMeetingTypes(),
    )
  }

  return {
    ...toRefs(state),
    loadMeetingTypes,
  }
}
