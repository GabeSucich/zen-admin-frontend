<template>
  <div v-if="referredBy || referrerRewards" class="referral-banners">
    <Message v-if="referredBy" severity="info" icon="pi pi-gift" :closable="false">
      <div class="banner-body">
        <span>
          <strong>Referred by {{ referredBy.referrer_name }}.</strong>
          {{ referredByDetail }}
        </span>
        <div class="banner-actions">
          <Button
            v-if="canMarkPurchase"
            label="Mark purchase made"
            icon="pi pi-shopping-bag"
            size="small"
            :loading="saving"
            @click="markPurchased"
          />
          <router-link :to="{ path: '/referrals', query: { referrer: referredBy.referrer_id } }" class="banner-link">
            View referral
          </router-link>
        </div>
      </div>
    </Message>

    <Message v-if="referrerRewards" severity="warn" icon="pi pi-gift" :closable="false">
      <div class="banner-body">
        <span>
          <strong>{{ referrerRewards.referrer_name }}</strong> is owed
          {{ referrerRewards.rewards_owed }} referral
          {{ referrerRewards.rewards_owed === 1 ? 'reward' : 'rewards' }}: 20% off their next
          purchase{{ referrerRewards.rewards_owed === 1 ? '' : ' for each' }}.
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
import { ref, computed } from 'vue'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { ReferralsService, ReferralStatus } from '@/api'
import type { CalendarEventClientSuggestionResponse } from '@/api'
import { requestWrapper } from '@/api/client'

const props = defineProps<{
  suggestion: CalendarEventClientSuggestionResponse
}>()

const emit = defineEmits<{ updated: [] }>()

const referredBy = computed(() => props.suggestion.referred_by ?? null)
const referrerRewards = computed(() => props.suggestion.referrer_rewards ?? null)
const saving = ref(false)

const canMarkPurchase = computed(() => {
  const r = referredBy.value
  return !!r && r.qualifies && !r.purchased_at && r.status !== ReferralStatus.CANCELED
})

const referredByDetail = computed(() => {
  const r = referredBy.value
  if (!r) return ''
  const referrerFirstName = r.referrer_name.split(' ')[0]
  if (r.status === ReferralStatus.CANCELED && !r.purchased_at) return 'This referral booking was canceled.'
  if (!r.qualifies) return "Gets 20% off their first purchase. Not eligible for a referrer reward."
  if (r.reward_issued_at) {
    return `Purchase recorded; ${referrerFirstName}'s reward was issued ${new Date(r.reward_issued_at).toLocaleDateString()}.`
  }
  if (r.purchased_at) return `Purchase recorded; ${referrerFirstName}'s referral reward is now owed.`
  return `New patient: gets 20% off their first purchase. Once they make a purchase, ${referrerFirstName} earns a reward.`
})

async function markPurchased() {
  const r = referredBy.value
  if (!r) return
  saving.value = true
  try {
    await requestWrapper(ReferralsService.updateReferral(r.referral_id, { purchased: true }))
    emit('updated')
  } finally {
    saving.value = false
  }
}
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

.banner-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.banner-link {
  flex-shrink: 0;
  font-weight: 600;
  color: inherit;
  text-decoration: underline;
}
</style>
