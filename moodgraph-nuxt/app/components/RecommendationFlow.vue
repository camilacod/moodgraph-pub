<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <!-- Progress Indicator -->
    <div class="flex items-center justify-center space-x-4 mb-8">
      <div class="flex items-center space-x-2" :class="currentStep === 'techniques' ? 'text-teal-600' : 'text-gray-400'">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" 
             :class="currentStep === 'techniques' ? 'bg-teal-600 text-white' : 'bg-gray-300'">
          1
        </div>
        <span class="font-medium">Técnicas Recomendadas</span>
      </div>
      <div class="w-12 h-1 bg-gray-300 rounded"></div>
      <div class="flex items-center space-x-2" :class="currentStep === 'technique-detail' ? 'text-teal-600' : 'text-gray-400'">
        <div class="w-8 h-8 rounded-full flex items-center justify-center"
             :class="currentStep === 'technique-detail' ? 'bg-teal-600 text-white' : 'bg-gray-300'">
          2
        </div>
        <span class="font-medium">Técnica Completa</span>
      </div>
    </div>

    <!-- PASO 1: Técnicas Recomendadas -->
    <div v-if="currentStep === 'techniques'" class="space-y-6">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Técnicas Recomendadas para Ti
        </h2>
        <p class="text-gray-600">
          {{ recommendationMessage }}
        </p>
      </div>
      
      <!-- Loading técnicas -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
        <Icon name="lucide:loader-2" class="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
        <p class="text-gray-600 text-lg">Generando recomendaciones personalizadas...</p>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
        <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-600 mx-auto mb-3" />
        <p class="text-red-800">{{ error }}</p>
        <button 
          @click="loadRecommendations"
          class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
      
      <!-- Grid de técnicas -->
      <div v-else-if="recommendedTechniques.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TechniqueCard 
          v-for="technique in recommendedTechniques" 
          :key="technique.id" 
          :technique="technique"
          @select-technique="selectTechnique"
        />
      </div>
      
      <!-- No hay técnicas -->
      <div v-else class="bg-yellow-50 rounded-xl border border-yellow-200 p-8 text-center">
        <Icon name="lucide:info" class="w-8 h-8 text-yellow-600 mx-auto mb-3" />
        <p class="text-yellow-800">No se pudieron cargar recomendaciones en este momento.</p>
        <p class="text-yellow-700 text-sm mt-2">Intenta de nuevo más tarde.</p>
      </div>
    </div>

    <!-- PASO 2: Técnica Completa con Feedback -->
    <div v-if="currentStep === 'technique-detail'" class="space-y-6">
      <div v-if="selectedTechnique" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="backToTechniques"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Icon name="lucide:arrow-left" class="w-5 h-5" />
            <span>Volver a recomendaciones</span>
          </button>
          
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span>{{ selectedTechnique.duration_minutes }} minutos</span>
            <span class="mx-2">•</span>
            <Icon name="lucide:bar-chart" class="w-4 h-4" />
            <span>Nivel {{ selectedTechnique.difficulty_level }}/5</span>
          </div>
        </div>

        <!-- Technique Header -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ selectedTechnique.name }}
          </h1>
          <p class="text-gray-600 text-lg">
            {{ selectedTechnique.description }}
          </p>
          <div class="flex items-center justify-center space-x-4 mt-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
              {{ selectedTechnique.category.replace('_', ' ').toLowerCase() }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {{ selectedTechnique.evidence_level }} evidencia
            </span>
          </div>
        </div>

        <!-- Technique Steps -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Cómo hacerlo:</h3>
          
          <div class="space-y-4">
            <!-- Show only current step or all steps based on showAllSteps -->
            <template v-if="showAllSteps">
              <div 
                v-for="(step, index) in techniqueSteps" 
                :key="index"
                class="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-200"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 leading-relaxed">{{ step.trim() }}</p>
                </div>
              </div>
            </template>
            
            <template v-else>
              <div class="flex items-start space-x-4 p-4 rounded-xl bg-teal-50 border border-teal-200">
                <div class="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {{ currentStepIndex + 1 }}
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 leading-relaxed">{{ techniqueSteps[currentStepIndex]?.trim() }}</p>
                </div>
              </div>
            </template>
          </div>

          <!-- Step Navigation -->
          <div class="flex items-center justify-between mt-6">
            <div class="flex items-center space-x-2">
              <button
                v-if="!showAllSteps && currentStepIndex > 0"
                @click="previousStep"
                class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icon name="lucide:chevron-left" class="w-4 h-4" />
                <span>Anterior</span>
              </button>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">
                {{ showAllSteps ? `${techniqueSteps.length} pasos` : `${currentStepIndex + 1} de ${techniqueSteps.length}` }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                v-if="!showAllSteps && currentStepIndex < techniqueSteps.length - 1"
                @click="nextStep"
                class="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <span>Ver más</span>
                <Icon name="lucide:chevron-right" class="w-4 h-4" />
              </button>
              
              <button
                v-if="!showAllSteps && currentStepIndex === techniqueSteps.length - 1"
                @click="showAllSteps = true"
                class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>Ver todos los pasos</span>
                <Icon name="lucide:list" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            ¿Qué te pareció esta técnica?
          </h2>
          <p class="text-gray-600">
            Tu feedback nos ayuda a mejorar las recomendaciones
          </p>
        </div>
        
        <div class="max-w-md mx-auto">
          <!-- Star Rating -->
          <div class="flex items-center justify-center space-x-2 mb-6">
            <button
              v-for="star in 5"
              :key="star"
              @click="setRating(star)"
              class="text-3xl transition-colors duration-200 hover:scale-110 transform"
              :class="star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'"
            >
              <Icon name="lucide:star" :class="star <= feedbackRating ? 'fill-current' : ''" />
            </button>
          </div>
          
          <!-- Rating Labels -->
          <div class="text-center mb-6">
            <p class="text-sm text-gray-600">
              {{ getRatingLabel(feedbackRating) }}
            </p>
          </div>
          
          <!-- Submit Button -->
          <div class="text-center">
            <button
              @click="submitFeedback"
              :disabled="feedbackRating === 0 || submittingFeedback || feedbackSubmitted"
              class="bg-gradient-to-r from-teal-600 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-green-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon v-if="submittingFeedback" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else-if="feedbackSubmitted" name="lucide:check" class="w-4 h-4 mr-2" />
              <span v-if="submittingFeedback">Enviando...</span>
              <span v-else-if="feedbackSubmitted">¡Gracias por tu feedback!</span>
              <span v-else>Enviar Feedback</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userProfile: {
    type: Object,
    required: true
  }
})

