export const useTriggerAnalysis = () => {
    const detectedTrigger = ref('')
    const triggerType = ref('')
    const isAnalyzing = ref(false)
    const error = ref('')


    const triggerTypes = {
        'relaciones': 'Relaciones Personales',
        'salud mental': 'Salud Mental y Emocional',
        'salud fisica': 'Salud Física y Cuerpo',
        'trabajo': 'Trabajo y Propósito',
        'finanzas': 'Finanzas y Seguridad Material',
        'espiritualidad': 'Espiritualidad y Sentido de Vida',
        'tiempo libre': 'Tiempo Libre y Disfrute',
        'entorno': 'Entorno y Contexto',
        'identidad': 'Identidad y Expresión Personal',
        'amor propio': 'Amor Propio y Relación Contigo Misma'
      };

    const analyzeTrigger = async (entryText: string) => {
        if (!entryText.trim()) {
            error.value = 'No hay texto para analizar'
            return
          }
          isAnalyzing.value = true
          error.value = ''
          detectedTrigger.value = ''
          triggerType.value = ''
          try {
            console.log('🔍 Analizando trigger automáticamente...')
            type TriggerResponse = {
                success: boolean
                trigger: string
                type: string
              }
      
            const response = await $fetch<TriggerResponse>('/api/trigger/analyze', {
              method: 'POST',
              body: {
                text: entryText,
                triggerTypes: Object.keys(triggerTypes) 
              }
            })
      
            if (response.success) {
              detectedTrigger.value = response.trigger
              triggerType.value = response.type
              console.log('✅ Trigger detectado:', response.trigger)
            } else {
              throw new Error('Respuesta inválida del servidor')
            }
      
          } catch (err: any) {
            console.error('❌ Error analizando trigger:', err)
      
            if (err.status === 429) {
              error.value = '⏰ Límite de solicitudes alcanzado'
            } else if (err.status === 500) {
              error.value = '🔧 Error en el servidor'
            } else {
              error.value = '⚠️ Error detectando trigger automático'
            }
          } finally {
            isAnalyzing.value = false
          }
        }

        
        
    


    const resetTriggerAnalysis = () => {
        detectedTrigger.value = ''
        triggerType.value = ''
        error.value = ''
        isAnalyzing.value = false
    }



    return {
        detectedTrigger : readonly(detectedTrigger),
        triggerType : readonly(triggerType),
        isAnalyzing : readonly(isAnalyzing),
        error : readonly(error),
        triggerTypes,
        analyzeTrigger,
        resetTriggerAnalysis

    }
        

}
        







    