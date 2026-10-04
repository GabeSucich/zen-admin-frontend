import { reactive, computed, toRefs } from 'vue'
import { ReferralsService } from '@/api'
import { requestWrapper } from '@/api/client'
import type { ReferralResponse, ReferrerResponse } from '@/api'

const state = reactive({
  referrers: [] as ReferrerResponse[],
  referrals: [] as ReferralResponse[],
  loading: false,
})

export function useReferralStore() {
  async function loadReferrals() {
    state.loading = true
    try {
      const [referrers, referrals] = await Promise.all([
        requestWrapper(ReferralsService.getReferrers()),
        requestWrapper(ReferralsService.getReferrals()),
      ])
      state.referrers = referrers
      state.referrals = referrals
    } finally {
      state.loading = false
    }
  }

  const rewardsOwedCount = computed(() =>
    state.referrers.reduce((sum, r) => sum + r.rewards_owed, 0),
  )

  return {
    ...toRefs(state),
    loadReferrals,
    rewardsOwedCount,
  }
}
