import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { entryId, rating, techniques } = body

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
    
    // Actualizar la entrada con el feedback
    const { data, error } = await supabase
      .from('mood_entries')
      .update({
        feedback_rating: rating,
        feedback_date: new Date().toISOString(),
        recommended_techniques: techniques || []
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error guardando feedback:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al guardar el feedback'
      })
    }

    console.log('✅ Feedback guardado exitosamente')

    return {
      success: true,
      data: {
        submitted_at: new Date().toISOString(),
        rating,
        entry: data
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