<template>
    <div class="space-y-8">
      <!-- Distribución de Emociones -->
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-sage-800">Distribución de Emociones</h3>
            <select 
              v-model="emotionTimeFilter" 
              @change="updateEmotionChart"
              class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Todo el Tiempo</option>
              <option value="month">Este Mes</option>
              <option value="week">Esta Semana</option>
            </select>
          </div>
          
          <div v-if="isLoading" class="animate-pulse">
            <div class="w-40 h-40 bg-sage-200 rounded-full mx-auto mb-6"></div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="i in 6" :key="i" class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-sage-200 rounded-full"></div>
                <div class="h-4 bg-sage-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
          
          <div v-else>
            <div class="flex flex-row items-center space-x-8">
              <!-- Pie Chart -->
              <div class="flex-1 flex justify-center">
                <div class="w-48 h-48 rounded-full relative overflow-hidden" style="background: conic-gradient(from 0deg, var(--gradient))" :style="pieChartGradient">
                  <!-- Center circle -->
                  <div class="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-sage-800">{{ totalEmotionCount }}</div>
                      <div class="text-xs text-sage-600">emociones</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Legend -->
              <div class="flex-1 max-w-sm">
                <div class="grid grid-cols-1 gap-3">
                  <div v-for="emotion in emotionChartData" :key="emotion.label" class="flex items-center space-x-3">
                    <div 
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      :style="`background-color: ${getDashboardEmotionColor(emotion.label)}`"
                    ></div>
                    <div class="flex-1">
                      <div class="font-medium text-sage-800 text-sm">{{ translateEmotion(emotion.label) }}</div>
                      <div class="text-xs text-sage-600">{{ emotion.percentage.toFixed(1) }}% ({{ emotion.count }})</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
      <!-- Análisis de Desencadenantes -->
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-sage-800">Análisis de Desencadenantes</h3>
          <div class="flex items-center space-x-4">
            <select 
              v-model="triggerTimeFilter" 
              @change="updateTriggerAnalysis"
              class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Todo el Tiempo</option>
              <option value="month">Este Mes</option>
              <option value="week">Esta Semana</option>
            </select>
            <select 
              v-model="triggerEmotionFilter" 
              @change="updateTriggerAnalysis"
              class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Todas las Emociones</option>
              <option value="joy">Alegría</option>
              <option value="sadness">Tristeza</option>
              <option value="anger">Enojo</option>
              <option value="fear">Miedo</option>
              <option value="surprise">Sorpresa</option>
              <option value="disgust">Disgusto</option>
            </select>
          </div>
        </div>
        <div v-if="filteredTriggers.length === 0" class="text-center text-sage-600 py-8">
          <Icon name="lucide:search-x" class="w-12 h-12 mx-auto mb-2" />
          <p>No hay desencadenantes que coincidan con los filtros seleccionados</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="(trigger, index) in filteredTriggers.slice(0, 3)" :key="trigger.name" class="p-6 bg-sage-50 rounded-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-3">
                  <Icon :name="getTriggerIcon(trigger.originalType)" class="w-6 h-6 text-sage-600" />
                  <div class="w-8 h-8 bg-gradient-to-r from-sage-500 to-lavender-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                </div>
                <span class="font-semibold text-sage-800 text-lg">{{ trigger.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-sage-800">{{ trigger.percentage.toFixed(1) }}%</div>
              </div>
            </div>
            <div class="w-full bg-sage-200 rounded-full h-4 mb-2">
              <div 
                class="bg-gradient-to-r from-sage-500 to-lavender-500 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                :style="`width: ${Math.max(trigger.percentage, 10)}%`"
              >
                <span class="text-xs text-white font-medium">{{ trigger.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { entries, isLoading, fetchEntries } = useMoodEntries()
  const { getEmotionColor, translateEmotion } = useEmotionAnalysis()
  const { triggerTypes } = useTriggerAnalysis()
  
  // Load entries on mount
  onMounted(async () => {
    await fetchEntries(100) // Get more entries for analytics
  })
  
  // Reactive filters
  const emotionTimeFilter = ref('all')
  const triggerTimeFilter = ref('all')
  const triggerEmotionFilter = ref('all')
  
  // Time filter options
  const timeFilterOptions = [
    { value: 'all', label: 'Todo el Tiempo' },
    { value: 'month', label: 'Este Mes' },
    { value: 'week', label: 'Esta Semana' }
  ]
  
  // Emotion filter options
  const emotionFilterOptions = [
    { value: 'all', label: 'Todas las Emociones' },
    { value: 'joy', label: 'Alegría' },
    { value: 'sadness', label: 'Tristeza' },
    { value: 'anger', label: 'Enojo' },
    { value: 'fear', label: 'Miedo' },
    { value: 'disgust', label: 'Disgusto' },
    { value: 'surprise', label: 'Sorpresa' }
  ]
  
  // Dashboard emotion colors (same as index.vue)
  const getDashboardEmotionColor = (emotion) => {
    const colorMap = {
      'joy': '#34d399',      // emerald-400
      'sadness': '#60a5fa',  // blue-400
      'anger': '#f87171',    // red-400
      'fear': '#fb923c',     // orange-400
      'surprise': '#a78bfa', // purple-400
      'disgust': '#facc15'   // yellow-400
    }
    return colorMap[emotion] || '#9ca3af' // gray-400 as fallback
  }

  // Helper function to process all emotions (same logic as dashboard)
  const processAllEmotions = (entries) => {
    console.log('Processing all emotions from entries:', entries.length)
    
    const emotionCounts = {}
    const allEmotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust']
    
    // Initialize all emotions with 0 values
    allEmotions.forEach(emotion => {
      emotionCounts[emotion] = { count: 0, total: 0 }
    })
    
    entries.forEach(entry => {
      [entry.emocion1, entry.emocion2, entry.emocion3].forEach(emotion => {
        if (emotion?.label && emotion.label !== 'other') {
          const key = emotion.label.toLowerCase()
          if (emotionCounts[key]) {
            emotionCounts[key].count++
            emotionCounts[key].total += emotion.score || 0
          }
        }
      })
    })
    
    console.log('Final emotion counts:', emotionCounts)
    
    return allEmotions.map(emotion => ({
      label: emotion,
      count: emotionCounts[emotion].count,
      percentage: emotionCounts[emotion].count > 0 ? 
        Math.round((emotionCounts[emotion].total / emotionCounts[emotion].count) * 100) : 0
    }))
  }
  
  // Helper function to get trigger icon based on trigger type
  const getTriggerIcon = (triggerType) => {
    const iconMap = {
      'relaciones': 'lucide:users',
      'salud mental': 'lucide:brain',
      'salud fisica': 'lucide:heart',
      'trabajo': 'lucide:briefcase',
      'finanzas': 'lucide:dollar-sign',
      'espiritualidad': 'lucide:sparkles',
      'tiempo libre': 'lucide:gamepad-2',
      'entorno': 'lucide:home',
      'identidad': 'lucide:user',
      'amor propio': 'lucide:heart-handshake'
    }
    return iconMap[triggerType] || 'lucide:circle'
  }
  
  // Helper function to filter entries by time (same logic as history page)
  const filterEntriesByTime = (entries, timeFilter) => {
    if (timeFilter === 'all') return entries
    
    const now = new Date()
    const startDate = new Date()
    
    if (timeFilter === 'week') {
      // Esta semana: desde el lunes actual
      const daysSinceMonday = (startDate.getDay() + 6) % 7
      startDate.setDate(startDate.getDate() - daysSinceMonday)
      startDate.setHours(0, 0, 0, 0)
    } else if (timeFilter === 'month') {
      // Este mes: desde el día 1
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
    }
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      return entryDate >= startDate && entryDate <= now
    })
  }
  
  // Helper function to extract emotions from entries (same logic as dashboard)
  const extractEmotionsFromEntries = (entries) => {
    console.log('Extracting emotions from entries:', entries.length)
    
    // Process all emotions using the same logic as dashboard
    const emotionData = processAllEmotions(entries)
    
    // Calculate total percentage for normalization
    const totalPercentage = emotionData.reduce((sum, emotion) => sum + emotion.percentage, 0)
    
    // If we have data, normalize percentages to sum to 100%
    if (totalPercentage > 0) {
      emotionData.forEach(emotion => {
        emotion.percentage = (emotion.percentage / totalPercentage) * 100
      })
    } else {
      // If no data, distribute equally among all emotions
      emotionData.forEach(emotion => {
        emotion.percentage = 100 / emotionData.length
      })
    }
    
    console.log('Final normalized chart data:', emotionData)
    return emotionData.sort((a, b) => b.percentage - a.percentage)
  }
  
  // Helper function to map Spanish emotions to English keys
  const mapSpanishToEnglish = (spanishEmotion) => {
    const mapping = {
      'Feliz': 'joy',
      'Alegre': 'joy',
      'Energizado': 'joy',
      'Triste': 'sadness',
      'Melancólico': 'sadness',
      'Enojado': 'anger',
      'Frustrado': 'anger',
      'Estresado': 'anger',
      'Ansioso': 'fear',
      'Nervioso': 'fear',
      'Preocupado': 'fear',
      'Sorprendido': 'surprise',
      'Asombrado': 'surprise',
      'Disgustado': 'disgust',
      'Molesto': 'disgust',
      'Tranquilo': 'joy',
      'Pacífico': 'joy',
      'Centrado': 'joy',
      'Cansado': 'sadness',
      'Social': 'joy'
    }
    return mapping[spanishEmotion] || null
  }
  
  // Computed property for emotion chart data
  const emotionChartData = computed(() => {
    if (!entries.value || entries.value.length === 0) return []
    const filteredEntries = filterEntriesByTime(entries.value, emotionTimeFilter.value)
    return extractEmotionsFromEntries(filteredEntries)
  })
  
  // Computed property for total emotion count
  const totalEmotionCount = computed(() => {
    return emotionChartData.value.reduce((sum, emotion) => sum + emotion.count, 0)
  })
  
  // Computed property for pie chart gradient
  const pieChartGradient = computed(() => {
    if (!emotionChartData.value || emotionChartData.value.length === 0) return {}
    
    const gradientStops = []
    let currentAngle = 0
    
    emotionChartData.value.forEach((emotion, index) => {
      const percentage = emotion.percentage
      const color = getDashboardEmotionColor(emotion.label) // Use dashboard colors
      const endAngle = currentAngle + (percentage * 3.6) // Convert percentage to degrees
      
      if (index === 0) {
        gradientStops.push(`${color} 0deg`)
      }
      gradientStops.push(`${color} ${currentAngle}deg`)
      gradientStops.push(`${color} ${endAngle}deg`)
      
      currentAngle = endAngle
    })
    
    return {
      '--gradient': gradientStops.join(', ')
    }
  })
  
  // Computed property for total trigger entries (for percentage calculation)
  const totalTriggerEntries = computed(() => {
    if (!entries.value || entries.value.length === 0) return 0
    let filteredEntries = filterEntriesByTime(entries.value, triggerTimeFilter.value)
    
    // Filter by emotion if not "all"
    if (triggerEmotionFilter.value !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        const significantEmotions = getSignificantEmotions(entry)
        return significantEmotions.includes(triggerEmotionFilter.value)
      })
    }
    
    return filteredEntries.length
  })
  
  // Computed property for filtered triggers
  const filteredTriggers = computed(() => {
    if (!entries.value || entries.value.length === 0) {
      console.log('No entries available for triggers')
      return []
    }
    
    console.log('Processing triggers from entries:', entries.value.length)
    let filteredEntries = filterEntriesByTime(entries.value, triggerTimeFilter.value)
    console.log('After time filter:', filteredEntries.length)
    
    // Filter by emotion if not "all"
    if (triggerEmotionFilter.value !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        // Check if any of the three emotions matches the filter
        const emotions = [entry.emocion1, entry.emocion2, entry.emocion3]
        return emotions.some(emotion => 
          emotion?.label && emotion.label.toLowerCase() === triggerEmotionFilter.value
        )
      })
      console.log('After emotion filter:', filteredEntries.length)
    }
    
    // Count triggers using trigger_type field
    const triggerCounts = {}
    const triggerTypeMap = {}
    filteredEntries.forEach(entry => {
      console.log('Entry trigger_type:', entry.trigger_type, 'trigger:', entry.trigger)
      if (entry.trigger_type) {
        // Use triggerTypes mapping to get display name
        const triggerName = triggerTypes[entry.trigger_type] || entry.trigger_type
        triggerCounts[triggerName] = (triggerCounts[triggerName] || 0) + 1
        triggerTypeMap[triggerName] = entry.trigger_type // Keep original type for icon mapping
      }
    })
    
    console.log('Trigger counts:', triggerCounts)
    
    // Convert to array with real percentages based on total entries
    const totalEntries = filteredEntries.length
    const result = Object.entries(triggerCounts)
      .map(([name, count]) => ({
        name,
        count,
        originalType: triggerTypeMap[name],
        percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // Show top 3 triggers
    
    console.log('Final trigger data:', result)
    return result
  })
  
  // Methods to update charts
  const updateEmotionChart = () => {
    // Chart will update automatically via computed property
    console.log('Updating emotion chart for:', emotionTimeFilter.value)
  }
  
  const updateTriggerAnalysis = () => {
    // Analysis will update automatically via computed property
    console.log('Updating trigger analysis for:', triggerTimeFilter.value, triggerEmotionFilter.value)
  }
  </script>