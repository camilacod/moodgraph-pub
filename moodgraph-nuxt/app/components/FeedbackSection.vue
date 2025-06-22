<template>
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Icon name="lucide:thumbs-up" class="w-5 h-5 mr-2 text-blue-600" />
        ¿Qué tan útil fue este consejo?
      </h3>
      
      <div v-if="!submitted" class="space-y-6">
        <!-- Rating buttons -->
        <div class="flex justify-center space-x-2">
          <button
            v-for="ratingValue in 5"
            :key="ratingValue"
            @click="updateRating(ratingValue)"
            :disabled="submitting"
            class="w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center font-semibold disabled:opacity-50"
            :class="getRatingButtonClass(ratingValue)"
          >
            {{ ratingValue }}
          </button>
        </div>
        
        <!-- Rating labels -->
        <div class="flex justify-between text-xs text-gray-500 px-2">
          <span>Nada útil</span>
          <span>Muy útil</span>
        </div>
        
        <!-- Submit button -->
        <div class="text-center">
          <button
            @click="handleSubmit"
            :disabled="rating === 0 || submitting"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center mx-auto disabled:cursor-not-allowed"
            :class="submitButtonClass"
          >
            <Icon 
              :name="submitting ? 'lucide:loader-2' : 'lucide:send'" 
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': submitting }"
            />
            {{ submitting ? 'Enviando...' : 'Enviar Feedback' }}
          </button>
        </div>
      </div>
      
      <!-- Success state -->
      <div v-else class="text-center py-4">
        <Icon name="lucide:check-circle" class="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p class="text-green-700 font-medium">¡Gracias por tu feedback!</p>
        <p class="text-gray-600 text-sm mt-1">Tu calificación: {{ rating }}/5</p>
        
        <!-- Additional feedback actions -->
        <div class="mt-4 space-y-2">
          <button 
            @click="$emit('restart')"
            class="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Generar nuevo consejo
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    rating: {
      type: Number,
      default: 0
    },
    submitted: {
      type: Boolean,
      default: false
    },
    submitting: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:rating', 'submit', 'restart'])
  
  // Methods
  const updateRating = (newRating) => {
    if (!props.submitting) {
      emit('update:rating', newRating)
    }
  }
  
  const handleSubmit = () => {
    if (props.rating > 0 && !props.submitting) {
      emit('submit')
    }
  }
  
  // Computed
  const getRatingButtonClass = (ratingValue) => {
    const isSelected = props.rating >= ratingValue
    const isDisabled = props.submitting
    
    if (isDisabled) {
      return 'border-gray-300 text-gray-400'
    }
    
    if (isSelected) {
      return 'bg-blue-500 border-blue-500 text-white shadow-lg transform scale-110'
    }
    
    return 'border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:scale-105'
  }
  
  const submitButtonClass = computed(() => {
    if (props.rating === 0 || props.submitting) {
      return 'bg-gray-300 text-gray-500'
    }
    return 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
  })
  </script>