<template>
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <!-- Header con info del usuario -->
      <div class="max-w-4xl mx-auto mb-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Nueva Entrada</h1>
            <p class="text-gray-600">Hola {{ profile?.name || 'Usuario' }} 👋</p>
            <p class="text-sm text-gray-500">{{ userEmail }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500">Modelo de IA</p>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {{ modelType }}
              </span>
            </div>
            <button
              @click="logout"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
  
      <!-- Contenido principal -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          
          <!-- Pregunta principal -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">¿Cómo te sientes ahora mismo?</h2>
            
            <textarea
              v-model="entryText"
              @input="updateCharCount"
              class="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe cómo te sientes, qué está pasando en tu día, tus emociones..."
              maxlength="500"
            ></textarea>
            
            <div class="flex justify-between items-center mt-2">
              <p class="text-sm text-gray-500">{{ charCount }} caracteres</p>
              
              <!-- Botón Analizar -->
              <button
                @click="analyzeEmotions"
                :disabled="!entryText.trim() || isAnalyzing || charCount < 3"
                class="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
                </svg>
                <span v-if="!isAnalyzing">Analizar emociones con IA</span>
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
                <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
                </svg>
                Emociones detectadas
              </h3>
              
              <div v-if="modelInfo" class="text-sm text-gray-500">
                <span>Modelo: {{ modelInfo.name }}</span>
                <span class="mx-2">•</span>
                <span>{{ modelInfo.total_emotions_detected }} emociones analizadas</span>
              </div>
            </div>
  
            <!-- Lista de emociones -->
            <div class="space-y-3 mb-6">
              <div 
                v-for="(emotion, index) in analyzedEmotions" 
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
  
            <!-- Trigger y contexto -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-800 mb-3">¿Qué desencadenó estos sentimientos?</h4>
              <textarea
                v-model="triggerText"
                class="w-full h-20 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Ej: Estrés laboral, tiempo en familia, ejercicio, conversación..."
                maxlength="200"
              ></textarea>
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
                <div class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold min-w-[2rem] text-center">
                  {{ energyLevel }}
                </div>
              </div>
            </div>
  
            <!-- Botones de acción -->
            <div class="flex space-x-4">
              <!-- Botón Guardar Entrada -->
              <button
                @click="saveEntry"
                :disabled="!triggerText.trim() || isSaving"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <svg v-if="!isSaving" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span v-if="!isSaving">Guardar Entrada</span>
                <span v-else>Guardando...</span>
              </button>
  
              <!-- Botón Obtener Consejo (ACTUALIZADO) -->
              <button
                @click="getAdvice"
                :disabled="analyzedEmotions.length === 0 || isGeneratingAdvice"
                class="bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="!isGeneratingAdvice" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
                </svg>
                <span v-if="!isGeneratingAdvice">Obtener Consejo</span>
                <span v-else>Generando consejo...</span>
              </button>
            </div>
          </div>
  
          <!-- Mensaje de éxito -->
          <div v-if="saveSuccess" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p class="text-green-800 text-sm flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              ¡Entrada guardada exitosamente! Puedes seguir analizando más textos.
            </p>
          </div>

          <!-- NUEVA SECCIÓN: Mostrar consejo generado -->
          <div v-if="hasAdvice || adviceError" class="mb-8">
            <!-- Error del consejo -->
            <div v-if="adviceError" class="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p class="text-red-800 text-sm">{{ adviceError }}</p>
            </div>

            <!-- Consejo generado -->
            <div v-if="hasAdvice" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.869-1.5z"></path>
                </svg>
                Consejo personalizado
              </h4>
              <div class="text-blue-800 leading-relaxed whitespace-pre-line">
                {{ advice }}
              </div>
            </div>
          </div>
  
          <!-- Botón Reset -->
          <div v-if="analyzedEmotions.length > 0" class="text-center">
            <button
              @click="resetAll"
              class="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Analizar nuevo texto
            </button>
          </div>
  
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
    resetAnalysis 
  } = useEmotionAnalysis()

  // NUEVO: Composable para consejos
  const { 
    advice, 
    isGenerating: isGeneratingAdvice, 
    error: adviceError,
    hasAdvice,
    generateAdvice,
    resetAdvice 
  } = useAdvice()
  
  // Estado local
  const entryText = ref('')
  const charCount = ref(0)
  const triggerText = ref('')
  const energyLevel = ref(5)
  const isSaving = ref(false)
  const saveSuccess = ref(false)
  const modelType = ref('spanish-emotions-base')

  // NUEVO: Variable para guardar el ID de la entrada
  const savedEntryId = ref<string | null>(null)
  
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
  
  // Guardar entrada en Supabase (MODIFICADO para capturar ID)
  const saveEntry = async () => {
    if (!user.value || !triggerText.value.trim() || analyzedEmotions.value.length < 3) {
      return
    }
  
    isSaving.value = true
    saveSuccess.value = false
  
    try {
      // Preparar datos de la entrada
      const entryData: CreateMoodEntry = {
        trigger: triggerText.value.trim(),
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
      
      // NUEVO: Guardar el ID para usarlo en el consejo
      savedEntryId.value = data.id
      
      // Mostrar mensaje de éxito
      saveSuccess.value = true
      
      // Auto-hide después de 3 segundos
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
  
    } catch (error: any) {
      console.error('❌ Error guardando entrada:', error)
      // TODO: Mostrar error al usuario
    } finally {
      isSaving.value = false
    }
  }

  // NUEVA: Función para obtener consejo
  const getAdvice = async () => {
    if (analyzedEmotions.value.length === 0) {
      return
    }

    const entryData = {
      emotions: analyzedEmotions.value.map(emotion => ({
        ...emotion,
        translated: translateEmotion(emotion.label)
      })),
      trigger: triggerText.value,
      energyLevel: energyLevel.value
    }
    
    await generateAdvice(entryData, profile.value, savedEntryId.value || undefined)
  }
  
  // Reset todo (MODIFICADO para incluir advice)
  const resetAll = () => {
    entryText.value = ''
    triggerText.value = ''
    energyLevel.value = 5
    charCount.value = 0
    saveSuccess.value = false
    savedEntryId.value = null
    resetAnalysis()
    resetAdvice() // NUEVO
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
    background: #7c3aed;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #7c3aed;
    cursor: pointer;
    border: none;
  }
  </style>