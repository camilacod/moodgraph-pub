<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
    <!-- Header con info del usuario -->
    <div class="max-w-8xl mx-auto mb-6">
      <div class="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Nueva Entrada</h1>
          <p class="text-gray-600">Hola {{ profile?.name || 'Usuario' }} 👋</p>
          <p class="text-sm text-gray-500">{{ userEmail }}</p>
        </div>
       
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-8xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        
        <!-- Pregunta principal -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">¿Cómo te sientes?</h2>
          
          <textarea
            v-model="entryText"
            @input="updateCharCount"
            class="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Describe cómo te sientes, qué está pasando en tu día, tus emociones..."
            maxlength="500"
          ></textarea>
          
          <div class="flex justify-between items-center mt-2">
            <p class="text-sm text-gray-500">{{ charCount }} caracteres</p>
            
            <!-- Botón Analizar -->
            <button
              @click="analyzeEmotions"
              :disabled="!entryText.trim() || isAnalyzing || charCount < 15"
              class="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
              </svg>
              <span v-if="!isAnalyzing">Analizar emociones</span>
              <span v-else>Analizando...</span>
            </button>
          </div>
        </div>

        <!-- Error de análisis -->
        <div v-if="analysisError" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-red-800 text-sm">{{ analysisError }}</p>
        </div>

        <!-- Resultados del análisis -->
        <div v-if="analyzedEmotions.length > 0" class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
              </svg>
              Emociones detectadas
            </h3>
            
            <!-- <div v-if="modelInfo" class="text-sm text-gray-500">
              <span>Modelo: {{ modelInfo.name }}</span>
              <span class="mx-2">•</span>
              <span>{{ modelInfo.total_emotions_detected }} emociones analizadas</span>
            </div> -->
          </div>

          <!-- Lista de emociones -->
          <div class="space-y-3 mb-6">
            <div 
              v-for="(emotion, index) in filteredEmotions" 
              :key="index"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getEmotionEmoji(emotion.label) }}</span>
                <span class="font-medium text-gray-800">{{ translateEmotion(emotion.label) }}</span>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :style="{ 
                      width: `${Math.round(emotion.score * 100)}%`,
                      backgroundColor: getEmotionColor(emotion.label)
                    }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-600 w-8">{{ Math.round(emotion.score * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- NUEVO: Trigger detectado automáticamente -->
          <div v-if="detectedTrigger" class="mb-6">
            <h4 class="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
              </svg>
              Trigger Detectado 
            </h4>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="flex items-center space-x-2 mb-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ triggerTypes[triggerType] }}
                </span>
              </div>
              <p class="text-gray-800 font-medium">{{ detectedTrigger }}</p>
            </div>
          </div>

          <!-- Indicador de análisis de trigger en progreso -->
          <div v-if="isAnalyzingTrigger" class="mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div class="flex items-center space-x-3">
                <svg class="animate-spin w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span class="text-gray-700">Detectando trigger automáticamente...</span>
              </div>
            </div>
          </div>

          <!-- Nivel de intensidad -->
          <div class="mb-8">
            <h4 class="text-md font-semibold text-gray-800 mb-3">Nivel de Energía (1-10)</h4>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">Bajo</span>
              <div class="flex-1">
                <input
                  v-model.number="energyLevel"
                  type="range"
                  min="1"
                  max="10"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <span class="text-sm text-gray-500">Alto</span>
              <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold min-w-[2rem] text-center">
                {{ energyLevel }}
              </div>
            </div>
          </div>

          <!-- Botón de acción -->
          <div class="flex justify-center">
            <!-- Botón Guardar Entrada (solo este) -->
            <button
              @click="saveEntry"
              :disabled="!detectedTrigger || isSaving || isAnalyzingTrigger"
              class="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg v-if="!isSaving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <span v-if="!isSaving">Guardar Entrada y Ver Técnicas</span>
              <span v-else>Guardando...</span>
            </button>
          </div>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="saveSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p class="text-green-800 text-sm flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            ¡Entrada guardada exitosamente! Cargando técnicas recomendadas...
          </p>
        </div>

        <!-- Botón Reset -->
        <div v-if="analyzedEmotions.length > 0 && !showAdviceFlow" class="text-center">
          <button
            @click="resetAll"
            class="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Analizar nuevo texto
          </button>
        </div>

      </div>

      <!-- NUEVO: Flujo de Consejo con Técnicas (reemplaza la sección anterior) -->
      <div v-if="showAdviceFlow && savedEntryId" class="mt-8">
        <AdviceFlow 
          :mood-entry="currentMoodEntry"
          :user-profile="profile"
          @advice-generated="handleAdviceGenerated"
          @feedback-submitted="handleFeedbackSubmitted"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateMoodEntry, EmotionData } from '~/types'

// Proteger página con middleware de autenticación
definePageMeta({
  middleware: 'auth'
})

// Composables
const { user, profile, userEmail, logout } = useAuth()
const { 
  analyzedEmotions, 
  isAnalyzing, 
  analysisError, 
  modelInfo, 
  analyzeText, 
  translateEmotion, 
  getEmotionColor, 
  getEmotionEmoji, 
  resetAnalysis,
  // NUEVO: Estados del análisis automático de triggers
  detectedTrigger,
  triggerType,
  isAnalyzingTrigger
} = useEmotionAnalysis()

// NUEVO: Acceso a tipos de triggers para mostrar en UI
const { triggerTypes } = useTriggerAnalysis()

// Estado local

