<template>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select v-model="selectedTimeFilter" @change="applyFilters" class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent">
            <option value="all">Todo el Tiempo</option>
            <option value="month">Este Mes</option>
            <option value="week">Esta Semana</option>
          </select>
          <select v-model="selectedEmotionFilter" @change="applyFilters" class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent">
            <option value="all">Todas las Emociones</option>
            <option value="joy">Alegría</option>
            <option value="sadness">Tristeza</option>
            <option value="anger">Enojo</option>
            <option value="fear">Miedo</option>
            <option value="surprise">Sorpresa</option>
            <option value="disgust">Disgusto</option>
          </select>
        </div>
        <button @click="clearFilters" class="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
  
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200">
        <div class="p-6 border-b border-sage-200">
          <h3 class="text-lg font-semibold text-sage-800">Historial de Entradas</h3>
        </div>
        <div class="divide-y divide-sage-100">
          <div v-if="isLoading" class="p-6 flex justify-center">
            <div class="animate-pulse flex space-x-4">
              <div class="rounded-full bg-sage-200 h-10 w-10"></div>
              <div class="flex-1 space-y-4 py-1">
                <div class="h-4 bg-sage-200 rounded w-3/4"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-sage-200 rounded"></div>
                  <div class="h-4 bg-sage-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="entries.length === 0" class="p-6 text-center text-sage-600">
            No hay entradas registradas aún.
          </div>
          <div v-else-if="filteredEntries.length === 0" class="p-6 text-center text-sage-600">
            No hay entradas que coincidan con los filtros seleccionados.
          </div>
          <div v-for="entry in filteredEntries" :key="entry.id" class="p-6 hover:bg-sage-50 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div :class="`w-3 h-3 rounded-full ${getMoodColor(entry.emocion1.label)}`"></div>
                <div>
                  <span class="font-medium text-sage-800">{{ formatDateTime(entry.timestamp_date).date }}</span>
                  <span class="text-sage-600 ml-2">{{ formatDateTime(entry.timestamp_date).time }}</span>
                </div>
              </div>
              <div class="flex space-x-1">
                <span class="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full">
                  {{ entry.emocion1.translated || entry.emocion1.label }}
                </span>
                <span class="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full">
                  {{ entry.emocion2.translated || entry.emocion2.label }}
                </span>
                <span class="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full">
                  {{ entry.emocion3.translated || entry.emocion3.label }}
                </span>
              </div>
            </div>
            <p class="text-sage-700 mb-2">{{ entry.trigger }}</p>
            <div class="flex items-center justify-between text-sm text-sage-600">
              <span>Nivel de energía: {{ entry.level }}/10</span>
              <span v-if="entry.advice_generated_at" class="text-sage-500">Consejo disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { entries, isLoading, fetchEntries } = useMoodEntries()

  // Estados para los filtros
  const selectedTimeFilter = ref('all')
  const selectedEmotionFilter = ref('all')
  const filteredEntries = ref([])

  // Cargar entradas al iniciar la página
  onMounted(async () => {
    await fetchEntries(20) // Obtener hasta 20 entradas
    applyFilters() // Aplicar filtros iniciales
  })

  // Observar cambios en las entradas para reaplicar filtros
  watch(entries, () => {
    applyFilters()
  }, { deep: true })

  // Función para formatear fecha y hora desde timestamp
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    if (!entries.value) {
      filteredEntries.value = []
      return
    }

    let filtered = [...entries.value]

    // Filtrar por tiempo
    if (selectedTimeFilter.value !== 'all') {
      const now = new Date()
      const startDate = new Date()
      
      if (selectedTimeFilter.value === 'week') {
        // Esta semana: desde el lunes actual
        const daysSinceMonday = (startDate.getDay() + 6) % 7
        startDate.setDate(startDate.getDate() - daysSinceMonday)
        startDate.setHours(0, 0, 0, 0)
      } else if (selectedTimeFilter.value === 'month') {
        // Este mes: desde el día 1
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
      }
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp_date)
        return entryDate >= startDate && entryDate <= now
      })
    }

    // Filtrar por emoción
    if (selectedEmotionFilter.value !== 'all') {
      filtered = filtered.filter(entry => {
        const emotions = [
          entry.emocion1?.label?.toLowerCase(),
          entry.emocion2?.label?.toLowerCase(),
          entry.emocion3?.label?.toLowerCase()
        ]
        return emotions.includes(selectedEmotionFilter.value)
      })
    }

    filteredEntries.value = filtered
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    selectedTimeFilter.value = 'all'
    selectedEmotionFilter.value = 'all'
    applyFilters()
  }

  // Función para determinar el color según la emoción principal
  const getMoodColor = (emotion) => {
    const emotionColors = {
      'joy': 'bg-emerald-400',
      'happiness': 'bg-emerald-400',
      'contentment': 'bg-sage-400',
      'calm': 'bg-sage-400',
      'sadness': 'bg-blue-400',
      'anxiety': 'bg-orange-400',
      'fear': 'bg-orange-400',
      'anger': 'bg-red-400',
      'surprise': 'bg-purple-400',
      'disgust': 'bg-yellow-400'
    }
    
    return emotionColors[emotion?.toLowerCase()] || 'bg-gray-400'
  }
</script>