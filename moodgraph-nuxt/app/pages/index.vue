<template>
    <div class="space-y-8">
      <!-- Quick Entry -->
      <!-- <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <h3 class="text-lg font-semibold text-sage-800 mb-4">¿Cómo te sientes hoy?</h3>
        <div class="flex items-center space-x-4">
          <textarea 
            v-model="quickEntry"
            placeholder="Comparte lo que tienes en mente..."
            class="flex-1 p-4 border border-sage-200 rounded-xl resize-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            rows="3"
          ></textarea>
          <button 
            @click="submitQuickEntry"
            class="px-6 py-3 bg-gradient-to-r from-sage-500 to-lavender-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Icon name="lucide:plus-circle" class="w-5 h-5" />
          </button>
        </div>
      </div> -->
  
      <!-- Today's Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-sage-800">Emociones de Hoy</h4>
            <Icon name="lucide:smile" class="w-5 h-5 text-rose-500" />
          </div>
          <div class="space-y-3">
            <div v-if="isLoading" class="animate-pulse space-y-3">
              <div v-for="i in 3" :key="i" class="flex items-center justify-between">
                <div class="h-4 bg-sage-200 rounded w-20"></div>
                <div class="flex items-center space-x-2">
                  <div class="w-16 bg-sage-200 rounded-full h-2"></div>
                  <div class="h-4 bg-sage-200 rounded w-8"></div>
                </div>
              </div>
            </div>
            <div v-else-if="todayEmotions.length === 0" class="text-center text-sage-500 py-4">
              <p class="text-sm">No hay registros de hoy</p>
              <p class="text-xs mt-1">¡Registra tu primera entrada!</p>
            </div>
            <div v-else v-for="emotion in todayEmotions" :key="emotion.name" class="flex items-center justify-between">
              <span class="text-sage-700">{{ emotion.name }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-16 bg-sage-100 rounded-full h-2">
                  <div 
                    :class="`h-2 rounded-full ${emotion.color}`"
                    :style="`width: ${emotion.intensity}%`"
                  ></div>
                </div>
                <span class="text-sm text-sage-600">{{ emotion.intensity }}%</span>
              </div>
            </div>
          </div>
        </div>
  
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-sage-800">Tendencia en tu Ánimo</h4>
            <Icon :name="trendIcon" :class="`w-5 h-5 ${trendIconColor}`" />
          </div>
          <div v-if="isLoading" class="animate-pulse space-y-3 text-center">
            <div class="h-8 bg-sage-200 rounded w-16 mx-auto"></div>
            <div class="h-4 bg-sage-200 rounded w-24 mx-auto"></div>
            <div class="h-4 bg-sage-200 rounded w-32 mx-auto"></div>
          </div>
          <div v-else-if="!moodTrend.currentLevel" class="text-center py-2">
            <div class="text-sage-600 mb-1">Sin datos suficientes</div>
            <p class="text-xs mt-1">Registra más entradas para ver tendencias</p>
          </div>
          <div v-else class="text-center">
            <div :class="`text-3xl font-bold ${trendTextColor} mb-2`">{{ moodTrend.currentLevel.toFixed(1) }}</div>
            <p class="text-sage-600 text-sm">{{ moodTrend.difference > 0 ? '+' : '' }}{{ moodTrend.difference.toFixed(1) }} desde ayer</p>
            <p :class="`text-xs mt-1 ${trendTextColor}`">{{ trendMessage }}</p>
          </div>
        </div>
  
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-sage-800">Entradas Esta Semana</h4>
            <Icon name="lucide:calendar" class="w-5 h-5 text-lavender-500" />
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-lavender-600 mb-2">{{ weeklyStats.total }}</div>
            <p class="text-sage-600 text-sm">{{ weeklyStats.today }} entradas hoy</p>
            <p class="text-lavender-600 text-xs mt-1" v-if="weeklyStats.total > 0">¡Excelente consistencia!</p>
            <p class="text-sage-500 text-xs mt-1" v-else>Registra tu primera entrada</p>
          </div>
        </div>
      </div>
  
      <!-- Recent Entries -->
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <h3 class="text-lg font-semibold text-sage-800 mb-4">Entradas Recientes</h3>
        <div class="space-y-4">
          <div v-if="isLoading" class="animate-pulse space-y-4">
            <div v-for="i in 3" :key="i" class="border border-sage-100 rounded-xl p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full bg-sage-200"></div>
                  <div class="h-4 bg-sage-200 rounded w-16"></div>
                </div>
                <div class="flex space-x-1">
                  <div class="h-6 bg-sage-200 rounded-full w-16"></div>
                  <div class="h-6 bg-sage-200 rounded-full w-16"></div>
                </div>
              </div>
              <div class="h-4 bg-sage-200 rounded w-3/4"></div>
            </div>
          </div>
          <div v-else-if="recentEntries.length === 0" class="text-center text-sage-500 py-8">
            <p class="text-sm">No hay entradas registradas</p>
            <p class="text-xs mt-1">Comienza registrando tu estado de ánimo</p>
          </div>
          <div v-else v-for="entry in recentEntries" :key="entry.id" class="border border-sage-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div :class="`w-3 h-3 rounded-full ${entry.moodColor}`"></div>
                <span class="font-medium text-sage-800">{{ entry.time }}</span>
              </div>
              <div class="flex space-x-1">
                <span v-for="emotion in entry.emotions" :key="emotion" class="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full">
                  {{ emotion }}
                </span>
              </div>
            </div>
            <p class="text-sage-700 text-sm">{{ entry.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { entries, isLoading, fetchEntries } = useMoodEntries()
  const quickEntry = ref('')
  
  // Datos computados para el dashboard
  const todayEmotions = computed(() => {
    if (!entries.value || entries.value.length === 0) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayEntries = entries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
    
    const emotionCounts = {}
    const emotionColors = {
      'joy': 'bg-emerald-400',
      'sadness': 'bg-blue-400',
      'anger': 'bg-red-400',
      'fear': 'bg-orange-400',
      'surprise': 'bg-purple-400',
      'disgust': 'bg-yellow-400'
    }
    
    todayEntries.forEach(entry => {
      [entry.emocion1, entry.emocion2, entry.emocion3].forEach(emotion => {
        if (emotion?.label && emotion.label !== 'other') {
          const key = emotion.label.toLowerCase()
          if (!emotionCounts[key]) {
            emotionCounts[key] = { count: 0, total: 0 }
          }
          emotionCounts[key].count++
          emotionCounts[key].total += emotion.score || 0
        }
      })
    })
    
    return Object.entries(emotionCounts).map(([emotion, data]) => ({
      name: getEmotionTranslation(emotion),
      intensity: Math.round((data.total / data.count) * 100),
      color: emotionColors[emotion] || 'bg-gray-400'
    })).sort((a, b) => b.intensity - a.intensity).slice(0, 5)
  })
  
  const recentEntries = computed(() => {
    if (!entries.value || entries.value.length === 0) return []
    
    return entries.value.slice(0, 5).map(entry => ({
      id: entry.id,
      time: formatDateTime(entry.timestamp_date).time,
      content: entry.trigger || 'Sin descripción',
      emotions: [
        entry.emocion1?.translated || entry.emocion1?.label,
        entry.emocion2?.translated || entry.emocion2?.label,
        entry.emocion3?.translated || entry.emocion3?.label
      ].filter(Boolean),
      moodColor: getMoodColor(entry.emocion1?.label)
    }))
  })
  
  // Cálculo de tendencia del estado de ánimo
  const moodTrend = computed(() => {
    if (!entries.value || entries.value.length < 2) {
      return { currentLevel: null, difference: 0 }
    }
    
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Obtener entradas de hoy y ayer
    const todayEntries = entries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
    
    const yesterdayEntries = entries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === yesterday.getTime()
    })
    
    // Calcular niveles promedio
    const calculateAvgLevel = (entriesList) => {
      if (entriesList.length === 0) return null
      return entriesList.reduce((sum, entry) => sum + entry.level, 0) / entriesList.length
    }
    
    const todayLevel = calculateAvgLevel(todayEntries) || calculateAvgLevel(entries.value.slice(0, 3))
    const yesterdayLevel = calculateAvgLevel(yesterdayEntries)
    
    // Si no hay datos de ayer, usar el promedio general como referencia
    const referenceLevel = yesterdayLevel || 
      (entries.value.length > 3 ? 
        calculateAvgLevel(entries.value.slice(3)) : 
        todayLevel)
    
    return {
      currentLevel: todayLevel,
      difference: todayLevel && referenceLevel ? todayLevel - referenceLevel : 0
    }
  })
  
  // Determinar mensaje e iconos de tendencia
  const trendMessage = computed(() => {
    if (!moodTrend.value.currentLevel) return ''
    
    const diff = moodTrend.value.difference
    if (diff > 1) return 'Tendencia muy positiva'
    if (diff > 0.3) return 'Tendencia positiva'
    if (diff < -1) return 'Tendencia a la baja'
    if (diff < -0.3) return 'Ligero descenso'
    return 'Estado estable'
  })
  
  const trendIcon = computed(() => {
    if (!moodTrend.value.currentLevel) return 'lucide:minus'
    
    const diff = moodTrend.value.difference
    if (diff > 0.5) return 'lucide:trending-up'
    if (diff < -0.5) return 'lucide:trending-down'
    return 'lucide:minus'
  })
  
  const trendTextColor = computed(() => {
    if (!moodTrend.value.currentLevel) return 'text-sage-600'
    
    const diff = moodTrend.value.difference
    if (diff > 0.5) return 'text-emerald-600'
    if (diff < -0.5) return 'text-orange-600'
    return 'text-sage-600'
  })
  
  const trendIconColor = computed(() => {
    if (!moodTrend.value.currentLevel) return 'text-sage-500'
    
    const diff = moodTrend.value.difference
    if (diff > 0.5) return 'text-emerald-500'
    if (diff < -0.5) return 'text-orange-500'
    return 'text-sage-500'
  })

  const weeklyStats = computed(() => {
    if (!entries.value) return { total: 0, today: 0 }
    
    const now = new Date()
    const startOfWeek = new Date(now)
    const daysSinceMonday = (startOfWeek.getDay() + 6) % 7
    startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekEntries = entries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      return entryDate >= startOfWeek && entryDate <= now
    })
    
    const todayEntries = entries.value.filter(entry => {
      const entryDate = new Date(entry.timestamp_date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
    
    return {
      total: weekEntries.length,
      today: todayEntries.length
    }
  })
  
  // Funciones auxiliares
  const getEmotionTranslation = (emotion) => {
    const translations = {
      'joy': 'Alegría',
      'sadness': 'Tristeza',
      'anger': 'Enojo',
      'fear': 'Miedo',
      'surprise': 'Sorpresa',
      'disgust': 'Disgusto'
    }
    return translations[emotion] || emotion
  }
  
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }
  
  const getMoodColor = (emotion) => {
    const emotionColors = {
      'joy': 'bg-emerald-400',
      'sadness': 'bg-blue-400',
      'anger': 'bg-red-400',
      'fear': 'bg-orange-400',
      'surprise': 'bg-purple-400',
      'disgust': 'bg-yellow-400'
    }
    return emotionColors[emotion?.toLowerCase()] || 'bg-gray-400'
  }
  
  const submitQuickEntry = () => {
    if (quickEntry.value.trim()) {
      console.log('Guardando entrada rápida:', quickEntry.value)
      quickEntry.value = ''
      // Aquí conectaremos con Supabase después
    }
  }
  
  // Cargar datos al iniciar
  onMounted(async () => {
    await fetchEntries(50) // Cargar más entradas para estadísticas
  })
  </script>