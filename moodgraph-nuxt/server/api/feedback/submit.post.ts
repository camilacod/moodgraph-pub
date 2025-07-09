import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { entryId, rating, techniques, techniqueId, userId } = body

    if (!entryId || !rating) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Se requiere entryId y rating'
      })
    }

    if (rating < 1 || rating > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El rating debe estar entre 1 y 5'
      })
    }

    const supabase = await serverSupabaseClient(event)
    
    // Start a transaction-like approach
    const updates = []
    
    // 1. Update mood entry with feedback
    const { data: entryData, error: entryError } = await supabase
      .from('mood_entries')
      .update({
        feedback_rating: rating,
        feedback_date: new Date().toISOString(),
        recommended_techniques: techniques || []
      })
      .eq('id', entryId)
      .select()
      .single()

    if (entryError) {
      console.error('❌ Error guardando feedback en mood_entries:', entryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al guardar el feedback'
      })
    }

    // 2. If we have a specific technique, update its score and save individual feedback
    if (techniqueId && userId) {
      // Save individual technique feedback
      const { error: feedbackError } = await supabase
        .from('user_technique_feedback')
        .insert({
          user_id: userId,
          technique_id: techniqueId,
          mood_entry_id: entryId,
          rating: rating,
          was_helpful: rating >= 3, // 3+ stars considered helpful
          feedback_at: new Date().toISOString()
        })

      if (feedbackError) {
        console.error('❌ Error guardando feedback individual:', feedbackError)
        // Don't throw here, just log - the main feedback was saved
      }

      // Update technique score (increment by rating)
      const { error: scoreError } = await supabase.rpc('increment_technique_score', {
        technique_id: techniqueId,
        score_increment: rating
      })

      if (scoreError) {
        console.error('❌ Error actualizando score de técnica:', scoreError)
        // Fallback: manual update
        const { error: manualScoreError } = await supabase
          .from('therapeutic_techniques')
          .update({
            score: supabase.raw('score + ?', [rating])
          })
          .eq('id', techniqueId)
        
        if (manualScoreError) {
          console.error('❌ Error en fallback score update:', manualScoreError)
        }
      }
    }

    console.log('✅ Feedback guardado exitosamente')

    return {
      success: true,
      data: {
        submitted_at: new Date().toISOString(),
        rating,
        entry: entryData,
        techniqueUpdated: !!techniqueId
      }
    }

  } catch (error: any) {
    console.error('❌ Error en endpoint de feedback:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor'
    })
  }
})