// Filtrar emociones con al menos 20% de confianza (máximo 3)
const filteredEmotions = computed(() => {
  return analyzedEmotions.value
    .filter(emotion => emotion.score >= 0.2) // Solo emociones con al menos 20% de confianza
    .slice(0, 3) // Máximo 3 emociones
})
const entryText = ref('')
const charCount = ref(0)
const energyLevel = ref(5)
const isSaving = ref(false)
const saveSuccess = ref(false)
const modelType = ref('spanish-emotions-base')

// NUEVO: Estados para el flujo de consejo
const savedEntryId = ref<string | null>(null)
const showAdviceFlow = ref(false)
const currentMoodEntry = ref(null)

// Supabase client
const supabase = useSupabaseClient()

// Actualizar contador de caracteres
const updateCharCount = () => {
  charCount.value = entryText.value.length
}

// Analizar emociones
const analyzeEmotions = async () => {
  await analyzeText(entryText.value)
}

// Guardar entrada en Supabase (ACTUALIZADO para auto-iniciar flujo)
const saveEntry = async () => {
  if (!user.value || !detectedTrigger.value || analyzedEmotions.value.length < 3) {
    return
  }

  isSaving.value = true
  saveSuccess.value = false

  try {
    // Preparar datos de la entrada
    const entryData: CreateMoodEntry = {
      trigger: detectedTrigger.value,
      trigger_type: triggerType.value,
      level: energyLevel.value,
      emocion1: {
        label: analyzedEmotions.value[0].label,
        score: analyzedEmotions.value[0].score,
        translated: translateEmotion(analyzedEmotions.value[0].label)
      },
      emocion2: {
        label: analyzedEmotions.value[1].label,
        score: analyzedEmotions.value[1].score,
        translated: translateEmotion(analyzedEmotions.value[1].label)
      },
      emocion3: {
        label: analyzedEmotions.value[2].label,
        score: analyzedEmotions.value[2].score,
        translated: translateEmotion(analyzedEmotions.value[2].label)
      },
      model_info: modelInfo.value
    }

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.value.id,
        ...entryData
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ Entrada guardada:', data)
    
    // Guardar el ID y la entrada completa para el flujo de consejo
    savedEntryId.value = data.id
    currentMoodEntry.value = data
    
    // Mostrar mensaje de éxito
    saveSuccess.value = true
    
    // AUTO-INICIAR el flujo de consejo después de 1 segundo
    setTimeout(() => {
      saveSuccess.value = false
      showAdviceFlow.value = true
    }, 1500)

  } catch (error: any) {
    console.error('❌ Error guardando entrada:', error)
    // TODO: Mostrar error al usuario
  } finally {
    isSaving.value = false
  }
}

// ELIMINAR: Función para iniciar el flujo de consejo (ya no es necesaria)
// const startAdviceFlow = () => {
//   if (savedEntryId.value && analyzedEmotions.value.length > 0) {
//     showAdviceFlow.value = true
//   }
// }

// ACTUALIZAR: Manejar cuando se genere el consejo (guardar en BD)
const handleAdviceGenerated = async (data) => {
  if (currentMoodEntry.value) {
    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('mood_entries')
        .update({
          advice: data.advice,
          advice_generated_at: new Date().toISOString(),
          recommended_techniques: data.techniques?.map(t => t.id) || []
        })
        .eq('id', currentMoodEntry.value.id)

      if (error) throw error

      // Actualizar localmente
      currentMoodEntry.value.advice = data.advice
      currentMoodEntry.value.advice_generated_at = new Date().toISOString()
      currentMoodEntry.value.recommended_techniques = data.techniques?.map(t => t.id) || []
      
      console.log('✅ Consejo generado y guardado en BD')
    } catch (error) {
      console.error('❌ Error guardando consejo en BD:', error)
    }
  }
}

// ACTUALIZAR: Manejar cuando se envíe el feedback (guardar en BD)
const handleFeedbackSubmitted = async (data) => {
  if (currentMoodEntry.value) {
    try {
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('mood_entries')
        .update({
          feedback_rating: data.rating,
          feedback_date: data.submitted_at
        })
        .eq('id', currentMoodEntry.value.id)

      if (error) throw error

      // Actualizar localmente
      currentMoodEntry.value.feedback_rating = data.rating
      currentMoodEntry.value.feedback_date = data.submitted_at
      
      console.log('✅ Feedback enviado y guardado en BD')
    } catch (error) {
      console.error('❌ Error guardando feedback en BD:', error)
    }
  }
}

// Reset todo (ACTUALIZADO)
const resetAll = () => {
  entryText.value = ''
  energyLevel.value = 5
  charCount.value = 0
  saveSuccess.value = false
  savedEntryId.value = null
  currentMoodEntry.value = null
  showAdviceFlow.value = false
  resetAnalysis()
}

// Inicializar contador
onMounted(() => {
  updateCharCount()
})
</script>

<style scoped>
/* Estilos para el slider */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #09b849;
  cursor: pointer;
  margin-top: -8px; /* Centers the thumb on the track */
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #09b849;
  cursor: pointer;
  border: none;
  transform: translateY(-50%);
}
/* Estilos para el track del slider */
.slider::-webkit-slider-runnable-track {
  background: linear-gradient(to right, #09b849, #09b849);
  border-radius: 0.25rem;
  height: 0.25rem;
}

.slider::-moz-range-track {
  background: linear-gradient(to right, #09b849, #09b849);
  border-radius: 0.25rem;
  height: 0.25rem;
}
</style>