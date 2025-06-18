
export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event)
      const { entryData, userProfile, entryId } = body
  
      // Validaciones
      if (!entryData || !userProfile) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Datos insuficientes para generar consejo'
        })
      }
  
      const config = useRuntimeConfig()
      
      if (!config.openaiApiKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'API Key de OpenAI no configurada'
        })
      }
  
      // Crear el prompt contextualizado
      const systemPrompt = `Eres un asistente especializado en bienestar mental y apoyo emocional. Tu objetivo es brindar consejos empáticos, prácticos y positivos basados en el análisis emocional del usuario.
  
  DIRECTRICES:
  - Sé empático y comprensivo
  - Ofrece consejos prácticos y realizables
  - Mantén un tono cálido pero profesional
  - Enfócate en estrategias de afrontamiento saludables
  - Respuestas de 2-4 párrafos máximo
  - Si detectas señales de crisis, sugiere buscar ayuda profesional`
  
      // Construir información del usuario para contexto
      const userContext = []
      if (userProfile.age) userContext.push(`${userProfile.age} años`)
      if (userProfile.gender && userProfile.gender !== 'prefiero_no_decir') {
        userContext.push(`género ${userProfile.gender}`)
      }
      if (userProfile.psychological_conditions?.length > 0) {
        userContext.push(`condiciones relevantes: ${userProfile.psychological_conditions.join(', ')}`)
      }
  
      // Preparar información de emociones
      const emotionsText = entryData.emotions
        .map((emotion: any) => `${emotion.translated || emotion.label}: ${Math.round(emotion.score * 100)}%`)
        .join(', ')
  
      const userPrompt = `Usuario${userContext.length > 0 ? ` (${userContext.join(', ')})` : ''} reporta:
  
  🎯 SITUACIÓN: "${entryData.trigger}"
  🎭 EMOCIONES DETECTADAS: ${emotionsText}
  ⚡ NIVEL DE ENERGÍA: ${entryData.energyLevel}/10
  
  Por favor, proporciona un consejo personalizado que ayude a esta persona a manejar sus emociones actuales y la situación que las desencadenó.`
  
      console.log('🤖 Generando consejo con OpenAI...')
  
      // Llamada a OpenAI
      const response = await $fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'gpt-4.1-mini-2025-04-14',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        }
      })
  
      const advice = response.choices[0].message.content
  
      // Si se proporciona entryId, actualizar la entrada en Supabase
      if (entryId) {
        const supabase = serverSupabaseServiceRole(event)
        
        const { error: updateError } = await supabase
          .from('mood_entries')
          .update({
            advice: advice,
            advice_generated_at: new Date().toISOString()
          })
          .eq('id', entryId)
  
        if (updateError) {
          console.error('Error actualizando entrada:', updateError)
          // No lanzamos error aquí para no fallar la generación del consejo
        } else {
          console.log('✅ Consejo guardado en base de datos')
        }
      }
  
      return {
        success: true,
        advice: advice,
        generated_at: new Date().toISOString()
      }
  
    } catch (error: any) {
      console.error('❌ Error generando consejo:', error)
      
      // Manejo específico de errores de OpenAI
      if (error.status === 401) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Error de autenticación con OpenAI'
        })
      } else if (error.status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Límite de API alcanzado. Intenta de nuevo en unos minutos.'
        })
      } else if (error.status === 500) {
        throw createError({
          statusCode: 502,
          statusMessage: 'Error en el servicio de OpenAI'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Error interno del servidor'
      })
    }
  })