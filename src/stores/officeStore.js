import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useOfficeStore = defineStore('office', {
    state: () => ({
        desks: useStorage('office-desks', []), // Persist desks in localStorage
        currentUser: 'User-' + Math.floor(Math.random() * 1000), // Simple random user ID
    }),
    actions: {
        addDesk(x, y) {
            this.desks.push({
                id: Date.now(),
                x,
                y,
                rotation: 0,
                status: 'available', // available, booked
                bookedBy: null,
            })
        },
        updateDeskPosition(id, x, y) {
            const desk = this.desks.find(d => d.id === id)
            if (desk) {
                desk.x = x
                desk.y = y
            }
        },
        toggleBooking(id) {
            const desk = this.desks.find(d => d.id === id)
            if (!desk) return

            if (desk.status === 'available') {
                desk.status = 'booked'
                desk.bookedBy = this.currentUser
            } else if (desk.status === 'booked' && desk.bookedBy === this.currentUser) {
                desk.status = 'available'
                desk.bookedBy = null
            }
        },
        deleteDesk(id) {
            this.desks = this.desks.filter(d => d.id !== id)
        }
    }
})
