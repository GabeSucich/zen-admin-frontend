<template>
  <div class="referrals-page">
    <div class="page-header">
      <h2>Referrals</h2>
      <div class="summary">
        <span class="summary-item"><strong>{{ referrers.length }}</strong> referrers</span>
        <span class="summary-item"><strong>{{ referrals.length }}</strong> referees</span>
        <span class="summary-item" :class="{ active: activeRefereeDiscounts }">
          <strong>{{ activeRefereeDiscounts }}</strong> active referee discounts
        </span>
        <span class="summary-item" :class="{ active: activeReferrerDiscountCount }">
          <strong>{{ activeReferrerDiscountCount }}</strong> active referrer discounts
        </span>
      </div>
    </div>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="referrers">Referrers</Tab>
        <Tab value="referees">Referees</Tab>
      </TabList>
      <TabPanels>
        <!-- Referrers: one row per referrer, subrows for each discount they've earned -->
        <TabPanel value="referrers">
          <div class="filters">
            <InputText v-model="referrerSearch" placeholder="Search by name or email..." class="referrer-search" />
            <label class="active-toggle">
              <Checkbox v-model="referrersActiveOnly" binary />
              Active discounts only
            </label>
          </div>

          <div v-if="loading && !referrers.length" class="loading">
            <i class="pi pi-spin pi-spinner" /> Loading referrers...
          </div>
          <DataTable v-else v-model:expandedRows="expandedReferrers" :value="filteredReferrers" stripedRows size="small" dataKey="id">
            <template #empty>
              {{ referrersActiveOnly ? 'No referrers have active discounts.' : 'No referrers yet.' }}
            </template>
            <Column expander style="width: 3rem" />
            <Column header="Referrer">
              <template #body="{ data }">
                <div>{{ data.first_name }} {{ data.last_name }}</div>
                <div class="sub">{{ data.email }}</div>
              </template>
            </Column>
            <Column header="Code">
              <template #body="{ data }"><code>{{ data.code }}</code></template>
            </Column>
            <Column header="Signed up">
              <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
            </Column>
            <Column field="total_bookings" header="Referees" />
            <Column header="Active discounts">
              <template #body="{ data }">
                <Tag v-if="data.active_referrer_discounts" :value="String(data.active_referrer_discounts)" severity="warn" />
                <span v-else class="sub">0</span>
              </template>
            </Column>
            <Column field="referrer_discounts_applied" header="Discounts applied" />
            <Column header="Link active">
              <template #body="{ data }">
                <ToggleSwitch
                  :modelValue="data.is_active"
                  :disabled="savingReferrerId === data.id"
                  @update:modelValue="setReferrerActive(data, $event)"
                />
              </template>
            </Column>
            <Column header="">
              <template #body="{ data }">
                <Button label="View referees" size="small" severity="secondary" outlined @click="showRefereesFor(data.id)" />
              </template>
            </Column>

            <template #expansion="{ data }">
              <div class="subrows">
                <div v-if="!referrerDiscounts(data.id).length" class="sub">
                  {{ referrersActiveOnly ? 'No active discounts.' : 'No discounts earned yet. A discount is earned when a referee’s discount is applied.' }}
                </div>
                <div v-for="r in referrerDiscounts(data.id)" :key="r.id" class="subrow">
                  <i class="pi pi-gift subrow-icon" />
                  <div class="subrow-text">
                    <div>20% off next purchase, earned from <strong>{{ r.invitee_name || r.invitee_email }}</strong></div>
                    <div class="sub">Referee discount applied {{ formatDate(r.referee_discount_applied_at!) }}</div>
                  </div>
                  <div v-if="r.referrer_discount_applied_at" class="applied">
                    <span><i class="pi pi-check" /> Applied {{ formatDate(r.referrer_discount_applied_at) }}</span>
                    <Button label="Undo" size="small" text severity="secondary" :loading="savingId === r.id" @click="setReferrerDiscountApplied(r, false)" />
                  </div>
                  <Button
                    v-else
                    label="Mark discount applied"
                    icon="pi pi-tag"
                    size="small"
                    :loading="savingId === r.id"
                    @click="setReferrerDiscountApplied(r, true)"
                  />
                </div>
              </div>
            </template>
          </DataTable>
        </TabPanel>

        <!-- Referees: one row per person who booked through a referral link -->
        <TabPanel value="referees">
          <div class="filters">
            <Select
              v-model="referrerFilter"
              :options="referrerOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All referrers"
              showClear
              filter
              class="filter-select"
            />
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              placeholder="All statuses"
              showClear
              class="filter-select"
            />
            <DatePicker
              v-model="dateRange"
              selectionMode="range"
              :manualInput="false"
              placeholder="Appointment dates"
              showButtonBar
              class="filter-dates"
            />
            <label class="active-toggle">
              <Checkbox v-model="refereesActiveOnly" binary />
              Active discounts only
            </label>
          </div>

          <div v-if="loading && !referrals.length" class="loading">
            <i class="pi pi-spin pi-spinner" /> Loading referees...
          </div>
          <DataTable v-else :value="filteredReferees" stripedRows size="small" dataKey="id">
            <template #empty>
              {{ refereesActiveOnly ? 'No referees have active discounts.' : 'No referees match these filters.' }}
            </template>
            <Column header="Referee">
              <template #body="{ data }">
                <div>{{ data.invitee_name || '—' }}</div>
                <div class="sub">{{ data.invitee_email }}</div>
              </template>
            </Column>
            <Column field="referrer_name" header="Referred by" />
            <Column header="Appointment">
              <template #body="{ data }">
                <div>{{ data.scheduled_for ? formatDateTime(data.scheduled_for) : '—' }}</div>
                <div class="sub">{{ data.event_type_name || '' }}</div>
              </template>
            </Column>
            <Column header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="statusSeverity(data.status)" />
              </template>
            </Column>
            <Column header="Eligible">
              <template #body="{ data }">
                <div class="tags">
                  <Tag :value="data.qualifies ? 'Yes' : 'No'" :severity="data.qualifies ? 'success' : 'secondary'" />
                  <Tag v-for="reason in eligibilityNotes(data)" :key="reason" :value="reason" severity="contrast" class="reason-tag" />
                </div>
              </template>
            </Column>
            <Column header="20% off first purchase">
              <template #body="{ data }">
                <div v-if="data.referee_discount_applied_at" class="applied">
                  <span><i class="pi pi-check" /> Applied {{ formatDate(data.referee_discount_applied_at) }}</span>
                  <Button label="Undo" size="small" text severity="secondary" :loading="savingId === data.id" @click="setRefereeDiscountApplied(data, false)" />
                </div>
                <Button
                  v-else-if="hasActiveRefereeDiscount(data)"
                  label="Mark discount applied"
                  icon="pi pi-tag"
                  size="small"
                  :loading="savingId === data.id"
                  @click="setRefereeDiscountApplied(data, true)"
                />
                <span v-else class="sub">—</span>
              </template>
            </Column>
            <Column field="notes" header="Notes">
              <template #body="{ data }">
                <span :class="{ sub: !data.notes }">{{ data.notes ? truncate(data.notes) : '—' }}</span>
              </template>
            </Column>
            <Column header="">
              <template #body="{ data }">
                <Button label="Edit" size="small" severity="info" outlined @click="openEdit(data)" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" header="Edit Referee" modal :style="{ width: '460px' }">
      <div v-if="editing" class="edit-form">
        <p class="edit-summary">
          <strong>{{ editing.invitee_name || editing.invitee_email }}</strong>, referred by {{ editing.referrer_name }}
        </p>
        <div class="form-row">
          <label>Status</label>
          <Select v-model="editForm.status" :options="statusOptions" />
        </div>
        <div class="form-row inline">
          <ToggleSwitch v-model="editForm.qualifies" inputId="qualifies" />
          <label for="qualifies">Eligible for referral discounts (new patient)</label>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="editForm.notes" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <CreateEditFooter :loading="savingEdit" @cancel="showEditDialog = false" @save="handleSaveEdit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import ToggleSwitch from 'primevue/toggleswitch'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import CreateEditFooter from '@/components/CreateEditFooter.vue'
