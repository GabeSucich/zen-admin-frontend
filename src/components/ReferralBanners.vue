<template>
  <div v-if="referredBy || referrerRewards" class="referral-banners">
    <Message v-if="referredBy" severity="info" icon="pi pi-gift" :closable="false">
      <div class="banner-body">
        <span>
          <strong>Referred by {{ referredBy.referrer_name }}.</strong>
          {{ referredByDetail }}
        </span>
        <router-link :to="{ path: '/referrals', query: { referrer: referredBy.referrer_id } }" class="banner-link">
          View referral
        </router-link>
      </div>
    </Message>

    <Message v-if="referrerRewards" severity="warn" icon="pi pi-gift" :closable="false">
      <div class="banner-body">
        <span>
          <strong>{{ referrerRewards.referrer_name }}</strong> is owed
          {{ referrerRewards.rewards_owed }} referral
          {{ referrerRewards.rewards_owed === 1 ? 'reward' : 'rewards' }}.
        </span>
        <router-link
          :to="{ path: '/referrals', query: { referrer: referrerRewards.referrer_id, owed: '1' } }"
          class="banner-link"
        >
          Review rewards
        </router-link>
      </div>
    </Message>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Message from 'primevue/message'
import { ReferralStatus } from '@/api'
import type { CalendarEventClientSuggestionResponse } from '@/api'

const props = defineProps<{
  suggestion: CalendarEventClientSuggestionResponse
}>()

const referredBy = computed(() => props.suggestion.referred_by ?? null)
const referrerRewards = computed(() => props.suggestion.referrer_rewards ?? null)

const referredByDetail = computed(() => {
  const r = referredBy.value
  if (!r) return ''
  if (r.status === ReferralStatus.CANCELED) return 'This referral booking was canceled.'
  if (!r.qualifies) return "This booking doesn't qualify for a referral reward."
  if (r.reward_issued_at) return `Referral reward issued ${new Date(r.reward_issued_at).toLocaleDateString()}.`
  return 'First appointment — qualifies for a referral reward.'
})
</script>

<style scoped>
.referral-banners {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.referral-banners :deep(.p-message) {
  margin: 0;
}

.referral-banners :deep(.p-message-text) {
  flex: 1;
}

.banner-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.banner-link {
  flex-shrink: 0;
  font-weight: 600;
  color: inherit;
  text-decoration: underline;
}
</style>
