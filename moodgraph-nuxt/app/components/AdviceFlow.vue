<template>
    <div class="max-w-4xl mx-auto p-6 space-y-8">
      <!-- Progress Indicator -->
      <div class="flex items-center justify-center space-x-4 mb-8">
        <div class="flex items-center space-x-2" :class="currentStep === 'techniques' ? 'text-teal-600' : 'text-gray-400'">
          <div class="w-8 h-8 rounded-full flex items-center justify-center" 
               :class="currentStep === 'techniques' ? 'bg-teal-600 text-white' : 'bg-gray-300'">
            1
          </div>
          <span class="font-medium">Técnicas</span>
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
            Técnicas Recomendadas
          </h2>
          <p class="text-gray-600">
            Basadas en tus emociones actuales, estas técnicas pueden ayudarte:
          </p>
        </div>
        
        <!-- Loading técnicas -->
        <div v-if="loadingTechniques" class="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Icon name="lucide:loader-2" class="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p class="text-gray-600 text-lg">Buscando técnicas personalizadas...</p>
        </div>
        
        <!-- Mensaje si no hay técnicas -->
        <div v-else-if="recommendedTechniques.length === 0" class="bg-yellow-50 rounded-xl border border-yellow-200 p-8 text-center">
          <Icon name="lucide:info" class="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <p class="text-yellow-800">No se encontraron técnicas específicas para tus emociones actuales.</p>
          <p class="text-yellow-700 text-sm mt-2">El consejo personalizado incluirá técnicas generales efectivas.</p>
        </div>
        
        <!-- Grid de técnicas -->
        <div v-else class="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <TechniqueCard 
            v-for="technique in recommendedTechniques" 
            :key="technique.id" 
            :technique="technique"
            @select-technique="selectTechnique"
          />
        </div>
      </div>
  
      <!-- PASO 2: Técnica Completa con Consejo y Feedback -->
      <div v-if="currentStep === 'technique-detail'" class="space-y-6">
        <div v-if="selectedTechnique" class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div class="flex items-center justify-between mb-6">
            <button 
              @click="backToTechniques"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Icon name="lucide:arrow-left" class="w-5 h-5" />
              <span>Volver a técnicas</span>
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

          <!-- Integrated Advice Button -->
          <div class="mt-6 mb-6 flex justify-center">
            <button
              @click="showAdviceModal = true"
              class="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-teal-300/50 transition-all duration-300 flex items-center space-x-2 group hover:scale-105 transform hover:-translate-y-1 animate-pulse"
            >
              <Icon name="lucide:sparkles" class="w-5 h-5 group-hover:animate-bounce text-teal-100" />
              <span class="font-semibold">Consejo Personalizado</span>
            </button>
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

        <!-- Advice Modal -->
        <div v-if="showAdviceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 class="text-xl font-bold text-gray-900 flex items-center">
                <Icon name="lucide:sparkles" class="w-5 h-5 mr-2 text-teal-600" />
                Consejo Personalizado
              </h3>
              <button 
                @click="showAdviceModal = false"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon name="lucide:x" class="w-6 h-6" />
              </button>
            </div>
            
            <!-- Modal Content -->
            <div class="p-6">
              <!-- Loading advice -->
              <div v-if="isGeneratingAdvice" class="text-center py-8">
                <Icon name="lucide:loader-2" class="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                <p class="text-gray-600 text-lg">Generando tu consejo personalizado...</p>
                <p class="text-gray-500 text-sm mt-2">Adaptando la técnica a tu situación específica</p>
              </div>
              
              <!-- Error generating advice -->
              <div v-else-if="adviceError" class="text-center py-8">
                <Icon name="lucide:alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-red-800 mb-4">Error al generar el consejo</p>
                <button 
                  @click="generateAdvice"
                  class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
              
              <!-- Generated advice -->
              <div v-else-if="advice" class="space-y-4">
                <div class="prose prose-lg max-w-none">
                  <p v-for="(paragraph, index) in adviceParagraphs" 
                     :key="index" 
                     class="text-gray-700 leading-relaxed mb-4">
                    {{ paragraph }}
                  </p>
                </div>
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
    moodEntry: {
      type: Object,
      required: true
    },
    userProfile: {
      type: Object,
      required: true
    }
  })
  
  // Estados reactivos
  const currentStep = ref('techniques')
  const loadingTechniques = ref(true)
  const recommendedTechniques = ref([])
  const selectedTechnique = ref(null)
  
  // Estados para la técnica completa
  const currentStepIndex = ref(0)
  const showAllSteps = ref(false)
  const showAdviceModal = ref(false)
  const isGeneratingAdvice = ref(false)
  const advice = ref('')
  const adviceError = ref(false)
  const feedbackRating = ref(0)
  const feedbackSubmitted = ref(false)
  const submittingFeedback = ref(false)
  
  // Preparar datos de entrada para el formato esperado por el API
  const entryData = computed(() => ({
    trigger: props.moodEntry.trigger,
    energyLevel: props.moodEntry.level,
    emotions: [
      { 
        label: props.moodEntry.emocion1?.label, 
        score: props.moodEntry.emocion1?.score, 
        translated: props.moodEntry.emocion1?.translated 
      },
      { 
        label: props.moodEntry.emocion2?.label, 
        score: props.moodEntry.emocion2?.score, 
        translated: props.moodEntry.emocion2?.translated 
      },
      { 
        label: props.moodEntry.emocion3?.label, 
        score: props.moodEntry.emocion3?.score, 
        translated: props.moodEntry.emocion3?.translated 
      }
    ].filter(e => e.label) // Filtrar emociones vacías
  }))
  
  // Computed properties
  const techniqueSteps = computed(() => {
    if (!selectedTechnique.value?.instructions) return []
    return selectedTechnique.value.instructions.split('\n').filter(step => step.trim())
  })
  
  const adviceParagraphs = computed(() => {
    return advice.value ? advice.value.split('\n\n').filter(p => p.trim()) : []
  })
  
  // Emits
  const emit = defineEmits(['advice-generated', 'feedback-submitted'])
  
  // Métodos
  const selectTechnique = (technique) => {
    console.log('🔧 Técnica seleccionada:', technique)
    selectedTechnique.value = technique
    currentStep.value = 'technique-detail'
    console.log('🔧 Estado actualizado:', { selectedTechnique: selectedTechnique.value, currentStep: currentStep.value })
    
    // Auto-generar consejo personalizado en background
    setTimeout(() => {
      generateAdvice()
    }, 500) // Small delay to let the UI transition smoothly
  }
  
  const backToTechniques = () => {
    currentStep.value = 'techniques'
    selectedTechnique.value = null
    // Reset advice state
    advice.value = ''
    adviceError.value = false
    isGeneratingAdvice.value = false
    showAdviceModal.value = false
  }
  
  const handleAdviceGenerated = (data) => {
    emit('advice-generated', data)
  }
  
  const handleFeedbackSubmitted = (data) => {
    emit('feedback-submitted', data)
  }
  
  // Métodos para la técnica completa
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
  
  const generateAdvice = async () => {
    isGeneratingAdvice.value = true
    adviceError.value = false
    
    try {
      const response = await $fetch('/api/advice/generate', {
        method: 'POST',
        body: {
          entryData: entryData.value,
          userProfile: props.userProfile,
          entryId: props.moodEntry.id,
          selectedTechnique: selectedTechnique.value
        }
      })
      
      advice.value = response.data.advice
      
      // Emit event to update mood entry in parent
      emit('advice-generated', {
        advice: response.data.advice,
        technique: selectedTechnique.value
      })
      
    } catch (error) {
      console.error('Error generating advice:', error)
      adviceError.value = true
    } finally {
      isGeneratingAdvice.value = false
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
    submittingFeedback.value = true
    
    try {
      const response = await $fetch('/api/feedback/submit', {
        method: 'POST',
        body: {
          entryId: props.moodEntry.id,
          rating: feedbackRating.value,
          techniqueId: selectedTechnique.value.id,
          userId: props.userProfile.id
        }
      })
      
      feedbackSubmitted.value = true
      
      // Emit event to update mood entry in parent
      emit('feedback-submitted', {
        rating: feedbackRating.value,
        submitted_at: response.data.submitted_at,
        technique: selectedTechnique.value
      })
      
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Could show error message here
    } finally {
      submittingFeedback.value = false
    }
  }
  
  // Watch for advice modal opening - only generate if not already generated
  watch(showAdviceModal, (newValue) => {
    if (newValue && !advice.value && !isGeneratingAdvice.value && !adviceError.value) {
      generateAdvice()
    }
  })
  
  // Cargar técnicas al iniciar
  onMounted(async () => {
    try {
      // Cargar técnicas basadas en las emociones del mood entry
      // Mapeo de emociones a inglés para el API
      const emotionMapping = {
        'alegría': 'joy',
        'tristeza': 'sadness', 
        'enojo': 'anger',
        'ira': 'anger',
        'miedo': 'fear',
        'sorpresa': 'surprise',
        'asco': 'disgust',
        'disgusto': 'disgust'
      }
      
      const emotions = entryData.value.emotions
        .slice(0, 2) // Solo las 2 emociones principales
        .map(e => {
          if (e.translated) {
            const lowerTranslated = e.translated.toLowerCase()
            return emotionMapping[lowerTranslated] || e.label?.toLowerCase()
          }
          return e.label?.toLowerCase()
        })
        .filter(Boolean)
      
      console.log('🎭 Emociones para técnicas:', emotions)
      
      if (emotions.length > 0) {
        const response = await $fetch('/api/techniques/recommend', {
          method: 'POST',
          body: { emotions }
        })
        
        recommendedTechniques.value = response.data.techniques || []
        console.log('🔧 Técnicas encontradas:', recommendedTechniques.value.length)
      }
    } catch (error) {
      console.error('Error cargando técnicas:', error)
      recommendedTechniques.value = []
    } finally {
      loadingTechniques.value = false
    }
  })
  </script>