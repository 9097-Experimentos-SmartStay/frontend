<template>
  <div class="surface-ground min-h-screen flex flex-column">
    <pv-toast position="bottom-right" />

    <pv-toolbar class="sticky top-0 z-5 shadow-1 border-none px-4 md:px-6 py-3 adaptive-toolbar">
      <template #start>
        <div class="flex align-items-center gap-2 cursor-pointer" @click="loadDashboard">
          <i class="pi pi-building text-primary text-3xl"></i>
          <span class="text-xl font-bold app-title">SmartStay</span>
        </div>
      </template>

      <template #end>
        <div class="flex align-items-center gap-1 md:gap-2">
          <pv-button :label="$t('guestDashboard.viewProperties')" icon="pi pi-map" class="p-button-text nav-btn hidden md:flex" @click="goToHotels" />
          <pv-button :label="$t('accommodations.title')" icon="pi pi-home" class="p-button-text nav-btn hidden md:flex" @click="goToRooms" />
          <pv-button :label="$t('guestDashboard.myBookings')" icon="pi pi-calendar" class="p-button-text nav-btn hidden md:flex" @click="goToBookings" />

          <div class="w-1px h-2rem bg-300 mx-2 hidden md:block"></div>

          <!-- NUEVO: Selector de Idioma -->
          <pv-button
              :label="currentLocale.toUpperCase()"
              icon="pi pi-globe"
              class="p-button-text p-button-rounded language-btn"
              @click="toggleLanguage"
              v-tooltip.bottom="'Cambiar idioma / Change language'"
          />

          <!-- Profile Menu Dropdown -->
          <div class="profile-menu-wrapper relative">
            <button
                type="button"
                class="profile-avatar-btn flex align-items-center gap-2 cursor-pointer border-none bg-transparent p-2 border-round hover:bg-gray-100 transition-duration-200"
                @click.stop="toggleProfileMenu"
            >
              <pv-avatar
                  :label="userInitials"
                  shape="circle"
                  class="bg-primary text-white font-bold"
                  style="width: 2.5rem; height: 2.5rem"
              />
              <span class="font-medium hidden lg:block user-name">{{ currentUser?.username || 'Guest' }}</span>
              <i :class="['pi', isProfileMenuOpen ? 'pi-chevron-up' : 'pi-chevron-down', 'text-600']"></i>
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown-fade">
              <div
                  v-if="isProfileMenuOpen"
                  class="profile-dropdown absolute right-0 bg-white border-round-lg shadow-4 mt-2 overflow-hidden"
                  style="min-width: 220px; z-index: 1000;"
              >
                <div class="p-3 border-bottom-1 surface-border">
                  <div class="font-semibold text-900">{{ getUserName() }}</div>
                  <div class="text-sm text-600">{{ currentUser?.username }}</div>
                </div>

                <div class="py-2">
                  <button
                      type="button"
                      class="profile-menu-item w-full text-left px-3 py-2 flex align-items-center gap-3 cursor-pointer border-none bg-transparent hover:bg-gray-100 transition-duration-200"
                      @click="goToProfile"
                  >
                    <i class="pi pi-user text-primary"></i>
                    <span class="text-900">{{ $t('profile.title') }}</span>
                  </button>
                </div>

                <div class="border-top-1 surface-border">
                  <button
                      type="button"
                      class="profile-menu-item w-full text-left px-3 py-2 flex align-items-center gap-3 cursor-pointer border-none bg-transparent hover:bg-red-50 transition-duration-200"
                      @click="handleLogout"
                  >
                    <i class="pi pi-sign-out text-red-500"></i>
                    <span class="text-red-500 font-medium">{{ $t('dashboard.logoutButton') }}</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </pv-toolbar>

    <div class="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto">

      <div v-if="loading" class="flex flex-column align-items-center justify-content-center h-20rem">
        <pv-progress-spinner />
        <p class="mt-3 text-gray-500">{{ $t('common.loading') }}</p>
      </div>

      <div v-else>
        <div class="surface-card p-5 shadow-2 border-round-2xl mb-5 relative overflow-hidden">
          <div class="relative z-2">
            <h1 class="text-4xl font-bold text-900 mb-2">{{ $t('guestDashboard.title', { name: getUserName() }) }} 👋</h1>
            <p class="text-lg text-600 m-0 max-w-30rem">{{ $t('guestDashboard.subtitle') }}</p>
          </div>
          <i class="pi pi-star-fill absolute text-yellow-100" style="font-size: 15rem; right: -3rem; bottom: -5rem; z-index: 1; opacity: 0.5;"></i>
        </div>

        <div class="grid">
          <div class="col-12 lg:col-8">

            <div class="mb-5">
              <div class="flex justify-content-between align-items-center mb-3">
                <span class="text-xl font-bold text-900 flex align-items-center gap-2">
                  <i class="pi pi-compass text-primary"></i> {{ $t('guestDashboard.nextDestination') }}
                </span>
                <pv-button :label="$t('guestDashboard.viewAll')" icon="pi pi-arrow-right" iconPos="right" class="p-button-text p-button-sm" @click="goToBookings" />
              </div>

              <pv-card v-if="upcomingBookings.length > 0" class="border-left-3 border-primary surface-card shadow-4 border-round-xl">
                <template #content>
                  <div class="flex flex-column md:flex-row gap-4">
                    <div class="w-full md:w-4 border-round-lg overflow-hidden bg-gray-100 flex align-items-center justify-content-center min-h-10rem">
                      <i class="pi pi-image text-5xl text-gray-300"></i>
                    </div>

                    <div class="flex-1 flex flex-column justify-content-between">
                      <div>
                        <div class="flex justify-content-between align-items-start mb-2">
                          <h2 class="text-2xl font-bold m-0 text-900">Habitación #{{ upcomingBookings[0].roomId }}</h2>
                          <pv-tag :value="translateBookingStatus(upcomingBookings[0].status)" :severity="getStatusSeverity(upcomingBookings[0].status)" rounded />
                        </div>
                        <div class="text-500 flex align-items-center gap-2">
                          <i class="pi pi-map-marker text-primary"></i> SmartStay Hotel Central
                        </div>
                      </div>

                      <div class="grid mt-4">
                        <div class="col-6 border-right-1 border-100">
                          <span class="text-xs text-500 uppercase font-bold block mb-1">{{ $t('bookings.checkIn') }}</span>
                          <span class="text-xl font-medium text-900">{{ formatDate(upcomingBookings[0].checkInDate) }}</span>
                        </div>
                        <div class="col-6 pl-3">
                          <span class="text-xs text-500 uppercase font-bold block mb-1">{{ $t('bookings.checkOut') }}</span>
                          <span class="text-xl font-medium text-900">{{ formatDate(upcomingBookings[0].checkOutDate) }}</span>
                        </div>
                      </div>

                      <div class="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 border-100">
                        <pv-button v-if="canCancel(upcomingBookings[0])" :label="$t('common.cancel')" class="p-button-danger p-button-text p-button-sm" icon="pi pi-times" @click="cancelBooking(upcomingBookings[0])" />
                        <pv-button :label="$t('guestDashboard.manageBooking')" class="p-button-sm" icon="pi pi-cog" @click="openBooking(upcomingBookings[0])" />
                      </div>
                    </div>
                  </div>
                </template>
              </pv-card>

              <div v-else class="surface-card p-6 text-center border-round-xl shadow-1 border-dashed border-1 border-300">
                <div class="bg-blue-50 border-circle w-4rem h-4rem flex align-items-center justify-content-center mx-auto mb-3">
                  <i class="pi pi-calendar-plus text-2xl text-blue-500"></i>
                </div>
                <h3 class="text-900 font-medium m-0 mb-2">{{ $t('guestDashboard.noUpcoming') }}</h3>
                <p class="text-600 mb-4 max-w-20rem mx-auto">{{ $t('guestDashboard.exploreHotels') }}</p>
                <pv-button :label="$t('guestDashboard.searchRooms')" icon="pi pi-search" @click="goToRooms" />
              </div>
            </div>

            <div>
              <span class="text-xl font-bold text-900 block mb-3">{{ $t('guestDashboard.recommendationsTitle') }}</span>
              <pv-carousel
                  :value="recommendations"
                  :numVisible="2"
                  :numScroll="1"
                  :responsiveOptions="responsiveOptions"
                  circular
                  :autoplayInterval="6000">
                <template #item="slotProps">
                  <div class="border-1 surface-border border-round-xl m-2 p-3 hover:shadow-4 transition-duration-300 cursor-pointer bg-white h-full flex flex-column" @click="goToRoom(slotProps.data.id)">
                    <div class="relative w-full">
                      <div class="bg-gray-100 border-round-lg h-12rem w-full flex align-items-center justify-content-center mb-3">
                        <i class="pi pi-home text-4xl text-gray-300"></i>
                      </div>
                      <pv-tag value="Premium" severity="warning" class="absolute shadow-1" style="top: 10px; left: 10px" />
                    </div>
                    <div class="flex-1">
                      <div class="font-bold text-lg mb-2 text-900">{{ slotProps.data.roomTypeName || 'Suite Exclusiva' }}</div>
                      <p class="text-600 text-sm line-height-3 m-0 text-overflow-ellipsis overflow-hidden h-3rem">
                        {{ slotProps.data.description || 'Confort garantizado.' }}
                      </p>
                    </div>
                    <div class="mt-3 pt-3 border-top-1 border-100 flex align-items-center justify-content-between">
                      <span class="text-primary font-bold text-sm uppercase tracking-wide">{{ $t('accommodations.viewDetails') }}</span>
                      <i class="pi pi-arrow-right text-primary"></i>
                    </div>
                  </div>
                </template>
              </pv-carousel>
            </div>
          </div>

          <div class="col-12 lg:col-4">
            <div class="grid mb-4">
              <div class="col-6">
                <div class="surface-card shadow-1 p-3 border-round-xl text-center h-full flex flex-column justify-content-center">
                  <span class="block text-500 font-medium text-sm mb-1">{{ $t('guestDashboard.myBookings') }}</span>
                  <div class="text-900 font-bold text-3xl text-primary">{{ upcomingBookings.length }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="surface-card shadow-1 p-3 border-round-xl text-center h-full flex flex-column justify-content-center">
                  <span class="block text-500 font-medium text-sm mb-1">{{ $t('bookings.nights') }}</span>
                  <div class="text-900 font-bold text-3xl text-orange-500">{{ stats.nights || 0 }}</div>
                </div>
              </div>
            </div>

            <pv-card class="mb-4 shadow-1 border-round-xl">
              <template #title><div class="text-lg font-bold">{{ $t('guestDashboard.quickServices') }}</div></template>
              <template #content>
                <ul class="list-none p-0 m-0">
                  <li class="flex align-items-center py-3 border-bottom-1 surface-border cursor-pointer hover:bg-gray-50 px-2 border-round transition-duration-200" @click="goToRooms">
                    <div class="flex align-items-center justify-content-center bg-blue-100 border-round mr-3" style="width: 2.5rem; height: 2.5rem"><i class="pi pi-search text-blue-600 text-lg"></i></div>
                    <span class="text-800 font-medium">{{ $t('guestDashboard.newBooking') }}</span>
                    <i class="pi pi-angle-right text-400 ml-auto"></i>
                  </li>
                  <li class="flex align-items-center py-3 border-bottom-1 surface-border cursor-pointer hover:bg-gray-50 px-2 border-round transition-duration-200" @click="goToHotels">
                    <div class="flex align-items-center justify-content-center bg-purple-100 border-round mr-3" style="width: 2.5rem; height: 2.5rem"><i class="pi pi-map text-purple-600 text-lg"></i></div>
                    <span class="text-800 font-medium">{{ $t('guestDashboard.viewHotels') }}</span>
                    <i class="pi pi-angle-right text-400 ml-auto"></i>
                  </li>
                  <li class="flex align-items-center py-3 cursor-pointer hover:bg-gray-50 px-2 border-round transition-duration-200" @click="contactSupport">
                    <div class="flex align-items-center justify-content-center bg-green-100 border-round mr-3" style="width: 2.5rem; height: 2.5rem"><i class="pi pi-whatsapp text-green-600 text-lg"></i></div>
                    <span class="text-800 font-medium">{{ $t('guestDashboard.support247') }}</span>
                    <i class="pi pi-angle-right text-400 ml-auto"></i>
                  </li>
                </ul>
              </template>
            </pv-card>

            <div class="surface-card shadow-2 p-4 border-round-xl relative overflow-hidden bg-gray-900 text-white">
              <div class="relative z-2">
                <div class="font-bold text-xl mb-2">{{ $t('guestDashboard.vipTransport') }}</div>
                <p class="m-0 mb-3 text-gray-300 text-sm line-height-3">{{ $t('guestDashboard.vipTransportDesc') }}</p>
                <pv-button :label="$t('guestDashboard.requestService')" class="p-button-warning p-button-sm w-full font-bold" @click="requestService" />
              </div>
              <div class="absolute top-0 left-0 w-full h-full opacity-30" style="background: radial-gradient(circle at top right, var(--primary-color), transparent);"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';

// --- STORES (ARQUITECTURA LIMPIA) ---
import useIamStore from '@/iam/application/iam.store.js';
import { useRoomStore } from '@/accommodations/application/room.store.js';
import { useBookingStore } from '@/bookings/application/booking.store.js';

const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();

// Instancias de Stores
const iamStore = useIamStore();
const roomStore = useRoomStore();
const bookingStore = useBookingStore();

// State
const loading = ref(true);
const upcomingBookings = ref([]);
const recommendations = ref([]);
const stats = ref({ upcoming: 0, nights: 0 });
const currentUser = ref(null);
const isProfileMenuOpen = ref(false);

const responsiveOptions = [
  { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  { breakpoint: '768px', numVisible: 1, numScroll: 1 }
];

const userInitials = computed(() => {
  const name = currentUser.value?.username || 'Guest';
  return name.substring(0, 2).toUpperCase();
});

// Computed para el idioma actual
const currentLocale = computed(() => locale.value);

// NUEVA FUNCIÓN: Cambiar idioma
function toggleLanguage() {
  const newLocale = locale.value === 'en' ? 'es' : 'en';
  locale.value = newLocale;
  localStorage.setItem('language', newLocale);

  toast.add({
    severity: 'success',
    summary: newLocale === 'es' ? 'Idioma cambiado' : 'Language changed',
    detail: newLocale === 'es' ? 'Idioma cambiado a Español' : 'Language changed to English',
    life: 2000
  });
}

function getUserName() {
  if (currentUser.value?.name) return currentUser.value.name;
  return currentUser.value?.username?.split('@')[0] || 'Huésped';
}

// Profile Menu Functions
function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value;
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false;
}

function handleClickOutside(event) {
  if (isProfileMenuOpen.value) {
    const wrapper = event.target.closest('.profile-menu-wrapper');
    if (!wrapper) {
      closeProfileMenu();
    }
  }
}

function goToProfile() {
  closeProfileMenu();
  const userId = currentUser.value?.id || iamStore.currentUserId || 1;
  router.push({ name: 'profile-detail', params: { id: userId } });
}

function handleLogout() {
  closeProfileMenu();
  logout();
}

async function loadDashboard() {
  loading.value = true;
  try {
    // 1. Recuperar Sesión
    let userId = iamStore.currentUserId;
    if (!userId) {
      const storedId = localStorage.getItem('user_id');
      if (storedId) {
        iamStore.currentUserId = Number(storedId);
        userId = Number(storedId);
      } else {
        throw new Error("Sesión no válida. Por favor, inicia sesión de nuevo.");
      }
    }

    if (iamStore.users.length === 0) await iamStore.fetchUsers();
    currentUser.value = iamStore.users.find(u => u.id === userId);

    if (!currentUser.value) {
      if(iamStore.currentUsername) {
        currentUser.value = { id: userId, username: iamStore.currentUsername };
      } else {
        throw new Error("No se pudo cargar la información del usuario.");
      }
    }

    // 2. Cargar Datos usando STORES (Paralelo)
    await Promise.all([
      bookingStore.fetchAllBookings(),
      roomStore.fetchAllRooms()
    ]);

    const allBookings = bookingStore.bookings;
    const allRooms = roomStore.rooms;

    // 3. Filtrar Reservas del Usuario
    const userBookings = allBookings.filter(b => {
      const guestEmail = (b.guestEmail || '').toLowerCase();
      const userEmail = (currentUser.value.username || '').toLowerCase();
      return guestEmail === userEmail;
    });

    upcomingBookings.value = userBookings.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));

    // Stats
    let totalNights = 0;
    userBookings.forEach(b => {
      if(b.status !== 'Cancelled') {
        const start = new Date(b.checkInDate);
        const end = new Date(b.checkOutDate);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalNights += diff > 0 ? diff : 0;
      }
    });
    stats.value.nights = totalNights;

    // 4. Recomendaciones
    const bookedRoomIds = new Set(userBookings.map(b => b.roomId));
    recommendations.value = allRooms
        .filter(r => !bookedRoomIds.has(r.id))
        .slice(0, 5);

    stats.value.upcoming = upcomingBookings.value.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;

  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    if (err.message.includes("Sesión no válida")) {
      logout();
      return;
    }
    toast.add({ severity: "error", summary: "Error", detail: "No pudimos cargar toda tu información." });
  } finally {
    loading.value = false;
  }
}

