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
            <Icon name="lucide:heart" class="w-5 h-5 text-rose-500" />
          </div>
          <div class="space-y-3">
            <div v-for="emotion in todayEmotions" :key="emotion.name" class="flex items-center justify-between">
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
            <h4 class="font-semibold text-sage-800">Tendencia del Ánimo</h4>
            <Icon name="lucide:trending-up" class="w-5 h-5 text-emerald-500" />
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-emerald-600 mb-2">↗️ 8.2</div>
            <p class="text-sage-600 text-sm">+0.5 desde ayer</p>
            <p class="text-emerald-600 text-xs mt-1">Tendencia ascendente</p>
          </div>
        </div>
  
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-semibold text-sage-800">Entradas Esta Semana</h4>
            <Icon name="lucide:calendar" class="w-5 h-5 text-lavender-500" />
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-lavender-600 mb-2">12</div>
            <p class="text-sage-600 text-sm">2 entradas hoy</p>
            <p class="text-lavender-600 text-xs mt-1">¡Excelente consistencia!</p>
          </div>
        </div>
      </div>
  
      <!-- Recent Entries -->
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <h3 class="text-lg font-semibold text-sage-800 mb-4">Entradas Recientes</h3>
        <div class="space-y-4">
          <div v-for="entry in recentEntries" :key="entry.id" class="border border-sage-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
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
  const { todayEmotions, recentEntries } = useMockData()
  const quickEntry = ref('')
  
  const submitQuickEntry = () => {
    if (quickEntry.value.trim()) {
      console.log('Guardando entrada rápida:', quickEntry.value)
      quickEntry.value = ''
      // Aquí conectaremos con Supabase después
    }
  }
  </script>