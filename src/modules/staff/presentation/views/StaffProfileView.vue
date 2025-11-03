<template>
  <div class="staff-profile p-5">
    <pv-card class="profile-card">
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-primary">{{ t('staffProfile.title') }}</h2>
          <pv-button :label="t('common.back')" icon="pi pi-arrow-left" class="p-button-text" @click="goBack" />
        </div>
      </template>

      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">{{ t('staffProfile.name') }}</label>
              <pv-input-text v-model="profile.name" disabled class="w-full" />
            </div>
            <div class="field">
              <label class="font-semibold">{{ t('staffProfile.email') }}</label>
              <pv-input-text v-model="profile.email" disabled class="w-full" />
            </div>
            <div class="field">
              <label class="font-semibold">{{ t('staffProfile.position') }}</label>
              <pv-input-text v-model="profile.position" disabled class="w-full" />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field">
              <label class="font-semibold">{{ t('staffProfile.shift') }}</label>
              <pv-input-text v-model="profile.shift" disabled class="w-full" />
            </div>
          </div>
        </div>

        <div class="mt-4">
          <pv-divider />
          <div class="text-sm text-gray-500">
            {{ t('staffProfile.lastUpdated') }}: {{ profile.lastUpdated || t('common.notAvailable') }}
          </div>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PvCard from 'primevue/card'
import PvButton from 'primevue/button'
import PvInputText from 'primevue/inputtext'
import PvDivider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'

// Servicios
import { UserService } from '../../../auth/application/UserService.js'
import { UserAPIRepository } from '../../../auth/infrastructure/repositories/user_api_repository.js'
import { ProfileApiRepository } from '../../../auth/infrastructure/repositories/ProfileApiRepository.js'
import { PropertyApiRepository } from '../../../property/infrastructure/repositories/PropertyApiRepository.js'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

const userRepository = new UserAPIRepository()
const profileRepository = new ProfileApiRepository()
const propertyRepository = new PropertyApiRepository()
const userService = new UserService(userRepository, profileRepository, propertyRepository)

const profile = ref({
  name: '',
  email: '',
  position: '',
  shift: '',
  role: 'Staff',
  phone: '',
  lastUpdated: ''
})

async function loadProfile() {
  try {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) throw new Error('No user found in localStorage')
    const staffId = JSON.parse(storedUser).id

    const staffList = await userService.getStaffDetailsList()
    const found = staffList.find(u => u.id === staffId)
    if (found) profile.value = found
  } catch (error) {
    console.error('Error loading profile:', error)
    toast.add({
      severity: 'error',
      summary: t('errors.error'),
      detail: t('errors.profileLoadFail'),
      life: 3000
    })
  }
}

function goBack() {
  router.push({ name: 'staff-dashboard' })
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.field {
  margin-bottom: 1rem;
}
</style>
