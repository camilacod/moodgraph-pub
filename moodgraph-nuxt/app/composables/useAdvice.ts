// app/composables/useAdvice.ts
export const useAdvice = () => {
    const isGenerating = ref(false)
    const advice = ref('')
    const error = ref('')
    const generatedAt = ref<string | null>(null)
  
    const generateAdvice = async (entryData: any, userProfile: any, entryId?: string) => {
      isGenerating.value = true
      error.value = ''
      advice.value = ''
      
      try {
        console.log('🤖 Solicitando consejo a OpenAI...')
        
        const response = await $fetch('/api/advice/generate', {
          method: 'POST',
          body: {
            entryData,
            userProfile,
            entryId
          }
        })
  
        if (response.success) {
          advice.value = response.advice
          generatedAt.value = response.generated_at
          console.log('✅ Consejo generado exitosamente')
        } else {
          throw new Error('Respuesta inválida del servidor')
        }
  
      } catch (err: any) {
        console.error('❌ Error generando consejo:', err)
        
        // Manejo de diferentes tipos de error
        if (err.status === 429) {
          error.value = '⏰ Has alcanzado el límite de solicitudes. Intenta de nuevo en unos minutos.'
        } else if (err.status === 500) {
          error.value = '🔧 Error en el servidor. Intenta de nuevo más tarde.'
        } else if (err.status === 502) {
          error.value = '🤖 El servicio de IA está temporalmente no disponible.'
        } else if (err.message?.includes('fetch')) {
          error.value = '🔗 Error de conexión. Verifica tu internet.'
        } else {
          error.value = err.data?.message || err.message || '⚠️ Error desconocido al generar consejo'
        }
      } finally {
        isGenerating.value = false
      }
    }
  
    const resetAdvice = () => {
      advice.value = ''
      error.value = ''
      generatedAt.value = null
    }
  
    // Función para guardar feedback del consejo
    const saveFeedback = async (entryId: string, rating: number, comment?: string) => {
      const supabase = useSupabaseClient()
      
      try {
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update({
            feedback_rating: rating,
            feedback_comment: comment,
            feedback_date: new Date().toISOString()
          })
          .eq('id', entryId)
  
        if (updateError) throw updateError
        
        return { success: true }
      } catch (err: any) {
        console.error('Error guardando feedback:', err)
        return { success: false, error: err.message }
      }
    }
  
    return {
      // Estados reactivos (readonly para evitar mutaciones externas)
      advice: readonly(advice),
      isGenerating: readonly(isGenerating),
      error: readonly(error),
      generatedAt: readonly(generatedAt),
      
      // Computed
      hasAdvice: computed(() => !!advice.value),
      
      // Métodos
      generateAdvice,
      resetAdvice,
      saveFeedback
    }
  }