<script setup>
import { ref, computed } from 'vue'
import { useOfficeStore } from '../stores/officeStore'
import ResourceItem from './ResourceItem.vue'
import { useNow, useDateFormat } from '@vueuse/core'

const store = useOfficeStore()

// Date & Time Selection
const selectedDate = ref(useDateFormat(useNow(), 'YYYY-MM-DD').value)
const startHour = ref(9)
const endHour = ref(17)

// Booking Modal Logic
const showModal = ref(false)
const selectedResource = ref(null)
const bookingName = ref('')

const hours = Array.from({ length: 24 }, (_, i) => i)

// Availability Logic
const getResourceStatus = (resource) => {
  // Check if booked in the selected time range
  const isAvailable = store.isResourceAvailable(resource.id, selectedDate.value, startHour.value, endHour.value)
  if (isAvailable) return 'available'
  
  // Check if it's MY booking
  const bookings = store.getBookingsForResource(resource.id, selectedDate.value)
  const myBooking = bookings.find(b => b.userId === store.currentUser)
  if (myBooking) return 'booked' // We might want a 'mine' status, handled by isMyBooking prop
  
  return 'booked'
}

const getBookedBy = (resource) => {
    // Return name of first collision booking for simplicity
    const bookings = store.getBookingsForResource(resource.id, selectedDate.value)
    // Find overlapping booking
    const overlap = bookings.find(b => 
        (startHour.value < b.endHour && endHour.value > b.startHour)
    )
    return overlap ? overlap.userName : null
}

const isMyBooking = (resource) => {
    const bookings = store.getBookingsForResource(resource.id, selectedDate.value)
    const overlap = bookings.find(b => 
        (startHour.value < b.endHour && endHour.value > b.startHour)
    )
    return overlap && overlap.userId === store.currentUser
}

const handleResourceClick = (resource) => {
  if (getResourceStatus(resource) === 'available') {
    selectedResource.value = resource
    bookingName.value = '' // Reset name
    showModal.value = true
  } else if (isMyBooking(resource)) {
     // Optional: Click to cancel?
     if (confirm('¿Cancelar esta reserva?')) {
         const bookings = store.getBookingsForResource(resource.id, selectedDate.value)
         const myBooking = bookings.find(b => b.userId === store.currentUser && (startHour.value < b.endHour && endHour.value > b.startHour))
         if (myBooking) store.cancelBooking(myBooking.id)
     }
  }
}

const confirmBooking = () => {
  if (!selectedResource.value) return
  
  store.createBooking(
      selectedResource.value.id, 
      selectedDate.value, 
      startHour.value, 
      endHour.value, 
      bookingName.value
  )
  showModal.value = false
  selectedResource.value = null
}
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Filters Bar -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap gap-6 items-end shadow-sm z-20">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Fecha</label>
        <input 
          type="date" 
          v-model="selectedDate"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>
      
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">Hora</label>
        <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
            <select v-model="startHour" class="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
                <option v-for="h in hours" :key="h" :value="h">{{ h }}:00</option>
            </select>
            <span class="text-gray-400">a</span>
            <select v-model="endHour" class="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
                <option v-for="h in hours" :key="h" :value="h">{{ h }}:00</option>
            </select>
        </div>
      </div>
      
      <div class="ml-auto flex items-center gap-4 text-sm">
          <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Disponible</span>
          </div>
          <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span>Reservado</span>
          </div>
          <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Tuyo</span>
          </div>
      </div>
    </div>

    <!-- Map Area -->
    <div class="flex-1 relative overflow-hidden bg-white">
      <ResourceItem
        v-for="res in store.resources"
        :key="res.id"
        :resource="res"
        :editable="false"
        :status="getResourceStatus(res)"
        :bookedBy="getBookedBy(res)"
        :isMyBooking="isMyBooking(res)"
        @toggle-booking="() => handleResourceClick(res)"
      />
      
      <!-- Empty State -->
      <div v-if="store.resources.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
          No hay recursos definidos. Ve a "Editar Mapa" para agregar algunos.
      </div>
    </div>
    
    <!-- Booking Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div class="bg-indigo-600 px-6 py-4">
                <h3 class="text-white font-bold text-lg">Confirmar Reserva</h3>
                <p class="text-indigo-100 text-sm">Estás reservando {{ selectedResource.name }}</p>
            </div>
            
            <div class="p-6 space-y-4">
                <div class="flex justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <span>{{ selectedDate }}</span>
                    <span class="font-bold">{{ startHour }}:00 - {{ endHour }}:00</span>
                </div>
                
                <div class="space-y-1">
                    <label class="block text-sm font-medium text-gray-700">Reservado Por (Nombre)</label>
                    <input 
                        v-model="bookingName" 
                        type="text" 
                        placeholder="Ingresa tu nombre" 
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        @keyup.enter="confirmBooking"
                    />
                </div>
                
                <div class="flex gap-3 pt-2">
                    <button @click="showModal = false" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button @click="confirmBooking" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-sm transition-colors">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