import { ReferralsService, ReferralStatus } from '@/api'
import type { ReferralResponse, ReferrerResponse } from '@/api'
import { requestWrapper } from '@/api/client'
import { useReferralStore } from '@/stores/referrals'

const route = useRoute()
const { referrers, referrals, loading, loadReferrals, activeReferrerDiscountCount } = useReferralStore()

const statusOptions = Object.values(ReferralStatus)

// Banner links: ?tab=referrers|referees, ?referrer=<id> (expands / filters to that referrer)
const queryReferrer = route.query.referrer ? Number(route.query.referrer) : null
const activeTab = ref(route.query.tab === 'referees' ? 'referees' : 'referrers')

// --- Discount rules ---
// The referee's 20% off first purchase is stored as referee_discount_applied_at; applying it earns the referrer a
// 20%-off-next-purchase discount, stored as referrer_discount_applied_at once applied.

function hasActiveRefereeDiscount(r: ReferralResponse): boolean {
  return r.qualifies && r.status !== ReferralStatus.CANCELED && !r.referee_discount_applied_at
}

function hasEarnedReferrerDiscount(r: ReferralResponse): boolean {
  return r.qualifies && !!r.referee_discount_applied_at
}

const activeRefereeDiscounts = computed(() => referrals.value.filter(hasActiveRefereeDiscount).length)

// --- Referrers tab ---

const referrerSearch = ref('')
const referrersActiveOnly = ref(false)
const expandedReferrers = ref<Record<number, boolean>>(
  queryReferrer !== null && activeTab.value === 'referrers' ? { [queryReferrer]: true } : {},
)

