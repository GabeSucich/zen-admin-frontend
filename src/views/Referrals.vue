<template>
  <div class="referrals-page">
    <div class="page-header">
      <h2>Referrals</h2>
      <div class="summary">
        <span class="summary-item"><strong>{{ referrers.length }}</strong> referrers</span>
        <span class="summary-item"><strong>{{ qualifyingCount }}</strong> qualifying referrals</span>
        <span class="summary-item"><strong>{{ purchaseCount }}</strong> purchases</span>
        <span class="summary-item" :class="{ owed: rewardsOwedCount }"><strong>{{ rewardsOwedCount }}</strong> rewards owed</span>
      </div>
    </div>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="referrals">Referrals</Tab>
        <Tab value="referrers">Referrers</Tab>
      </TabList>
      <TabPanels>
        <!-- Referrals -->
        <TabPanel value="referrals">
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
            <label class="owed-toggle">
              <Checkbox v-model="owedOnly" binary />
              Rewards owed only
            </label>
          </div>

          <div v-if="loading && !referrals.length" class="loading">
            <i class="pi pi-spin pi-spinner" /> Loading referrals...
          </div>
          <DataTable v-else :value="filteredReferrals" stripedRows size="small" dataKey="id">
            <template #empty>No referrals match these filters.</template>
            <Column header="Appointment">
              <template #body="{ data }">
                <div>{{ data.scheduled_for ? formatDateTime(data.scheduled_for) : '—' }}</div>
                <div class="sub">{{ data.event_type_name || '' }}</div>
              </template>
            </Column>
            <Column header="Referee">
              <template #body="{ data }">
                <div>{{ data.invitee_name || '—' }}</div>
                <div class="sub">{{ data.invitee_email }}</div>
              </template>
            </Column>
            <Column field="referrer_name" header="Referred by" />
            <Column header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="statusSeverity(data.status)" />
              </template>
            </Column>
            <Column header="Qualifies">
              <template #body="{ data }">
                <div class="tags">
                  <Tag :value="data.qualifies ? 'Yes' : 'No'" :severity="data.qualifies ? 'success' : 'secondary'" />
                  <Tag v-for="reason in qualifyNotes(data)" :key="reason" :value="reason" severity="contrast" class="reason-tag" />
                </div>
              </template>
            </Column>
            <Column header="Purchase">
              <template #body="{ data }">
                <div v-if="data.purchased_at" class="reward-issued">
                  <span><i class="pi pi-check" /> {{ formatDate(data.purchased_at) }}</span>
                  <Button label="Undo" size="small" text severity="secondary" :loading="savingId === data.id" @click="setPurchased(data, false)" />
                </div>
                <Button
                  v-else-if="data.status !== ReferralStatus.CANCELED"
                  label="Mark purchased"
                  icon="pi pi-shopping-bag"
                  size="small"
                  severity="secondary"
                  outlined
                  :loading="savingId === data.id"
                  @click="setPurchased(data, true)"
                />
                <span v-else class="sub">—</span>
              </template>
            </Column>
            <Column header="Reward">
              <template #body="{ data }">
                <div v-if="data.reward_issued_at" class="reward-issued">
                  <span><i class="pi pi-check" /> Issued {{ formatDate(data.reward_issued_at) }}</span>
                  <Button label="Undo" size="small" text severity="secondary" :loading="savingId === data.id" @click="setRewardIssued(data, false)" />
                </div>
                <Button
                  v-else-if="isRewardOwed(data)"
                  label="Mark issued"
                  icon="pi pi-gift"
                  size="small"
                  :loading="savingId === data.id"
                  @click="setRewardIssued(data, true)"
                />
                <span v-else-if="data.qualifies && data.status !== ReferralStatus.CANCELED" class="sub">Awaiting purchase</span>
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

        <!-- Referrers -->
        <TabPanel value="referrers">
          <div class="filters">
            <InputText v-model="referrerSearch" placeholder="Search by name or email..." class="referrer-search" />
          </div>
          <DataTable :value="filteredReferrers" stripedRows size="small" dataKey="id">
            <template #empty>No referrers yet.</template>
            <Column header="Name">
              <template #body="{ data }">{{ data.first_name }} {{ data.last_name }}</template>
            </Column>
            <Column field="email" header="Email" />
            <Column header="Code">
              <template #body="{ data }"><code>{{ data.code }}</code></template>
            </Column>
            <Column header="Signed up">
              <template #body="{ data }">{{ formatDate(data.created_at) }}</template>
            </Column>
            <Column field="total_bookings" header="Bookings" />
            <Column field="qualifying_referrals" header="Qualifying" />
            <Column field="purchases" header="Purchases" />
            <Column header="Rewards owed">
              <template #body="{ data }">
                <Tag v-if="data.rewards_owed" :value="String(data.rewards_owed)" severity="warn" />
                <span v-else class="sub">0</span>
              </template>
            </Column>
            <Column field="rewards_issued" header="Rewards issued" />
            <Column header="Active">
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
                <Button label="View referrals" size="small" severity="secondary" outlined @click="showReferralsFor(data.id)" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" header="Edit Referral" modal :style="{ width: '460px' }">
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
          <label for="qualifies">Qualifies for a reward (first appointment)</label>
        </div>
        <div class="form-row">
          <label>Notes</label>
          <Textarea v-model="editForm.notes" rows="3" autoResize placeholder="e.g. $50 gift card sent by text" />
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
const { referrers, referrals, loading, loadReferrals, rewardsOwedCount } = useReferralStore()

