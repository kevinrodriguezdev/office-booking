<script setup>
import { ref } from 'vue'
import MapEditor from './components/MapEditor.vue'
import BookingMap from './components/BookingMap.vue'

const mode = ref('book') // 'edit' or 'book'
</script>

<template>
  <div class="h-screen flex flex-col font-sans text-gray-900">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
          O
        </div>
        <h1 class="text-lg font-bold tracking-tight">OfficeMap</h1>
      </div>
      
      <div class="flex bg-gray-100 p-1 rounded-lg">
        <button 
          @click="mode = 'book'"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="mode === 'book' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          Book Desk
        </button>
        <button 
          @click="mode = 'edit'"
          class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
          :class="mode === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >
          Edit Layout
        </button>
      </div>
      
      <div class="w-8"></div> <!-- Spacer for balance -->
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <BookingMap v-if="mode === 'book'" />
      <MapEditor v-else />
    </main>
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  overflow: hidden; /* Prevent body scroll */
}
</style>
