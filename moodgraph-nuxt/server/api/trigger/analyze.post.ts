export default defineEventHandler(async (event) => {
  console.log('🔍 Analizando trigger automático...')
  
  try {
    const body = await readBody(event)
    const { text, triggerTypes } = body

    // Validaciones
    if (!text || !text.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Texto requerido para análisis'
      })
    }

    if (!triggerTypes || !Array.isArray(triggerTypes)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tipos de trigger requeridos'
      })
    }

    const config = useRuntimeConfig()
    
    if (!config.openaiApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'API Key de OpenAI no configurada'
      })
    }

    // Crear prompt para análisis de trigger
    const systemPrompt = `Eres un experto en psicología que analiza texto emocional para identificar los desencadenantes o triggers de las emociones.

CATEGORÍAS DE TRIGGERS DISPONIBLES:
${triggerTypes.map(type => `- ${type}`).join('\n')}

INSTRUCCIONES:
- Analiza el texto y identifica el principal desencadenante emocional
- Clasifica el trigger en UNA de las categorías disponibles
- Proporciona una descripción específica del trigger detectado
- Responde SOLO con JSON válido, sin explicaciones adicionales

FORMATO DE RESPUESTA:
{
  "trigger": "descripción específica del trigger detectado",
  "type": "una de las categorías disponibles",
  "confidence": "alto/medio/bajo"
}`

    const userPrompt = `Analiza este texto emocional y detecta el principal desencadenante:

"${text}"

Identifica qué situación o factor causó estos sentimientos y clasifícalo en una de las categorías disponibles.`

    console.log('🤖 Enviando análisis a OpenAI...')

    // Llamada a OpenAI
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4o-mini',
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
        max_tokens: 200,
        temperature: 0.3 // Baja temperatura para respuestas más consistentes
      }
    })

    const aiResponse = response.choices[0].message.content

    // Intentar parsear respuesta JSON
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('❌ Error parseando respuesta de OpenAI:', aiResponse)
      throw createError({
        statusCode: 500,
        statusMessage: 'Respuesta inválida del modelo de IA'
      })
    }

    // Validar respuesta
    if (!parsedResponse.trigger || !parsedResponse.type) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Respuesta incompleta del modelo de IA'
      })
    }

    // Verificar que el tipo esté en las opciones válidas
    if (!triggerTypes.includes(parsedResponse.type)) {
      console.warn('⚠️ Tipo de trigger no válido:', parsedResponse.type)
      // Usar el primer tipo como fallback
      parsedResponse.type = triggerTypes[0]
    }

    console.log('✅ Trigger detectado:', parsedResponse.trigger)
    console.log('🏷️ Tipo:', parsedResponse.type)

    return {
      success: true,
      trigger: parsedResponse.trigger,
      type: parsedResponse.type,
      confidence: parsedResponse.confidence || 'medio'
    }

  } catch (error: any) {
    console.error('❌ Error en análisis de trigger:', error)
    
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