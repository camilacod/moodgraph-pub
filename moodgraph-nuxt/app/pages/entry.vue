<template>
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-sage-800">Nueva Entrada</h3>
          <div v-if="modelInfo" class="text-xs text-sage-500 bg-sage-50 px-2 py-1 rounded">
            IA: {{ modelInfo.name }}
          </div>
        </div>
        
        <div class="space-y-6">
          <!-- Área de texto principal -->
          <div>
            <label class="block text-sm font-medium text-sage-700 mb-2">
              ¿Cómo te sientes ahora mismo?
            </label>
            <textarea 
              v-model="newEntry.content"
              placeholder="Tómate tu tiempo para expresar tus pensamientos y sentimientos... Mientras más describas, mejor será el análisis de emociones."
              rows="5"
              class="w-full p-4 border border-sage-200 rounded-xl resize-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
              :class="{ 'border-red-300 focus:ring-red-500': analysisError }"
            ></textarea>
            
            <!-- Contador de caracteres -->
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-sage-500">
                {{ newEntry.content.length }} caracteres
              </span>
              <span v-if="newEntry.content.length < 10" class="text-xs text-amber-600">
                💡 Escribe más para un mejor análisis
              </span>
            </div>
            
            <!-- Botones de análisis -->
            <div class="mt-3 flex items-center justify-between">
              <button 
                @click="analyzeText(newEntry.content)"
                class="px-4 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isAnalyzing || newEntry.content.trim().length < 3"
              >
                <Icon name="lucide:brain" class="w-4 h-4" v-if="!isAnalyzing" />
                <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span v-if="!isAnalyzing">Analizar emociones con IA</span>
                <span v-else>Analizando...</span>
              </button>
              
              <button 
                v-if="analyzedEmotions.length > 0"
                @click="resetAnalysis"
                class="px-3 py-2 text-sage-600 hover:text-sage-800 transition-colors"
                title="Limpiar análisis"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Error de análisis -->
            <div v-if="analysisError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-600 text-sm flex items-start">
                <Icon name="lucide:alert-circle" class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                {{ analysisError }}
              </p>
            </div>
          </div>
          
          <!-- Resultados del análisis de emociones -->
          <div v-if="analyzedEmotions.length > 0" class="bg-gradient-to-r from-sage-50 to-lavender-50 rounded-xl p-5 border border-sage-200">
            <h4 class="text-sm font-medium text-sage-800 mb-4 flex items-center">
              <Icon name="lucide:sparkles" class="w-4 h-4 mr-2" />
              Emociones detectadas por tu modelo fine-tuneado
            </h4>
            
            <div class="space-y-4">
              <div v-for="(emotion, index) in analyzedEmotions" :key="emotion.label" 
                   class="emotion-result"
                   :class="{ 'opacity-90': index > 0 }"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium text-sage-700 flex items-center">
                    <span class="text-lg mr-2">{{ getEmotionEmoji(emotion.label) }}</span>
                    {{ translateEmotion(emotion.label) }}
                  </span>
                  <span class="text-sage-700 font-semibold">{{ Math.round(emotion.score * 100) }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress transition-all duration-500 ease-out" 
                    :style="`width: ${Math.round(emotion.score * 100)}%; background-color: ${getEmotionColor(emotion.label)}`"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-sage-200 flex justify-between items-center text-xs text-sage-500">
              <span>Modelo: {{ modelInfo?.name || 'Fine-tuned Spanish Emotions' }}</span>
              <span>{{ modelInfo?.total_emotions_detected || analyzedEmotions.length }} emociones analizadas</span>
            </div>
          </div>
  
          <!-- Otros campos del formulario -->
          <div>
            <label class="block text-sm font-medium text-sage-700 mb-2">
              ¿Qué desencadenó estos sentimientos?
            </label>
            <input 
              v-model="newEntry.trigger"
              placeholder="Ej: Estrés laboral, tiempo en familia, ejercicio, conversación..."
              class="w-full p-4 border border-sage-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>
  
          <div>
            <label class="block text-sm font-medium text-sage-700 mb-2">
              Nivel de Energía (1-10)
            </label>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-sage-600">Bajo</span>
              <input 
                v-model="newEntry.energy"
                type="range" 
                min="1" 
                max="10" 
                class="flex-1 h-2 bg-sage-200 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-sm text-sage-600">Alto</span>
              <span class="text-lg font-semibold text-sage-800 w-8 text-center">{{ newEntry.energy }}</span>
            </div>
          </div>
  
          <!-- Botones de acción -->
          <div class="flex space-x-4 pt-4">
            <button 
              @click="saveEntry"
              class="flex-1 py-3 bg-gradient-to-r from-sage-500 to-lavender-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newEntry.content.trim()"
            >
              <Icon name="lucide:save" class="w-5 h-5 inline mr-2" />
              Guardar Entrada
            </button>
            <NuxtLink 
              to="/"
              class="px-6 py-3 border border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 transition-colors text-center flex items-center"
            >
              <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
              Cancelar
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
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
  
  const newEntry = ref({
    content: '',
    trigger: '',
    energy: 5
  })
  
  const saveEntry = () => {
    if (newEntry.value.content.trim()) {
      const entryData = { 
        ...newEntry.value, 
        emotions: analyzedEmotions.value,
        modelInfo: modelInfo.value,
        timestamp: new Date().toISOString()
      }
      
      console.log('💾 Guardando entrada con emociones:', entryData)
      
      // TODO: Aquí conectarás con Supabase después
      
      // Reset form
      newEntry.value = { content: '', trigger: '', energy: 5 }
      resetAnalysis()
      
      // Redirigir al dashboard
      navigateTo('/')
    }
  }
  
  // Auto-analizar cuando el usuario para de escribir (opcional)
  const debouncedAnalyze = useDebounceFn(() => {
    if (newEntry.value.content.trim().length > 20) {
      analyzeText(newEntry.value.content)
    }
  }, 3000) // 3 segundos después de parar de escribir
  
  // watch(
  //   () => newEntry.value.content,
  //   () => {
  //     if (newEntry.value.content.trim().length > 20) {
  //       debouncedAnalyze()
  //     }
  //   }
  // )
  </script>
  
  <style scoped>
  .progress-bar {
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s ease-out;
  }
  
  .emotion-result {
    transition: opacity 0.3s ease;
  }
  </style>