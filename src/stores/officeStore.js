import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useOfficeStore = defineStore('office', {
    state: () => ({
        resources: useStorage('office-resources', []), // Replaces 'desks'
        bookings: useStorage('office-bookings', []),   // New: separated bookings
        currentUser: 'User-' + Math.floor(Math.random() * 1000),
    }),
    actions: {
        addResource(type, x, y, width = 60, height = 60) {
            const nameMap = {
                'desk': 'Mesa',
                'room': 'Sala',
                'workspace': 'Área'
            }
            this.resources.push({
                id: Date.now(),
                type,
                x,
                y,
                width,
                height,
                rotation: 0,
                name: `${nameMap[type] || 'Recurso'} ${this.resources.length + 1}`
            })
        },
        updateResource(id, updates) {
            const index = this.resources.findIndex(r => r.id === id)
            if (index !== -1) {
                this.resources[index] = { ...this.resources[index], ...updates }
            }
        },
        deleteResource(id) {
            this.resources = this.resources.filter(r => r.id !== id)
            // Cleanup bookings for this resource
            this.bookings = this.bookings.filter(b => b.resourceId !== id)
        },

        // Booking Logic
        createBooking(resourceId, date, startHour, endHour, userName) {
            const newBooking = {
                id: Date.now(),
                resourceId,
                date,      // Format: 'YYYY-MM-DD'
                startHour, // Format: 0-23
                endHour,   // Format: 0-23
                userId: this.currentUser,
                userName: userName || this.currentUser
            }
            this.bookings.push(newBooking)
        },
        cancelBooking(bookingId) {
            this.bookings = this.bookings.filter(b => b.id !== bookingId)
        },

        // Call this to see if a resource is free at a specific time
        isResourceAvailable(resourceId, date, startHour, endHour) {
            return !this.bookings.some(b =>
                b.resourceId === resourceId &&
                b.date === date &&
                // Check simple overlap: (StartA < EndB) and (EndA > StartB)
                (startHour < b.endHour && endHour > b.startHour)
            )
        },

        getBookingsForResource(resourceId, date) {
            return this.bookings.filter(b => b.resourceId === resourceId && b.date === date)
        }
    }
})
