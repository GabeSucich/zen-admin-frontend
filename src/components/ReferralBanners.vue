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
            v-if="canApplyDiscount"
            label="Mark discount applied"
            icon="pi pi-tag"
            size="small"
            :loading="saving"
            @click="applyRefereeDiscount"
          />
          <router-link
            :to="{ path: '/referrals', query: { tab: 'referees', referrer: referredBy.referrer_id } }"
            class="banner-link"
          >
            View referee
          </router-link>
        </div>
      </div>
    </Message>

    <Message v-if="referrerRewards" severity="warn" icon="pi pi-gift" :closable="false">
      <div class="banner-body">
        <span>
          <strong>{{ referrerRewards.referrer_name }}</strong> has
          {{ referrerRewards.active_referrer_discounts }} active referral
          {{ referrerRewards.active_referrer_discounts === 1 ? 'discount' : 'discounts' }}: 20% off their next
          purchase{{ referrerRewards.active_referrer_discounts === 1 ? '' : ' for each' }}.
        </span>
        <router-link
          :to="{ path: '/referrals', query: { tab: 'referrers', referrer: referrerRewards.referrer_id } }"
          class="banner-link"
        >
          Review discounts
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
const referrerRewards = computed(() => props.suggestion.referrer_discounts ?? null)
const saving = ref(false)

const canApplyDiscount = computed(() => {
  const r = referredBy.value
  return !!r && r.qualifies && !r.referee_discount_applied_at && r.status !== ReferralStatus.CANCELED
})

const referredByDetail = computed(() => {
  const r = referredBy.value
  if (!r) return ''
  const referrerFirstName = r.referrer_name.split(' ')[0]
  if (r.status === ReferralStatus.CANCELED && !r.referee_discount_applied_at) return 'This referral booking was canceled.'
  if (!r.qualifies) return 'Not eligible for referral discounts.'
  if (r.referrer_discount_applied_at) {
    return `Their 20% discount was applied, and ${referrerFirstName}'s referral discount was applied ${new Date(r.referrer_discount_applied_at).toLocaleDateString()}.`
  }
  if (r.referee_discount_applied_at) return `Their 20% discount was applied; ${referrerFirstName} now has an active referral discount.`
  return `New patient: gets 20% off their first purchase. Once it's applied, ${referrerFirstName} earns 20% off their next purchase.`
})

async function applyRefereeDiscount() {
  const r = referredBy.value
  if (!r) return
  saving.value = true
  try {
    await requestWrapper(ReferralsService.updateReferral(r.referral_id, { referee_discount_applied: true }))
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
