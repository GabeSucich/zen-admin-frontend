<template>
  <MainMenu v-if="route.path !== '/login'" :refreshing="refreshing" @refresh="refreshDashboard" />
  <ErrorView />
  <router-view />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalErrors } from '@/stores/errors'
import ErrorView from '@/components/ErrorView.vue'
import MainMenu from '@/components/MainMenu.vue'
import { requestWrapper } from '@/api/client'
import { AuthService } from '@/api'
import { useClientStore } from '@/stores/clients'
import { useSuggestionsStore } from '@/stores/suggestions'
import { useMeetingTypesStore } from '@/stores/meetingTypes'
import { useTodoStore } from '@/stores/todos'

const router = useRouter()
const route = useRoute()
const { forbidden } = useGlobalErrors()
const { loadClients } = useClientStore()
const { loadSuggestions } = useSuggestionsStore()
const { loadMeetingTypes } = useMeetingTypesStore()
const { loadTodos } = useTodoStore()

const refreshing = ref(false)

async function refreshDashboard() {
  refreshing.value = true
  try {
    await Promise.all([loadClients(), loadSuggestions(), loadMeetingTypes(), loadTodos()])
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  await requestWrapper(AuthService.healthCheck())
  refreshDashboard()
})

watch(forbidden, (value) => {
  if (value) {
    forbidden.value = false
    router.push('/login')
  }
})
</script>
