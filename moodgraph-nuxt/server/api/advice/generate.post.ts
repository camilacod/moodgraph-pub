
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'


export default defineEventHandler(async (event) => {
  // 🔍 DEBUG: Verificar variables de entorno
  console.log('🔍 Variables de entorno disponibles:', {
    openaiApiKey: !!useRuntimeConfig().openaiApiKey,
    supabaseUrl: !!useRuntimeConfig().public.supabaseUrl,
    supabaseAnonKey: !!useRuntimeConfig().public.supabaseAnonKey,
    nodeEnv: process.env.NODE_ENV
  })

  try {
    const body = await readBody(event)
    const { entryData, userProfile, entryId, selectedTechnique } = body

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

    // NUEVO: Usar técnica específica seleccionada o buscar recomendadas
    let targetTechnique: any = null
    let mainEmotions: string[] = []
    
    try {
      console.log('🔍 Intentando conectar con Supabase...')
      
      let supabase
      try {
        supabase = serverSupabaseServiceRole(event)
        console.log('✅ Usando serverSupabaseServiceRole')
      } catch (serviceRoleError) {
        console.log('⚠️ ServiceRole falló, intentando client normal...')
        supabase = await serverSupabaseClient(event)
        console.log('✅ Usando serverSupabaseClient')
      }
      
      // Extraer emociones principales (top 2)
      mainEmotions = entryData.emotions
        .slice(0, 2) // Top 2 emociones más fuertes
        .map((emotion: any) => emotion.label.toLowerCase())
      
      console.log('🎯 Emociones principales detectadas:', mainEmotions)
      
      // Si se seleccionó una técnica específica, usarla
      if (selectedTechnique) {
        targetTechnique = selectedTechnique
        console.log('🎯 Usando técnica específica seleccionada:', selectedTechnique.name)
      } else {
        // Buscar técnicas recomendadas basadas en las emociones (fallback)
        const { data: techniques, error: techniqueError } = await supabase
          .from('therapeutic_techniques')
          .select('*')
          .overlaps('target_emotions', mainEmotions)
          .eq('evidence_level', 'high')
          .lte('difficulty_level', 3)
          .order('difficulty_level', { ascending: true })
          .limit(1) // Solo la primera técnica

        if (techniqueError) {
          console.error('⚠️ Error obteniendo técnicas:', techniqueError)
        } else if (techniques && techniques.length > 0) {
          targetTechnique = techniques[0]
          console.log('💡 Técnica encontrada automáticamente:', targetTechnique.name)
        }
      }
    } catch (techniquesFetchError) {
      console.error('⚠️ Error conectando con BD para técnicas:', techniquesFetchError)
    }

    // NUEVO: Crear prompt enriquecido con técnica específica
    let techniqueSection = ''
    if (targetTechnique) {
      techniqueSection = `

🎯 TÉCNICA TERAPÉUTICA ESPECÍFICA SELECCIONADA:
Nombre: ${targetTechnique.name}
Categoría: ${targetTechnique.category.replace('_', ' ')}
Descripción: ${targetTechnique.description}
Instrucciones detalladas: ${targetTechnique.instructions}
Nivel de evidencia: ${targetTechnique.evidence_level}
Duración estimada: ${targetTechnique.duration_minutes} minutos
Nivel de dificultad: ${targetTechnique.difficulty_level}/5
Emociones objetivo: ${targetTechnique.target_emotions.join(', ')}
`
    }

    // ACTUALIZADO: Prompt del sistema mejorado para técnica específica
    const systemPrompt = `Eres un coach de bienestar mental especializado que personaliza técnicas terapéuticas para situaciones específicas. Tu objetivo es adaptar la técnica seleccionada al contexto emocional y situación particular del usuario.

DIRECTRICES PARA EL COACH IA:
- Adapta la técnica específica proporcionada al trigger y emociones del usuario
- Explica cómo aplicar la técnica paso a paso para su situación particular
- Conecta la técnica con su experiencia emocional actual
- Mantén un tono cálido, empático pero profesional
- Estructura tu respuesta de forma clara y accionable
- Explica brevemente POR QUÉ esta técnica es efectiva para su situación específica
- Personaliza el lenguaje según el perfil del usuario
- Máximo 3-4 párrafos enfocados en la aplicación práctica
- Si detectas crisis severa, recomienda ayuda profesional inmediata`

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

    // ACTUALIZADO: Prompt del usuario enriquecido con técnica específica
    const userPrompt = `CONTEXTO DEL USUARIO:
Usuario${userContext.length > 0 ? ` (${userContext.join(', ')})` : ''} reporta:

🎯 SITUACIÓN DESENCADENANTE: "${entryData.trigger}"
🎭 EMOCIONES DETECTADAS: ${emotionsText}
⚡ NIVEL DE ENERGÍA: ${entryData.energyLevel}/10
${techniqueSection}

INSTRUCCIONES PARA EL COACH:
Como coach personal especializado, proporciona un consejo personalizado que:
1. Reconozca y valide las emociones actuales del usuario
2. Adapte la técnica específica proporcionada arriba a su situación particular
3. Explique cómo aplicar cada paso de la técnica considerando su trigger específico
4. Explique brevemente por qué esta técnica es efectiva para su estado emocional actual
5. Dé pasos claros y específicos que pueda seguir inmediatamente
6. Sea alentador y empático en el tono

${targetTechnique ? 
'IMPORTANTE: Basa tu consejo completamente en la técnica proporcionada arriba, adaptando sus instrucciones específicamente a la situación desencadenante y emociones del usuario.' : 
'IMPORTANTE: Como no hay técnica específica disponible, usa principios generales de terapia cognitivo-conductual y mindfulness adaptados a su situación.'
}`

    console.log('🤖 Generando consejo personalizado con técnicas específicas...')

    // Llamada a OpenAI (misma estructura que antes)
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4o-mini', // Modelo actualizado
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
        max_tokens: 600, // Aumentado para incluir técnicas
        temperature: 0.7
      }
    })

    const advice = response.choices[0].message.content

    // ACTUALIZADO: Si se proporciona entryId, actualizar la entrada en Supabase (misma estructura que antes)
    if (entryId) {
      const supabase = await serverSupabaseClient(event) // CAMBIADO: usar serverSupabaseClient
      
      const { error: updateError } = await supabase
        .from('mood_entries')
        .update({
          advice: advice,
          advice_generated_at: new Date().toISOString(),
          recommended_techniques: targetTechnique ? [targetTechnique.id] : [] // NUEVO: Guardar ID de técnica específica
        })
        .eq('id', entryId)

      if (updateError) {
        console.error('Error actualizando entrada:', updateError)
        // No lanzamos error aquí para no fallar la generación del consejo
      } else {
        console.log('✅ Consejo y técnicas guardados en base de datos')
      }
    }

    // ACTUALIZADO: Retorna tanto el consejo como la técnica específica
    return {
      success: true,
      data: {
        advice: advice,
        target_technique: targetTechnique, // NUEVO: Técnica específica usada
        emotions_analyzed: mainEmotions,
        generated_at: new Date().toISOString()
      }
    }

  } catch (error: any) {
    console.error('❌ Error generando consejo:', error)
    
    // Manejo específico de errores de OpenAI (mismo que antes)
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