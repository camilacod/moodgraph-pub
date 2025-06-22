<template>
    <div class="max-w-4xl mx-auto p-6 space-y-8">
      <!-- Progress Indicator -->
      <div class="flex items-center justify-center space-x-4 mb-8">
        <div class="flex items-center space-x-2" :class="currentStep === 'techniques' ? 'text-blue-600' : 'text-gray-400'">
          <div class="w-8 h-8 rounded-full flex items-center justify-center" 
               :class="currentStep === 'techniques' ? 'bg-blue-600 text-white' : 'bg-gray-300'">
            1
          </div>
          <span class="font-medium">Técnicas</span>
        </div>
        <div class="w-12 h-1 bg-gray-300 rounded"></div>
        <div class="flex items-center space-x-2" :class="currentStep === 'advice' ? 'text-blue-600' : 'text-gray-400'">
          <div class="w-8 h-8 rounded-full flex items-center justify-center"
               :class="currentStep === 'advice' ? 'bg-blue-600 text-white' : 'bg-gray-300'">
            2
          </div>
          <span class="font-medium">Consejo</span>
        </div>
        <div class="w-12 h-1 bg-gray-300 rounded"></div>
        <div class="flex items-center space-x-2" :class="currentStep === 'feedback' ? 'text-blue-600' : 'text-gray-400'">
          <div class="w-8 h-8 rounded-full flex items-center justify-center"
               :class="currentStep === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-300'">
            3
          </div>
          <span class="font-medium">Feedback</span>
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
          <Icon name="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
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
          />
        </div>
        
        <div class="text-center mt-8">
          <button
            @click="goToAdvice"
            :disabled="loadingTechniques"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loadingTechniques" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Continuar al Consejo Personalizado
          </button>
        </div>
      </div>
  
      <!-- PASO 2: Consejo Personalizado -->
      <div v-if="currentStep === 'advice'" class="space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Tu Consejo Personalizado
          </h2>
        </div>
        
        <!-- Loading consejo -->
        <div v-if="isGeneratingAdvice" class="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Icon name="lucide:loader-2" class="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p class="text-gray-600 text-lg">Generando tu consejo personalizado...</p>
          <p class="text-gray-500 text-sm mt-2">Esto puede tomar unos segundos</p>
        </div>
        
        <!-- Error generando consejo -->
        <div v-else-if="adviceError" class="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
          <Icon name="lucide:alert-circle" class="w-8 h-8 text-red-600 mx-auto mb-3" />
          <p class="text-red-800 mb-3">Error al generar el consejo</p>
          <button 
            @click="generateAdvice"
            class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Intentar de nuevo
          </button>
        </div>
        
        <!-- Consejo generado -->
        <template v-else-if="advice">
          <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div class="prose prose-lg max-w-none">
              <p v-for="(paragraph, index) in adviceParagraphs" 
                 :key="index" 
                 class="text-gray-700 leading-relaxed mb-4">
                {{ paragraph }}
              </p>
            </div>
          </div>
          
          <div class="text-center">
            <button
              @click="goToFeedback"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              Continuar al Feedback
            </button>
          </div>
        </template>
      </div>
  
      <!-- PASO 3: Feedback -->
      <div v-if="currentStep === 'feedback'" class="space-y-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Tu Opinión es Importante
          </h2>
          <p class="text-gray-600">
            Ayúdanos a mejorar calificando la utilidad del consejo
          </p>
        </div>
        
        <FeedbackSection 
          :rating="feedbackRating" 
          :submitted="feedbackSubmitted"
          :submitting="submittingFeedback"
          @update:rating="feedbackRating = $event"
          @submit="submitFeedback"
        />
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
  const isGeneratingAdvice = ref(false)
  const advice = ref(props.moodEntry.advice || '') // Cargar consejo existente
  const adviceError = ref(false)
  const feedbackRating = ref(props.moodEntry.feedback_rating || 0) // Cargar rating existente
  const feedbackSubmitted = ref(!!props.moodEntry.feedback_date) // Si ya hay fecha de feedback
  const submittingFeedback = ref(false)
  
  // Computed
  const adviceParagraphs = computed(() => {
    return advice.value ? advice.value.split('\n\n').filter(p => p.trim()) : []
  })
  
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
  
  // Emits
  const emit = defineEmits(['advice-generated', 'feedback-submitted'])
  
  // Métodos
  const goToAdvice = () => {
    currentStep.value = 'advice'
    if (!advice.value) {
      generateAdvice()
    }
  }
  
  const goToFeedback = () => {
    currentStep.value = 'feedback'
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
          entryId: props.moodEntry.id
        }
      })
      
      advice.value = response.data.advice
      
      // Actualizar técnicas si vienen nuevas del servidor
      if (response.data.recommended_techniques?.length > 0) {
        recommendedTechniques.value = response.data.recommended_techniques
      }
      
      // Emitir evento para actualizar el mood entry en el componente padre
      emit('advice-generated', {
        advice: response.data.advice,
        techniques: response.data.recommended_techniques
      })
      
    } catch (error) {
      console.error('Error generando consejo:', error)
      adviceError.value = true
    } finally {
      isGeneratingAdvice.value = false
    }
  }
  
  const submitFeedback = async () => {
    submittingFeedback.value = true
    
    try {
      const response = await $fetch('/api/feedback/submit', {
        method: 'POST',
        body: {
          entryId: props.moodEntry.id,
          rating: feedbackRating.value,
          techniques: recommendedTechniques.value.map(t => t.id)
        }
      })
      
      feedbackSubmitted.value = true
      
      // Emitir evento para actualizar el mood entry en el componente padre
      emit('feedback-submitted', {
        rating: feedbackRating.value,
        submitted_at: response.data.submitted_at
      })
      
    } catch (error) {
      console.error('Error enviando feedback:', error)
      // Podrías mostrar un mensaje de error aquí
    } finally {
      submittingFeedback.value = false
    }
  }
  
  // Si ya hay consejo generado, saltar directamente al paso de feedback
  onMounted(async () => {
    // Determinar en qué paso empezar
    if (feedbackSubmitted.value) {
      currentStep.value = 'feedback'
      loadingTechniques.value = false
      return
    }
    
    if (advice.value) {
      currentStep.value = 'advice'
    }
    
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