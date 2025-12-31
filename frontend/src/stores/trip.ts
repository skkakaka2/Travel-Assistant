import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tripApi } from '@/api'
import type { Trip, CreateTripDto, UpdateTripDto, PaginationQuery } from '@/types/api'

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const total = ref(0)
  const loading = ref(false)

  async function fetchTrips(params?: PaginationQuery) {
    loading.value = true
    try {
      const response = await tripApi.getAll(params)
      const data = response.data.data
      trips.value = data.list
      total.value = data.pagination.total
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchTrip(id: number) {
    loading.value = true
    try {
      const response = await tripApi.getById(id)
      currentTrip.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createTrip(data: CreateTripDto) {
    const response = await tripApi.create(data)
    const newTrip = response.data.data
    trips.value.unshift(newTrip)
    return newTrip
  }

  async function updateTrip(id: number, data: UpdateTripDto) {
    const response = await tripApi.update(id, data)
    const updatedTrip = response.data.data
    const index = trips.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      trips.value[index] = updatedTrip
    }
    if (currentTrip.value?.id === id) {
      currentTrip.value = updatedTrip
    }
    return updatedTrip
  }

  async function deleteTrip(id: number) {
    await tripApi.delete(id)
    trips.value = trips.value.filter((t) => t.id !== id)
    if (currentTrip.value?.id === id) {
      currentTrip.value = null
    }
  }

  return {
    trips,
    currentTrip,
    total,
    loading,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
  }
})