const activeTab = ref('referrals')
const statusOptions = Object.values(ReferralStatus)

// --- Filters ---

const referrerFilter = ref<number | null>(route.query.referrer ? Number(route.query.referrer) : null)
const statusFilter = ref<ReferralStatus | null>(null)
const dateRange = ref<(Date | null)[] | null>(null)
const owedOnly = ref(route.query.owed === '1')
const referrerSearch = ref('')

const referrerOptions = computed(() =>
  referrers.value.map((r) => ({ label: `${r.first_name} ${r.last_name}`, value: r.id })),
)

// Referrers earn a reward once a qualifying (new patient) referral makes a purchase
function isRewardOwed(r: ReferralResponse): boolean {
  return r.qualifies && !!r.purchased_at && !r.reward_issued_at
}

const qualifyingCount = computed(() =>
  referrals.value.filter((r) => r.qualifies && r.status !== ReferralStatus.CANCELED).length,
)

const purchaseCount = computed(() =>
  referrals.value.filter((r) => r.qualifies && r.purchased_at).length,
)

const filteredReferrals = computed(() => {
  const [from, to] = dateRange.value ?? []
  const toEnd = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1) : null
  return referrals.value.filter((r) => {
    if (referrerFilter.value !== null && r.referrer_id !== referrerFilter.value) return false
    if (statusFilter.value && r.status !== statusFilter.value) return false
    if (owedOnly.value && !isRewardOwed(r)) return false
    if (from) {
      if (!r.scheduled_for) return false
      const scheduled = new Date(r.scheduled_for)
      if (scheduled < from || (toEnd && scheduled >= toEnd)) return false
    }
    return true
  })
})

const filteredReferrers = computed(() => {
  const query = referrerSearch.value.toLowerCase().trim()
  if (!query) return referrers.value
  return referrers.value.filter((r) =>
    `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(query),
  )
})

function showReferralsFor(referrerId: number) {
  referrerFilter.value = referrerId
  statusFilter.value = null
  dateRange.value = null
  owedOnly.value = false
  activeTab.value = 'referrals'
}

// --- Display helpers ---

function statusSeverity(status: ReferralStatus): string {
  if (status === ReferralStatus.COMPLETED) return 'success'
  if (status === ReferralStatus.CANCELED) return 'secondary'
  return 'info'
}

function qualifyNotes(r: ReferralResponse): string[] {
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

async function setPurchased(referral: ReferralResponse, purchased: boolean) {
  savingId.value = referral.id
  try {
    await requestWrapper(ReferralsService.updateReferral(referral.id, { purchased }))
    await loadReferrals()
  } finally {
    savingId.value = null
  }
}

async function setRewardIssued(referral: ReferralResponse, issued: boolean) {
  savingId.value = referral.id
  try {
    await requestWrapper(ReferralsService.updateReferral(referral.id, { reward_issued: issued }))
    await loadReferrals()
  } finally {
    savingId.value = null
  }
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

.summary-item.owed {
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

.owed-toggle {
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

.reward-issued {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--p-green-700);
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
