<script setup>
import { useOfficeStore } from '../stores/officeStore'
import DeskItem from './DeskItem.vue'

const store = useOfficeStore()

const handleBooking = (id) => {
  store.toggleBooking(id)
}
</script>

<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 z-10 shadow-sm">
      <h2 class="text-xl font-bold text-gray-800">Book a Desk</h2>
      <p class="text-sm text-gray-500">Click on an available desk (green) to book it.</p>
      
      <div class="flex flex-col gap-2 mt-4">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-emerald-500 rounded"></div>
          <span class="text-sm text-gray-600">Available</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-red-500 rounded"></div>
          <span class="text-sm text-gray-600">Booked</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm text-gray-600">Your Booking</span>
        </div>
      </div>
    </div>

    <!-- Map Area -->
    <div class="flex-1 bg-gray-50 relative overflow-hidden">
      <DeskItem
        v-for="desk in store.desks"
        :key="desk.id"
        :desk="desk"
        :editable="false"
        @toggle-booking="handleBooking"
      />
    </div>
  </div>
</template>
