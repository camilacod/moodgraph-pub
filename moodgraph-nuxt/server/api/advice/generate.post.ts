
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

    // NUEVO: Obtener técnicas recomendadas ANTES de generar el consejo
    let recommendedTechniques: any[] = []
    let mainEmotions: string[] = []
    
    try {
      console.log('🔍 Intentando conectar con Supabase...')
      console.log('🔍 Funciones disponibles:', {
        serverSupabaseClient: typeof serverSupabaseClient,
        serverSupabaseServiceRole: typeof serverSupabaseServiceRole
      })
      
      // PROBAR AMBOS MÉTODOS:
      let supabase
      try {
        supabase = serverSupabaseServiceRole(event)
        console.log('✅ Usando serverSupabaseServiceRole')
      } catch (serviceRoleError) {
        console.log('⚠️ ServiceRole falló, intentando client normal...')
        supabase = await serverSupabaseClient(event)
        console.log('✅ Usando serverSupabaseClient')
      }
      
      console.log('🔍 Cliente Supabase tipo:', typeof supabase)
      console.log('🔍 Métodos disponibles:', Object.keys(supabase))
      
      // Extraer emociones principales (top 2)
      mainEmotions = entryData.emotions
        .slice(0, 2) // Top 2 emociones más fuertes
        .map((emotion: any) => emotion.label.toLowerCase())
      
      console.log('🎯 Emociones principales detectadas:', mainEmotions)
      
      // Buscar técnicas recomendadas basadas en las emociones
      const { data: techniques, error: techniqueError } = await supabase
        .from('therapeutic_techniques')
        .select('*')
        .overlaps('target_emotions', mainEmotions)
        .eq('evidence_level', 'high') // Solo técnicas con alta evidencia
        .lte('difficulty_level', 3) // Técnicas no muy complejas
        .order('difficulty_level', { ascending: true })
        .limit(3) // Máximo 3 técnicas

      if (techniqueError) {
        console.error('⚠️ Error obteniendo técnicas:', techniqueError)
      } else {
        recommendedTechniques = techniques || []
        console.log(`💡 ${recommendedTechniques.length} técnicas encontradas para emociones:`, mainEmotions)
      }
    } catch (techniquesFetchError) {
      console.error('⚠️ Error conectando con BD para técnicas:', techniquesFetchError)
      // Continuar sin técnicas si hay error
    }

    // NUEVO: Crear prompt enriquecido con técnicas específicas
    let techniquesSection = ''
    if (recommendedTechniques.length > 0) {
      techniquesSection = `

📋 TÉCNICAS TERAPÉUTICAS ESPECÍFICAS DISPONIBLES:
${recommendedTechniques.map((t, index) => `
${index + 1}. ${t.name} (${t.category.replace('_', ' ')})
   Descripción: ${t.description}
   Instrucciones: ${t.instructions.replace(/\n/g, ' ').substring(0, 200)}...
   Nivel de evidencia: ${t.evidence_level}
   Duración: ${t.duration_minutes} minutos
`).join('')}`
    }

    // ACTUALIZADO: Prompt del sistema mejorado
    const systemPrompt = `Eres un coach de bienestar mental especializado que combina empatía con técnicas terapéuticas basadas en evidencia científica. Tu objetivo es brindar consejos prácticos utilizando las técnicas específicas proporcionadas.

DIRECTRICES PARA EL COACH IA:
- Utiliza las técnicas terapéuticas específicas proporcionadas como base principal
- Adapta las instrucciones de las técnicas al contexto emocional actual del usuario
- Mantén un tono cálido, empático pero profesional como un coach personal
- Estructura tu respuesta de forma clara y accionable
- Explica brevemente POR QUÉ estas técnicas son efectivas para su situación
- Personaliza el lenguaje según el perfil del usuario
- Si no hay técnicas específicas, usa principios generales de CBT y mindfulness
- Máximo 3-4 párrafos enfocados en la acción
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

    // ACTUALIZADO: Prompt del usuario enriquecido con técnicas
    const userPrompt = `CONTEXTO DEL USUARIO:
Usuario${userContext.length > 0 ? ` (${userContext.join(', ')})` : ''} reporta:

🎯 SITUACIÓN DESENCADENANTE: "${entryData.trigger}"
🎭 EMOCIONES DETECTADAS: ${emotionsText}
⚡ NIVEL DE ENERGÍA: ${entryData.energyLevel}/10
${techniquesSection}

INSTRUCCIONES PARA EL COACH:
Como coach personal especializado, proporciona un consejo personalizado que:
1. Reconozca y valide las emociones actuales del usuario
2. Utilice las técnicas específicas proporcionadas arriba adaptándolas a su situación
3. Explique brevemente por qué estas técnicas son efectivas para su estado emocional actual
4. Dé pasos claros y específicos que pueda seguir inmediatamente
5. Sea alentador y empático en el tono

${recommendedTechniques.length > 0 ? 
'IMPORTANTE: Basa tu consejo principalmente en las técnicas listadas arriba, adaptando sus instrucciones al contexto específico del usuario.' : 
'IMPORTANTE: Como no hay técnicas específicas disponibles, usa principios generales de terapia cognitivo-conductual y mindfulness.'
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
          recommended_techniques: recommendedTechniques.map(t => t.id) // NUEVO: Guardar IDs de técnicas
        })
        .eq('id', entryId)

      if (updateError) {
        console.error('Error actualizando entrada:', updateError)
        // No lanzamos error aquí para no fallar la generación del consejo
      } else {
        console.log('✅ Consejo y técnicas guardados en base de datos')
      }
    }

    // ACTUALIZADO: Retorna tanto el consejo como las técnicas recomendadas
    return {
      success: true,
      data: {
        advice: advice,
        recommended_techniques: recommendedTechniques, // NUEVO: Incluir técnicas completas
        techniques_count: recommendedTechniques.length,
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