// Estados reactivos
const currentStep = ref('techniques')
const selectedTechnique = ref(null)
const recommendedTechniques = ref([])

// Estados para la técnica completa
const currentStepIndex = ref(0)
const showAllSteps = ref(false)
const feedbackRating = ref(0)
const feedbackSubmitted = ref(false)
const submittingFeedback = ref(false)

// Usar el composable de técnicas terapéuticas
const { 
  techniques, 
  isLoading, 
  error, 
  getRecommendedTechniques, 
  saveTechniqueFeedback,
  getUserFeedbackCount 
} = useTherapeuticTechniques()

// Computed properties
const techniqueSteps = computed(() => {
  if (!selectedTechnique.value?.instructions) return []
  return selectedTechnique.value.instructions.split('\n').filter(step => step.trim())
})

const recommendationMessage = computed(() => {
  // Este mensaje se podría personalizar basado en si es cold start o no
  if (recommendedTechniques.value.length === 0) return ''
  
  // Aquí podrías agregar lógica para mostrar diferentes mensajes
  return 'Basadas en tu perfil y experiencias de usuarios similares'
})

// Emits
const emit = defineEmits(['feedback-submitted'])

// Métodos
const selectTechnique = (technique) => {
  console.log('🔧 Técnica seleccionada:', technique)
  selectedTechnique.value = technique
  currentStep.value = 'technique-detail'
  currentStepIndex.value = 0
  showAllSteps.value = false
  feedbackRating.value = 0
  feedbackSubmitted.value = false
}

const backToTechniques = () => {
  currentStep.value = 'techniques'
  selectedTechnique.value = null
}

const nextStep = () => {
  if (currentStepIndex.value < techniqueSteps.value.length - 1) {
    currentStepIndex.value++
  }
}

const previousStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
  }
}

const setRating = (rating) => {
  feedbackRating.value = rating
}

const getRatingLabel = (rating) => {
  const labels = {
    0: 'Selecciona una calificación',
    1: 'No me ayudó nada',
    2: 'Me ayudó un poco',
    3: 'Me ayudó moderadamente',
    4: 'Me ayudó mucho',
    5: 'Me ayudó enormemente'
  }
  return labels[rating] || ''
}

const submitFeedback = async () => {
  if (!selectedTechnique.value || feedbackRating.value === 0) return
  
  submittingFeedback.value = true
  
  try {
    const result = await saveTechniqueFeedback({
      technique_id: selectedTechnique.value.id,
      rating: feedbackRating.value
    })
    
    if (result.success) {
      feedbackSubmitted.value = true
      
      // Emit evento para notificar al padre
      emit('feedback-submitted', {
        technique: selectedTechnique.value,
        rating: feedbackRating.value,
        submitted_at: new Date().toISOString()
      })
      
      console.log('✅ Feedback enviado exitosamente')
    } else {
      console.error('❌ Error enviando feedback:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Error enviando feedback:', error)
  } finally {
    submittingFeedback.value = false
  }
}

const loadRecommendations = async () => {
  if (!props.userProfile) {
    console.error('⚠️ Perfil de usuario requerido')
    return
  }
  
  try {
    console.log('🔄 Cargando recomendaciones para:', props.userProfile.name)
    const recommendations = await getRecommendedTechniques(props.userProfile)
    recommendedTechniques.value = recommendations
    console.log(`✅ ${recommendations.length} recomendaciones cargadas`)
  } catch (error) {
    console.error('❌ Error cargando recomendaciones:', error)
  }
}

// Cargar recomendaciones al montar el componente
onMounted(async () => {
  await loadRecommendations()
})
</script>