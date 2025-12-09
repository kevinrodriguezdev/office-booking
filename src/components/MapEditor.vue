<script setup>
import { ref } from 'vue'
import { useOfficeStore } from '../stores/officeStore'
import DeskItem from './DeskItem.vue'

const store = useOfficeStore()
const mapRef = ref(null)
const draggingId = ref(null)
const offset = ref({ x: 0, y: 0 })

const addDesk = () => {
  // Add to center of visible map area roughly
  store.addDesk(100, 100)
}

const startDrag = (event, desk) => {
  draggingId.value = desk.id
  offset.value = {
    x: event.clientX - desk.x,
    y: event.clientY - desk.y
  }
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (event) => {
  if (!draggingId.value) return
  
  const x = event.clientX - offset.value.x
  const y = event.clientY - offset.value.y
  
  store.updateDeskPosition(draggingId.value, x, y)
}

const onMouseUp = () => {
  draggingId.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 z-10 shadow-sm">
      <h2 class="text-xl font-bold text-gray-800">Map Editor</h2>
      <p class="text-sm text-gray-500">Drag desks to arrange your office layout.</p>
      
      <button 
        @click="addDesk"
        class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-sm"
      >
        <span>+ Add Desk</span>
      </button>

      <div class="mt-auto">
        <div class="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100">
          <strong>Tip:</strong> Changes are saved automatically to your browser.
        </div>
      </div>
    </div>

    <!-- Canvas Area -->
    <div 
      ref="mapRef"
      class="flex-1 bg-gray-50 relative overflow-hidden bg-grid"
    >
      <DeskItem
        v-for="desk in store.desks"
        :key="desk.id"
        :desk="desk"
        :editable="true"
        @start-drag="startDrag"
        @delete="store.deleteDesk"
      />
    </div>
  </div>
</template>

<style scoped>
.bg-grid {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
}
</style>
