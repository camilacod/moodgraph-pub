// app/composables/useEmotionAnalysis.ts - VERSIÓN HÍBRIDA
export const useEmotionAnalysis = () => {
    const analyzedEmotions = ref<Array<{label: string, score: number}>>([])
    const isAnalyzing = ref(false)
    const analysisError = ref('')
    const modelInfo = ref<any>(null)
  
    // URL de tu API local
    const API_BASE_URL = 'http://localhost:8000'
  
    const analyzeText = async (text: string) => {
      if (!text.trim()) {
        analysisError.value = 'Por favor escribe algo para analizar'
        return
      }
      
      if (text.trim().length < 3) {
        analysisError.value = 'El texto es muy corto. Escribe al menos 3 caracteres.'
        return
      }
      
      isAnalyzing.value = true
      analysisError.value = ''
      
      try {
        console.log('🔄 Enviando texto al modelo:', text.substring(0, 50))
        
        // Llamar a tu API FastAPI híbrida
        const response = await $fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            text: text
          }
        })
        
        console.log('✅ Respuesta del modelo:', response)
        
        // La nueva API híbrida siempre devuelve este formato
        if (response.success && response.emotions) {
          analyzedEmotions.value = response.emotions
          modelInfo.value = response.model_info
        } else {
          throw new Error('Respuesta inválida del modelo')
        }
        
      } catch (error: any) {
        console.error('❌ Error analizando emociones:', error)
        
        // Diferentes tipos de error
        if (error.message?.includes('fetch')) {
          analysisError.value = '🔗 No se pudo conectar con el modelo. ¿Está corriendo la API en el puerto 8000?'
        } else if (error.status === 400) {
          analysisError.value = '📝 Texto inválido. Intenta con algo más descriptivo.'
        } else if (error.status === 500) {
          analysisError.value = '🤖 Error en el modelo de IA. Intenta de nuevo en un momento.'
        } else {
          analysisError.value = `⚠️ Error: ${error.message || 'Error desconocido'}`
        }
        
        // Limpiar resultados anteriores en caso de error
        analyzedEmotions.value = []
        modelInfo.value = null
      } finally {
        isAnalyzing.value = false
      }
    }
  
    const translateEmotion = (label: string): string => {
      const translations: Record<string, string> = {
        // Emociones básicas (ambos modelos)
        "joy": "Alegría",
        "sadness": "Tristeza", 
        "anger": "Enojo",
        "fear": "Miedo",
        "surprise": "Sorpresa",
        "disgust": "Disgusto",
        
        // Fallbacks (se filtran automáticamente en la API)
        "others": "Otras",
        "other": "Otra",
        "error": "Error",
        "unknown": "Desconocida"
      }
      return translations[label] || label
    }
  
    const getEmotionColor = (label: string): string => {
      const colors: Record<string, string> = {
        // Emociones básicas
        "joy": "#27ae60",       // Verde alegre
        "sadness": "#3498db",   // Azul tristeza
        "anger": "#e74c3c",     // Rojo enojo
        "fear": "#8e44ad",      // Morado miedo
        "surprise": "#f39c12",  // Naranja sorpresa
        "disgust": "#7f8c8d",   // Gris disgusto
        

        // Fallbacks (raramente se muestran gracias al filtro en API)
        "others": "#95a5a6",
        "other": "#95a5a6",
        "error": "#e74c3c",
        "unknown": "#95a5a6"
      }
      return colors[label] || "#9ca3af"
    }
  
    const getEmotionEmoji = (label: string): string => {
      const emojis: Record<string, string> = {
        // Emociones básicas
        "joy": "😊",
        "sadness": "😢",
        "anger": "😠",
        "fear": "😨",
        "surprise": "😮",
        "disgust": "🤢",
        // Fallbacks
        "others": "😐",
        "other": "😐",
        "error": "⚠️",
        "unknown": "❓"
      }
      return emojis[label] || "🤖"
    }
  
    const resetAnalysis = () => {
      analyzedEmotions.value = []
      analysisError.value = ''
      modelInfo.value = null
    }
  
    // Verificar si la API está disponible
    const checkApiHealth = async () => {
      try {
        const health = await $fetch(`${API_BASE_URL}/health`)
        return health.status === 'ok'
      } catch {
        return false
      }
    }
  
    // Obtener información del modelo actual
    const getModelInfo = async () => {
      try {
        const info = await $fetch(`${API_BASE_URL}/model-info`)
        return info
      } catch {
        return null
      }
    }
  
    return {
      // Estados reactivos (readonly para evitar mutaciones externas)
      analyzedEmotions: readonly(analyzedEmotions),
      isAnalyzing: readonly(isAnalyzing),
      analysisError: readonly(analysisError),
      modelInfo: readonly(modelInfo),
      
      // Métodos
      analyzeText,
      translateEmotion,
      getEmotionColor,
      getEmotionEmoji,
      resetAnalysis,
      checkApiHealth,
      getModelInfo
    }
  }