<template>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <select class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent">
            <option>Todo el Tiempo</option>
            <option>Este Mes</option>
            <option>Esta Semana</option>
          </select>
          <select class="px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent">
            <option>Todas las Emociones</option>
            <option>Feliz</option>
            <option>Ansioso</option>
            <option>Tranquilo</option>
          </select>
        </div>
        <button class="px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors">
          <Icon name="lucide:search" class="w-4 h-4" />
        </button>
      </div>
  
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200">
        <div class="p-6 border-b border-sage-200">
          <h3 class="text-lg font-semibold text-sage-800">Historial de Entradas</h3>
        </div>
        <div class="divide-y divide-sage-100">
          <div v-for="entry in allEntries" :key="entry.id" class="p-6 hover:bg-sage-50 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div :class="`w-3 h-3 rounded-full ${entry.moodColor}`"></div>
                <div>
                  <span class="font-medium text-sage-800">{{ entry.date }}</span>
                  <span class="text-sage-600 ml-2">{{ entry.time }}</span>
                </div>
              </div>
              <div class="flex space-x-1">
                <span v-for="emotion in entry.emotions" :key="emotion" class="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full">
                  {{ emotion }}
                </span>
              </div>
            </div>
            <p class="text-sage-700 mb-2">{{ entry.content }}</p>
            <div class="flex items-center justify-between text-sm text-sage-600">
              <span>Desencadenante: {{ entry.trigger }}</span>
              <span>Energía: {{ entry.energy }}/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const { allEntries } = useMockData()
  </script>