// --- Navigation & Actions ---

function goToRooms() { router.push({ name: 'guest-rooms' }); }
function goToHotels() { router.push({ name: 'guest-hotels' }); }
function goToBookings() { router.push({ name: 'guest-bookings' }); }
function goToRoom(roomId) { router.push({ name: 'guest-room-detail', params: { roomId } }); }
function logout() {
  iamStore.signOut();
  router.push({ name: 'login' });
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function translateBookingStatus(status) {
  const map = {
    'Pending': t('bookings.statusPending'),
    'Confirmed': t('bookings.statusConfirmed'),
    'Cancelled': t('bookings.statusCancelled')
  };
  return map[status] || status;
}

function getStatusSeverity(status) {
  if (status === 'Confirmed') return 'success';
  if (status === 'Cancelled') return 'danger';
  if (status === 'Pending') return 'warning';
  return 'info';
}

function canCancel(booking) {
  return booking.status === 'Pending' || booking.status === 'Confirmed';
}

async function cancelBooking(booking) {
  try {
    await bookingStore.cancelBooking(booking.id);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('bookings.bookingCancelled') });
    loadDashboard();
  } catch (e) {
    toast.add({ severity: 'error', summary: t('errors.occurred'), detail: 'No se pudo cancelar' });
  }
}

