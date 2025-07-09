<template>
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-teal-100 rounded-lg">
            <Icon name="lucide:brain" class="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 text-lg">{{ technique.name }}</h3>
            <span class="text-sm text-gray-500 capitalize">
              {{ categoryFormatted }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Icon name="lucide:clock" class="w-4 h-4 text-gray-400" />
          <span class="text-sm text-gray-600">{{ technique.duration_minutes }}min</span>
        </div>
      </div>
      
      <!-- Content grows to fill available space -->
      <div class="flex-1 flex flex-col">
        <p class="text-gray-700 mb-4 leading-relaxed flex-shrink-0">
          {{ technique.description }}
        </p>
        
        <div class="bg-teal-50 rounded-lg p-4 mb-4 flex-1">
          <h4 class="font-medium text-teal-900 mb-2">Cómo hacerlo:</h4>
          <p class="text-teal-800 text-sm leading-relaxed">
            {{ truncatedInstructions }}
          </p>
        </div>
        
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <div class="flex items-center space-x-1">
            <Icon 
              v-for="i in 3" 
              :key="i"
              name="lucide:star" 
              :class="evidenceStarClass"
            />
            <span class="text-xs text-gray-500 ml-1">{{ evidenceText }}</span>
          </div>
          <span class="text-xs px-2 py-1 rounded-full" :class="difficultyBadgeClass">
            {{ difficultyText }}
          </span>
        </div>
      </div>
      
      <!-- Ver más button - always at bottom -->
      <div class="mt-auto">
        <button
          @click="selectTechnique"
          class="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white py-3 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Ver más
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    technique: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['select-technique'])
  
  // Computed properties
  const categoryFormatted = computed(() => {
    return props.technique.category?.replace('_', ' ') || 'General'
  })
  
  const truncatedInstructions = computed(() => {
    const instructions = props.technique.instructions || ''
    return instructions.length > 150 ? instructions.substring(0, 150) + '...' : instructions
  })
  
  const evidenceStarClass = computed(() => {
    return props.technique.evidence_level === 'high' 
      ? 'text-yellow-400 fill-current' 
      : 'text-gray-300'
  })
  
  const evidenceText = computed(() => {
    const level = props.technique.evidence_level
    switch(level) {
      case 'high': return 'Alta evidencia'
      case 'medium': return 'Evidencia media'
      case 'low': return 'Evidencia baja'
      default: return 'Sin evaluar'
    }
  })
  
  const difficultyText = computed(() => {
    const level = props.technique.difficulty_level
    if (level <= 1) return 'Muy fácil'
    if (level <= 2) return 'Fácil'
    if (level <= 3) return 'Moderado'
    if (level <= 4) return 'Difícil'
    return 'Muy difícil'
  })
  
  const difficultyBadgeClass = computed(() => {
    const level = props.technique.difficulty_level
    if (level <= 2) return 'bg-green-100 text-green-800'
    if (level <= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  })
  
  // Methods
  const selectTechnique = () => {
    emit('select-technique', props.technique)
  }
  </script>