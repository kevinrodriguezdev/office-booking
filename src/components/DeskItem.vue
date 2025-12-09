<script setup>
import { computed } from 'vue'

const props = defineProps({
  desk: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-drag', 'toggle-booking', 'delete'])

const deskColor = computed(() => {
  if (props.desk.status === 'booked') {
    return props.desk.bookedBy === 'Me' ? 'bg-blue-500' : 'bg-red-500'
  }
  return 'bg-green-500'
})

const onMouseDown = (e) => {
  if (props.editable) {
    emit('start-drag', e, props.desk)
  } else {
    emit('toggle-booking', props.desk.id)
  }
}
</script>

<template>
  <div
    class="absolute w-16 h-12 rounded-lg shadow-md flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-105 select-none"
    :class="[
      desk.status === 'booked' 
        ? (desk.bookedBy === 'Me' ? 'bg-blue-500 ring-2 ring-blue-300' : 'bg-red-500') 
        : 'bg-emerald-500 hover:bg-emerald-400',
      editable ? 'cursor-move' : 'cursor-pointer'
    ]"
    :style="{
      left: `${desk.x}px`,
      top: `${desk.y}px`,
      transform: `rotate(${desk.rotation}deg)`
    }"
    @mousedown="onMouseDown"
  >
    <div class="flex flex-col items-center">
        <span class="text-xs">Desk</span>
        <span v-if="desk.status === 'booked'" class="text-[8px] opacity-80">Booked</span>
    </div>
    
    <button 
        v-if="editable" 
        @click.stop="emit('delete', desk.id)"
        class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:bg-red-700"
    >
        ×
    </button>
  </div>
</template>
