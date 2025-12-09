<script setup>
import { ref } from 'vue'
import { useOfficeStore } from '../stores/officeStore'
import ResourceItem from './ResourceItem.vue'

const store = useOfficeStore()
const mapRef = ref(null)

// Selection & Inspection
const selectedId = ref(null)

// Dragging Logic
const draggingId = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

// Resizing Logic
const resizingId = ref(null)
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0 })

const addResource = (type) => {
  // Add to center of visible map area roughly
  // Default sizes: Desk (60x60), Room (150x150), Workspace (100x60)
  let w = 60, h = 60
  if (type === 'room') { w = 150; h = 150 }
  if (type === 'workspace') { w = 120; h = 80 }
  
  store.addResource(type, 100, 100, w, h)
}

const selectResource = (r) => {
  selectedId.value = r.id
}

const startDrag = (event, resource) => {
  selectResource(resource)
  draggingId.value = resource.id
  dragOffset.value = {
    x: event.clientX - resource.x,
    y: event.clientY - resource.y
  }
  
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragUp)
}

const onDragMove = (event) => {
  if (!draggingId.value) return
  
  const x = event.clientX - dragOffset.value.x
  const y = event.clientY - dragOffset.value.y
  
  store.updateResource(draggingId.value, { x, y })
}

const onDragUp = () => {
  draggingId.value = null
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragUp)
}

const startResize = (event, resource) => {
  resizingId.value = resource.id
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    w: resource.width,
    h: resource.height
  }
  
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
}

const onResizeMove = (event) => {
  if (!resizingId.value) return
  
  const dx = event.clientX - resizeStart.value.x
  const dy = event.clientY - resizeStart.value.y
  
  // Snap to 10px? Maybe later.
  const newW = Math.max(30, resizeStart.value.w + dx)
  const newH = Math.max(30, resizeStart.value.h + dy)
  
  store.updateResource(resizingId.value, { width: newW, height: newH })
}

const onResizeUp = () => {
  resizingId.value = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
}
</script>

<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-72 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm relative">
      <div class="p-4 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-800">Editor de Mapa</h2>
          <p class="text-xs text-gray-500 mt-1">Diseña tu espacio de oficina.</p>
      </div>

      <div class="p-4 flex flex-col gap-3">
        <label class="text-xs font-semibold text-gray-400 uppercase">Añadir Recursos</label>
        <div class="grid grid-cols-2 gap-2">
            <button 
                @click="addResource('desk')"
                class="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm group"
            >
                <div class="w-6 h-6 bg-emerald-500 rounded mb-2 group-hover:scale-110 transition-transform"></div>
                <span>Mesa</span>
            </button>
            <button 
                @click="addResource('room')"
                class="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm group"
            >
                <div class="w-6 h-6 border-2 border-gray-600 bg-white rounded-sm mb-2 group-hover:scale-110 transition-transform"></div>
                <span>Sala</span>
            </button>
            <button 
                @click="addResource('workspace')"
                class="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-sm group"
            >
                <div class="w-6 h-6 border-2 border-dashed border-gray-400 bg-gray-50 rounded mb-2 group-hover:scale-110 transition-transform"></div>
                <span>Área</span>
            </button>
        </div>
      </div>
      
      <!-- Properties Panel -->
      <div v-if="selectedId" class="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
         <h3 class="text-sm font-bold mb-3">Propiedades</h3>
         <!-- Use v-model properly with store update? We'll just do simple event based for now or computed -->
         <div class="space-y-3">
             <div class="flex flex-col">
                 <label class="text-xs text-gray-500 mb-1">Rotación (grados)</label>
                 <input 
                    type="range" min="0" max="360" step="15"
                    :value="store.resources.find(r => r.id === selectedId)?.rotation || 0"
                    @input="e => store.updateResource(selectedId, { rotation: parseInt(e.target.value) })"
                    class="w-full"
                 />
             </div>
             <div class="flex flex-col">
                 <label class="text-xs text-gray-500 mb-1">Nombre</label>
                 <input 
                    type="text" 
                    :value="store.resources.find(r => r.id === selectedId)?.name || ''"
                    @input="e => store.updateResource(selectedId, { name: e.target.value })"
                    class="w-full text-sm border border-gray-300 rounded px-2 py-1"
                 />
             </div>
         </div>
         <button @click="store.deleteResource(selectedId); selectedId = null" class="mt-4 w-full bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200">Eliminar Seleccionado</button>
      </div>

      <div v-else class="p-4 mt-auto">
        <div class="bg-blue-50 p-3 rounded text-xs text-blue-800 border border-blue-100">
          <strong>Tip:</strong> Haz clic en un ítem para editarlo. Arrastra la esquina inferior para cambiar tamaño.
        </div>
      </div>
    </div>

    <!-- Canvas Area -->
    <div 
      ref="mapRef"
      class="flex-1 bg-gray-100 relative overflow-hidden bg-grid"
      @mousedown="selectedId = null" 
    >
      <ResourceItem
        v-for="res in store.resources"
        :key="res.id"
        :resource="res"
        :editable="true"
        :class="{ 'ring-2 ring-indigo-500 ring-offset-2': selectedId === res.id }"
        @start-drag="startDrag"
        @resize="startResize"
        @delete="store.deleteResource"
        @mousedown.stop="selectResource(res)"
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
