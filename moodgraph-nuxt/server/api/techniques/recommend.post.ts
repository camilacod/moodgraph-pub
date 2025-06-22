import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { emotions } = body

    if (!emotions || !Array.isArray(emotions)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requieren emociones para recomendar técnicas'
      })
    }

    console.log('🎯 Buscando técnicas para emociones:', emotions)

    const supabase = await serverSupabaseClient(event)
    
    // Mapear emociones en español a inglés si es necesario
    const emotionMapping = {
      'alegría': 'joy',
      'tristeza': 'sadness', 
      'enojo': 'anger',
      'ira': 'anger',
      'miedo': 'fear',
      'sorpresa': 'surprise',
      'asco': 'disgust',
      'disgusto': 'disgust'
    }
    
    // Convertir emociones al formato correcto
    const normalizedEmotions = emotions.map(emotion => {
      const lowerEmotion = emotion.toLowerCase()
      return emotionMapping[lowerEmotion] || lowerEmotion
    }).filter(emotion => ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'].includes(emotion))
    
    console.log('🔄 Emociones normalizadas:', normalizedEmotions)

    if (normalizedEmotions.length === 0) {
      console.log('⚠️ No se encontraron emociones válidas')
      return {
        success: true,
        data: {
          techniques: [],
          emotions_analyzed: emotions,
          total_found: 0,
          message: 'No se encontraron emociones reconocidas para recomendar técnicas específicas'
        }
      }
    }
    
    // Buscar técnicas recomendadas basadas en las emociones
    const { data: techniques, error: techniqueError } = await supabase
      .from('therapeutic_techniques')
      .select('*')
      .overlaps('target_emotions', normalizedEmotions)
      .eq('evidence_level', 'high') // Solo técnicas con alta evidencia
      .lte('difficulty_level', 3) // Técnicas no muy complejas
      .order('difficulty_level', { ascending: true })
      .limit(4) // Máximo 4 técnicas

    if (techniqueError) {
      console.error('❌ Error obteniendo técnicas:', techniqueError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al buscar técnicas recomendadas'
      })
    }

    console.log(`✅ ${techniques?.length || 0} técnicas encontradas`)

    return {
      success: true,
      data: {
        techniques: techniques || [],
        emotions_analyzed: normalizedEmotions,
        original_emotions: emotions,
        total_found: techniques?.length || 0
      }
    }

  } catch (error: any) {
    console.error('❌ Error en endpoint de técnicas:', error)
    
    if (error.statusCode) {
      throw error // Re-throw createError errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor'
    })
  }
})