function openBooking(booking) {
  router.push({ name: 'guest-booking-detail', params: { bookingId: booking.id } });
}

function requestService() {
  toast.add({ severity: 'info', summary: 'Hoteles', detail: 'Explora nuestros hoteles asociados.' });
  goToHotels();
}

function contactSupport() {
  toast.add({ severity: 'success', summary: 'WhatsApp', detail: 'Abriendo chat de soporte...' });
}

onMounted(() => {
  // Cargar idioma guardado
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    locale.value = savedLanguage;
  }

  loadDashboard();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Adaptive Toolbar */
.adaptive-toolbar {
  background-color: #ffffff;
  color: #1e293b;
  transition: background-color 0.3s, border-color 0.3s;
}

.app-title { color: #111827; }
.nav-btn { color: #4b5563 !important; }
.nav-btn:hover { background-color: #f3f4f6 !important; }
.user-name { color: #374151; }

/* Language Button */
.language-btn {
  color: #4b5563 !important;
  font-weight: 600;
}

.language-btn:hover {
  background-color: #f3f4f6 !important;
}

/* Profile Menu Styles */
.profile-menu-wrapper {
  position: relative;
}

.profile-avatar-btn {
  font-family: inherit;
  font-size: inherit;
}

.profile-avatar-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-color);
}

.profile-dropdown {
  animation: dropdownSlide 0.2s ease-out;
}

.profile-menu-item {
  font-family: inherit;
  font-size: 0.95rem;
}

.profile-menu-item:focus {
  outline: none;
}

/* Dropdown Animation */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-color-scheme: dark) {
  .adaptive-toolbar {
    background-color: #18181b;
    border-bottom: 1px solid #27272a;
  }
  .app-title { color: #f4f4f5; }
  .nav-btn { color: #a1a1aa !important; }
  .nav-btn:hover { background-color: rgba(255, 255, 255, 0.05) !important; }
  .user-name { color: #e4e4e7; }
  .language-btn { color: #a1a1aa !important; }

  .profile-dropdown {
    background-color: #27272a;
  }

  .profile-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
}

.transition-duration-300 { transition-duration: 300ms; }
.hover\:shadow-4:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
</style>