const filteredReferrers = computed(() => {
  const query = referrerSearch.value.toLowerCase().trim()
  return referrers.value.filter((r) => {
    if (referrersActiveOnly.value && !r.active_referrer_discounts) return false
    return !query || `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(query)
  })
})

function referrerDiscounts(referrerId: number): ReferralResponse[] {
  return referrals.value.filter(
    (r) =>
      r.referrer_id === referrerId &&
      hasEarnedReferrerDiscount(r) &&
      (!referrersActiveOnly.value || !r.referrer_discount_applied_at),
  )
}

function showRefereesFor(referrerId: number) {
  referrerFilter.value = referrerId
  statusFilter.value = null
  dateRange.value = null
  refereesActiveOnly.value = false
  activeTab.value = 'referees'
}

// --- Referees tab ---

const referrerFilter = ref<number | null>(activeTab.value === 'referees' ? queryReferrer : null)
const statusFilter = ref<ReferralStatus | null>(null)
const dateRange = ref<(Date | null)[] | null>(null)
const refereesActiveOnly = ref(false)

const referrerOptions = computed(() =>
  referrers.value.map((r) => ({ label: `${r.first_name} ${r.last_name}`, value: r.id })),
)

const filteredReferees = computed(() => {
  const [from, to] = dateRange.value ?? []
  const toEnd = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1) : null
  return referrals.value.filter((r) => {
    if (referrerFilter.value !== null && r.referrer_id !== referrerFilter.value) return false
    if (statusFilter.value && r.status !== statusFilter.value) return false
    if (refereesActiveOnly.value && !hasActiveRefereeDiscount(r)) return false
    if (from) {
      if (!r.scheduled_for) return false
      const scheduled = new Date(r.scheduled_for)
      if (scheduled < from || (toEnd && scheduled >= toEnd)) return false
    }
    return true
  })
})

// --- Display helpers ---

function statusSeverity(status: ReferralStatus): string {
  if (status === ReferralStatus.COMPLETED) return 'success'
  if (status === ReferralStatus.CANCELED) return 'secondary'
  return 'info'
}

function eligibilityNotes(r: ReferralResponse): string[] {
  const notes: string[] = []
  if (r.is_self_referral) notes.push('Self-referral')
  if (r.client_name) notes.push(`Existing client: ${r.client_name}`)
  else if (r.reported_patient_type === 'existing') notes.push('Booked as returning patient')
  if (r.rescheduled_from_id) notes.push('Rescheduled')
  return notes
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(text: string, max = 40): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

// --- Actions ---

const savingId = ref<number | null>(null)
const savingReferrerId = ref<number | null>(null)

async function updateReferral(referral: ReferralResponse, update: { referee_discount_applied?: boolean; referrer_discount_applied?: boolean }) {
  savingId.value = referral.id
  try {
    await requestWrapper(ReferralsService.updateReferral(referral.id, update))
    await loadReferrals()
  } finally {
    savingId.value = null
  }
}

function setRefereeDiscountApplied(referral: ReferralResponse, applied: boolean) {
  return updateReferral(referral, { referee_discount_applied: applied })
}

function setReferrerDiscountApplied(referral: ReferralResponse, applied: boolean) {
  return updateReferral(referral, { referrer_discount_applied: applied })
}

async function setReferrerActive(referrer: ReferrerResponse, isActive: boolean) {
  savingReferrerId.value = referrer.id
  try {
    await requestWrapper(ReferralsService.updateReferrer(referrer.id, { is_active: isActive }))
    await loadReferrals()
  } finally {
    savingReferrerId.value = null
  }
}

const showEditDialog = ref(false)
const savingEdit = ref(false)
const editing = ref<ReferralResponse | null>(null)
const editForm = ref({ status: ReferralStatus.BOOKED, qualifies: false, notes: '' })

function openEdit(referral: ReferralResponse) {
  editing.value = referral
  editForm.value = { status: referral.status, qualifies: referral.qualifies, notes: referral.notes ?? '' }
  showEditDialog.value = true
}

async function handleSaveEdit() {
  if (!editing.value) return
  savingEdit.value = true
  try {
    await requestWrapper(
      ReferralsService.updateReferral(editing.value.id, {
        status: editForm.value.status,
        qualifies: editForm.value.qualifies,
        notes: editForm.value.notes.trim() || null,
      }),
    )
    showEditDialog.value = false
    await loadReferrals()
  } finally {
    savingEdit.value = false
  }
}

onMounted(() => loadReferrals())
</script>

<style scoped>
.referrals-page {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.page-header h2 {
  margin: 0;
}

.summary {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-600);
}

.summary-item.active {
  color: var(--p-orange-600);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-select {
  width: 200px;
}

.filter-dates {
  width: 240px;
}

.active-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.referrer-search {
  width: 280px;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--p-surface-500);
  padding: 2rem 0;
}

.sub {
  font-size: 0.8rem;
  color: var(--p-surface-500);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.reason-tag {
  font-weight: 400;
}

.applied {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--p-green-700);
}

.subrows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.25rem 0 0.25rem 3rem;
}

.subrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--p-surface-50);
  border-radius: 6px;
  font-size: 0.875rem;
}

.subrow-icon {
  color: var(--p-orange-500);
}

.subrow-text {
  flex: 1;
}

code {
  font-size: 0.8rem;
  background: var(--p-surface-100);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.edit-summary {
  margin: 0;
  font-size: 0.9rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-row.inline {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.form-row label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-surface-600);
}

.form-row :deep(.p-select),
.form-row :deep(textarea) {
  width: 100%;
}
</style>
