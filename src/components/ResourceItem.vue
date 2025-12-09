<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  // 'available', 'booked', 'selected' (for editor)
  status: {
    type: String,
    default: 'available' 
  },
  bookedBy: {
    type: String,
    default: null
  },
  isMyBooking: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-drag', 'toggle-booking', 'delete', 'resize', 'rotate'])

// Visual styles based on type
const typeStyles = computed(() => {
  switch (props.resource.type) {
    case 'room':
      return 'border-2 border-gray-600 bg-white rounded-sm'
    case 'workspace':
      return 'border-2 border-dashed border-gray-400 bg-gray-50 rounded-lg'
    case 'desk':
    default:
      return 'rounded-lg shadow-md'
  }
})

// Color based on status (overrides usage only for Desks usually, but good for all)
const statusColor = computed(() => {
  if (props.resource.type === 'room' && props.status === 'available') return 'bg-white'
  
  if (props.status === 'booked') {
    return props.isMyBooking ? 'bg-blue-500 border-blue-600 text-white' : 'bg-red-500 border-red-600 text-white'
  }
  // Available
  return props.resource.type === 'desk' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800'
})

const onMouseDown = (e) => {
  if (props.editable) {
    emit('start-drag', e, props.resource)
  } else {
    emit('toggle-booking', props.resource.id)
  }
}

// Resizing logic implies we need handles
// We will only implement simple bottom-right resizing for MVP
// Or maybe all corners if we want to be fancy. Let's do Bottom-Right for simplicity first.
</script>

<template>
  <div
    class="absolute flex flex-col items-center justify-center transition-transform select-none"
    :class="[
      typeStyles,
      statusColor,
      editable ? 'cursor-move' : 'cursor-pointer hover:brightness-95'
    ]"
    :style="{
      left: `${resource.x}px`,
      top: `${resource.y}px`,
      width: `${resource.width}px`,
      height: `${resource.height}px`,
      transform: `rotate(${resource.rotation}deg)`
    }"
    @mousedown.stop="onMouseDown"
  >
    <!-- Content -->
    <div class="flex flex-col items-center justify-center w-full h-full overflow-hidden p-1 text-center leading-tight">
        <span class="text-xs font-bold truncate w-full">{{ resource.name }}</span>
        <span v-if="bookedBy" class="text-[0.6rem] opacity-90 truncate w-full">{{ bookedBy }}</span>
        
        <!-- Icon/Visual for types -->
        <span v-if="resource.type === 'meeting' || resource.type === 'room'" class="text-[0.5rem] opacity-50 mt-1">Room</span>
    </div>
    
    <!-- Delete Button (Editor Mode) -->
    <button 
        v-if="editable" 
        @click.stop="emit('delete', resource.id)"
        class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-700 z-20"
    >
        ×
    </button>

    <!-- Resize Handle (Editor Mode) -->
    <!-- Put it in a slot or just div that stops propagation of drag -->
    <div
        v-if="editable"
        class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-400 opacity-50 hover:opacity-100 rounded-tl"
        @mousedown.stop="(e) => emit('resize', e, resource)"
    ></div>
  </div>
</template>
