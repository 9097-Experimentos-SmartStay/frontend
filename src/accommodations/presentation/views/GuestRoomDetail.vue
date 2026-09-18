<template>
  <div class="p-4 md:p-6 w-full max-w-5xl mx-auto">
    <div class="flex flex-wrap align-items-center gap-3 mb-4">
      <pv-button :label="$t('common.back')" icon="pi pi-arrow-left" class="p-button-outlined p-button-sm" @click="goBack" />
      <span class="text-xl font-bold text-900">{{ $t('roomDetail.title') }}</span>
    </div>

    <div v-if="roomStore.loading" class="flex justify-content-center p-8">
      <pv-progress-spinner />
    </div>

    <div v-else-if="!roomStore.currentRoom" class="surface-card p-6 border-round-xl text-center shadow-1">
      <i class="pi pi-exclamation-circle text-5xl text-gray-300 mb-3"></i>
      <h3>{{ $t('roomDetail.roomNotFound') }}</h3>
      <pv-button
          :label="$t('roomDetail.backToList')"
          class="p-button-outlined mt-3"
          @click="goBack"
      />
    </div>

    <div v-else class="grid">
      <div class="col-12 lg:col-8">
        <div class="surface-card shadow-2 border-round-xl overflow-hidden mb-4">
          <div class="h-20rem bg-gray-200 w-full flex align-items-center justify-content-center">
            <i class="pi pi-image text-6xl text-gray-400"></i>
          </div>
          <div class="p-5">
            <div class="flex justify-content-between align-items-start mb-3">
              <div>
                <h1 class="text-3xl font-bold text-900 m-0 mb-2">
                  {{ roomStore.currentRoom.roomTypeName || $t('roomDetail.defaultRoomName') }}
                </h1>
                <span class="text-600">{{ $t('guestRooms.roomNumber', { number: roomStore.currentRoom.label }) }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-500 block">{{ $t('hotels.pricePerNight') }}</span>
                <span class="text-2xl font-bold text-900">{{ formatMoney(roomStore.currentRoom.price, locale) }}</span>
              </div>
            </div>

            <div class="border-top-1 border-200 my-4"></div>

            <h3 class="text-xl font-bold text-900 mb-3">{{ $t('roomDetail.description') }}</h3>
            <p class="text-700 line-height-3 mb-5">
              {{ roomStore.currentRoom.description || $t('roomDetail.defaultDescription') }}
            </p>

            <h3 class="text-xl font-bold text-900 mb-3">{{ $t('roomDetail.amenities') }}</h3>
            <div class="flex flex-wrap gap-3">
              <div v-if="!roomStore.currentRoom.amenities?.length" class="text-600 font-italic">
                {{ $t('roomDetail.noAmenities') }}
              </div>
              <div
                  v-for="amenity in roomStore.currentRoom.amenities"
                  :key="amenity"
                  class="surface-100 border-round px-3 py-2 flex align-items-center gap-2"
              >
                <i class="pi pi-check-circle text-primary"></i>
                <span class="text-700 font-medium capitalize">{{ amenity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 lg:col-4">
        <div class="surface-card shadow-2 border-round-xl p-4 sticky" style="top: 6rem;">
          <h3 class="text-xl font-bold text-900 mb-4">{{ $t('roomDetail.bookYourStay') }}</h3>

          <div class="bg-blue-50 border-round p-3 mb-4 flex align-items-center gap-3">
            <i class="pi pi-info-circle text-blue-500 text-xl"></i>
            <span class="text-sm text-blue-700">{{ $t('roomDetail.cancellationPolicy') }}</span>
          </div>

          <pv-button
              :label="$t('roomDetail.bookNow')"
              icon="pi pi-calendar-plus"
              class="w-full p-button-lg font-bold mb-3"
              @click="bookRoom"
          />


        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useRoomStore } from '../../application/room.store.js';
import { formatMoney } from '@/shared/presentation/utils/formatters.js';

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();
const roomStore = useRoomStore();
const { locale } = useI18n();

onMounted(() => roomStore.fetchRoomById(Number(props.roomId)));

const goBack = () => {
  router.push({ name: 'guest-rooms' });
};

/** US-51: availability depends on the dates, so booking starts with a search in this room's hotel. */
const bookRoom = () => {
  const room = roomStore.currentRoom;
  router.push({ name: 'guest-create-booking', query: { hotelId: room?.hotelId, roomId: room?.id } });
};
</script>
