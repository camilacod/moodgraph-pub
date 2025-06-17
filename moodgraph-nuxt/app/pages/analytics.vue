<template>
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <h3 class="text-lg font-semibold text-sage-800 mb-4">Patrones de Ánimo (Últimos 30 Días)</h3>
          <div class="h-64 bg-sage-50 rounded-xl flex items-center justify-center">
            <div class="text-center text-sage-600">
              <Icon name="lucide:bar-chart-3" class="w-12 h-12 mx-auto mb-2" />
              <p>Visualización de tendencias de ánimo</p>
            </div>
          </div>
        </div>
  
        <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
          <h3 class="text-lg font-semibold text-sage-800 mb-4">Distribución de Emociones</h3>
          <div class="h-64 bg-sage-50 rounded-xl flex items-center justify-center">
            <div class="text-center text-sage-600">
              <Icon name="lucide:pie-chart" class="w-12 h-12 mx-auto mb-2" />
              <p>Gráfico de desglose de emociones</p>
            </div>
          </div>
        </div>
      </div>
  
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
        <h3 class="text-lg font-semibold text-sage-800 mb-4">Análisis de Desencadenantes</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="trigger in topTriggers" :key="trigger.name" class="p-4 bg-sage-50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-sage-800">{{ trigger.name }}</span>
              <span class="text-sm text-sage-600">{{ trigger.count }} veces</span>
            </div>
            <div class="w-full bg-sage-200 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-sage-500 to-lavender-500 h-2 rounded-full"
                :style="`width: ${trigger.percentage}%`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { topTriggers } = useMockData()
  </script>