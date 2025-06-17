<template>
    <div class="space-y-8">
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <h3 class="text-lg font-semibold text-sage-800 mb-4">Recomendaciones Personalizadas</h3>
        <p class="text-sage-600 mb-6">Basado en tus entradas recientes y experiencias de usuarios similares</p>
        
        <div class="space-y-4">
          <div v-for="rec in recommendations" :key="rec.id" class="border border-sage-100 rounded-xl p-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div :class="`w-10 h-10 rounded-xl flex items-center justify-center ${rec.iconBg}`">
                  <Icon :name="rec.icon" :class="`w-5 h-5 ${rec.iconColor}`" />
                </div>
                <div>
                  <h4 class="font-medium text-sage-800">{{ rec.title }}</h4>
                  <p class="text-sm text-sage-600">{{ rec.category }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-1">
                <Icon v-for="n in 5" :key="n" 
                  :name="n <= rec.rating ? 'lucide:star' : 'lucide:star'" 
                  :class="n <= rec.rating ? 'text-yellow-400 fill-current' : 'text-sage-300'" 
                  class="w-4 h-4" />
              </div>
            </div>
            <p class="text-sage-700 mb-3">{{ rec.description }}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-sage-600">{{ rec.users }} usuarios encontraron esto útil</span>
              <div class="flex space-x-2">
                <button class="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors text-sm">
                  Probar Después
                </button>
                <button class="px-4 py-2 bg-gradient-to-r from-sage-500 to-lavender-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm">
                  Probar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { recommendations } = useMockData()
  </script>