import type { TherapeuticTechnique, TechniqueFeedback, UserProfile } from "~/types"

export const useTherapeuticTechniques = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()

  // Estados reactivos
  const techniques = ref<TherapeuticTechnique[]>([])
  const selectedTechnique = ref<TherapeuticTechnique | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  /**
   * Obtiene técnicas filtradas por emociones (para el flujo de entry)
   * AHORA ACTUALIZADO: Usa el sistema de recomendaciones personalizado con filtro por emociones
   * Devuelve técnicas ordenadas por el algoritmo de recomendación, limitadas a 6 para el flujo de entry
   */
  const getTechniquesByEmotions = async (emotions: string[], userProfile?: UserProfile) => {
    isLoading.value = true
    error.value = ''

    try {
      console.log('🎭 Obteniendo técnicas por emociones:', emotions)
      
      // Si tenemos perfil de usuario, usar el sistema de recomendaciones personalizado
      if (userProfile?.id) {
        console.log('👤 Usando recomendaciones personalizadas filtradas por emociones')
        const personalizedTechniques = await getRecommendedTechniques(userProfile, emotions)
        
        // Limitar a 6 técnicas para el flujo de entry (como el comportamiento original)
        const limitedTechniques = personalizedTechniques.slice(0, 6)
        techniques.value = limitedTechniques
        return limitedTechniques
      } else {
        // Fallback al comportamiento original si no hay perfil de usuario
        console.log('📋 Usando técnicas populares filtradas por emociones (sin perfil)')
        const { data, error: fetchError } = await supabase
          .from('therapeutic_techniques')
          .select('*')
          .overlaps('target_emotions', emotions)
          .order('score', { ascending: false }) // Ordenar por popularidad primero
          .order('difficulty_level', { ascending: true })
          .order('evidence_level', { ascending: false })
          .limit(6)

        if (fetchError) throw fetchError

        techniques.value = data || []
        return data || []
      }
        
    } catch (error) {
      console.error('Error obteniendo técnicas:', error)
      error.value = 'Error cargando técnicas terapéuticas'
      techniques.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verifica cuántas interacciones (feedback) tiene el usuario
   * Retorna el número de feedbacks únicos por técnica del usuario
   */
  const getUserFeedbackCount = async (userId: string): Promise<number> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('user_technique_feedback')
        .select('technique_id')
        .eq('user_id', userId)

      if (fetchError) throw fetchError

      // Contar técnicas únicas sobre las que el usuario ha dado feedback
      const uniqueTechniques = new Set(data?.map(f => f.technique_id) || [])
      return uniqueTechniques.size
    } catch (error) {
      console.error('Error obteniendo conteo de feedback del usuario:', error)
      return 0
    }
  }

  /**
   * Obtiene las emociones principales del usuario basadas en su historial
   * Analiza las últimas 10 entradas para identificar patrones emocionales
   */
  const getUserEmotionalPatterns = async (userId: string): Promise<string[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('mood_entries')
        .select('emocion1, emocion2, emocion3')
        .eq('user_id', userId)
        .order('timestamp_date', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      // Extraer y contar emociones
      const emotionCounts: { [key: string]: number } = {}
      
      data?.forEach(entry => {
        [entry.emocion1, entry.emocion2, entry.emocion3].forEach(emotion => {
          if (emotion?.label && emotion.label !== 'other') {
            const key = emotion.label.toLowerCase()
            emotionCounts[key] = (emotionCounts[key] || 0) + 1
          }
        })
      })

      // Retornar las 3 emociones más comunes
      return Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion)
    } catch (error) {
      console.error('Error obteniendo patrones emocionales del usuario:', error)
      return ['sadness', 'anxiety', 'stress'] // Fallback por defecto
    }
  }

  /**
   * Obtiene técnicas populares para usuarios en cold start
   * Prioriza técnicas con alta puntuación y evidencia, filtradas por emociones del usuario
   */
  const getColdStartRecommendations = async (
    userProfile: UserProfile,
    filterByEmotions?: string[]
  ): Promise<TherapeuticTechnique[]> => {
    try {
      // Usar emociones específicas si se proporcionan, sino usar patrones del usuario
      const targetEmotions = filterByEmotions || await getUserEmotionalPatterns(userProfile.id)
      
      console.log('🔄 Cold start - emociones objetivo:', targetEmotions)

      // Obtener técnicas populares filtradas por emociones
      const { data: emotionBasedTechniques, error: emotionError } = await supabase
        .from('therapeutic_techniques')
        .select('*')
        .overlaps('target_emotions', targetEmotions)
        .order('score', { ascending: false }) // Ordenar por popularidad
        .order('evidence_level', { ascending: false })
        .limit(6)

      if (emotionError) throw emotionError

      // Aplicar ajustes por condiciones psicológicas
      const adjustedTechniques = (emotionBasedTechniques || []).map(technique => {
        let adjustedScore = technique.score || 0

        // Bonus para técnicas que coinciden con condiciones psicológicas
        if (userProfile.psychological_conditions?.length > 0) {
          userProfile.psychological_conditions.forEach(condition => {
            if (technique.tags?.includes(condition.toLowerCase()) || 
                technique.description?.toLowerCase().includes(condition.toLowerCase())) {
              adjustedScore += 10
            }
          })
        }

        return { ...technique, recommendationScore: adjustedScore }
      })

      console.log(`✅ Cold start - ${adjustedTechniques.length} técnicas encontradas`)
      return adjustedTechniques.sort((a, b) => b.recommendationScore - a.recommendationScore)
    } catch (error) {
      console.error('Error en recomendaciones cold start:', error)
      return []
    }
  }

  /**
   * Encuentra usuarios similares basados en demografía y patrones emocionales
   * Retorna IDs de usuarios con perfiles y emociones similares
   */
  const findSimilarUsers = async (userProfile: UserProfile): Promise<string[]> => {
    try {
      // Obtener emociones del usuario actual
      const userEmotions = await getUserEmotionalPatterns(userProfile.id)
      
      // Buscar usuarios con condiciones psicológicas similares
      let similarUsers: string[] = []
      
      if (userProfile.psychological_conditions?.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, psychological_conditions')
          .neq('id', userProfile.id)
          .not('psychological_conditions', 'is', null)

        if (!profilesError && profilesData) {
          // Calcular similitud basada en condiciones psicológicas
          const userConditions = new Set(userProfile.psychological_conditions)
          
          similarUsers = profilesData
            .filter(profile => {
              const otherConditions = new Set(profile.psychological_conditions || [])
              const intersection = new Set([...userConditions].filter(x => otherConditions.has(x)))
              return intersection.size > 0 // Al menos una condición en común
            })
            .map(profile => profile.id)
            .slice(0, 10) // Máximo 10 usuarios similares
        }
      }

      console.log(`🤝 Encontrados ${similarUsers.length} usuarios similares`)
      return similarUsers
    } catch (error) {
      console.error('Error encontrando usuarios similares:', error)
      return []
    }
  }

  /**
   * Obtiene recomendaciones colaborativas para usuarios experimentados
   * Analiza feedback de usuarios similares y recomienda técnicas exitosas
   */
  const getCollaborativeRecommendations = async (
    userProfile: UserProfile,
    filterByEmotions?: string[]
  ): Promise<TherapeuticTechnique[]> => {
    try {
      // Encontrar usuarios similares
      const similarUsers = await findSimilarUsers(userProfile)
      
      if (similarUsers.length === 0) {
        console.log('⚠️ No se encontraron usuarios similares, usando fallback')
        return []
      }

      // Obtener técnicas con buen feedback de usuarios similares
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('user_technique_feedback')
        .select(`
          technique_id,
          rating,
          therapeutic_techniques (*)
        `)
        .in('user_id', similarUsers)
        .gte('rating', 4) // Solo feedback positivo (4+ estrellas)

      if (feedbackError) throw feedbackError

      // Agrupar por técnica y calcular puntuaciones
      const techniqueScores: { [key: string]: { technique: any, totalRating: number, count: number } } = {}
      
      feedbackData?.forEach(feedback => {
        const techniqueId = feedback.technique_id
        const technique = feedback.therapeutic_techniques
        
        if (technique) {
          // Si se especificaron emociones, filtrar técnicas que las coincidan
          if (filterByEmotions) {
            const hasOverlap = technique.target_emotions.some((emotion: string) => 
              filterByEmotions.includes(emotion.toLowerCase())
            )
            if (!hasOverlap) return // Saltar esta técnica si no coincide con las emociones
          }

          if (!techniqueScores[techniqueId]) {
            techniqueScores[techniqueId] = {
              technique,
              totalRating: 0,
              count: 0
            }
          }
          techniqueScores[techniqueId].totalRating += feedback.rating
          techniqueScores[techniqueId].count += 1
        }
      })

      // Convertir a array y ordenar por puntuación colaborativa
      const collaborativeTechniques = Object.values(techniqueScores)
        .map(({ technique, totalRating, count }) => ({
          ...technique,
          recommendationScore: (totalRating / count) * count, // Rating promedio * número de usuarios
          collaborativeUsers: count
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 6)

      console.log(`🤖 Colaborativo - ${collaborativeTechniques.length} técnicas encontradas`)
      return collaborativeTechniques
    } catch (error) {
      console.error('Error en recomendaciones colaborativas:', error)
      return []
    }
  }

  /**
   * Obtiene técnicas fallback populares generales
   * Se usa cuando no hay suficientes recomendaciones específicas
   */
  const getFallbackTechniques = async (
    excludeIds: string[] = [], 
    filterByEmotions?: string[]
  ): Promise<TherapeuticTechnique[]> => {
    try {
      let query = supabase
        .from('therapeutic_techniques')
        .select('*')

      // Si se especificaron emociones, aplicar filtro
      if (filterByEmotions && filterByEmotions.length > 0) {
        query = query.overlaps('target_emotions', filterByEmotions)
      }

      query = query
        .order('score', { ascending: false })
        .order('evidence_level', { ascending: false })

      // Excluir técnicas ya incluidas
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error } = await query.limit(9)

      if (error) throw error

      const fallbackTechniques = (data || []).map(technique => ({
        ...technique,
        recommendationScore: technique.score || 0,
        isFallback: true
      }))

      console.log(`📋 Fallback - ${fallbackTechniques.length} técnicas populares`)
      return fallbackTechniques
    } catch (error) {
      console.error('Error obteniendo técnicas fallback:', error)
      return []
    }
  }

  /**
   * Función principal de recomendaciones que retorna exactamente 9 técnicas
   * Combina cold start, colaborativo y fallback según la experiencia del usuario
   */
  const getRecommendedTechniques = async (
    userProfile: UserProfile, 
    filterByEmotions?: string[]
  ): Promise<TherapeuticTechnique[]> => {
    if (!userProfile?.id) {
      console.error('⚠️ Perfil de usuario requerido para recomendaciones')
      return []
    }

    isLoading.value = true
    error.value = ''

    try {
      console.log('🎯 Iniciando sistema de recomendaciones para:', userProfile.name)
      if (filterByEmotions) {
        console.log('🎭 Filtrando por emociones específicas:', filterByEmotions)
      }

      // Verificar experiencia del usuario
      const feedbackCount = await getUserFeedbackCount(userProfile.id)
      console.log(`📊 Usuario tiene ${feedbackCount} interacciones`)

      let recommendedTechniques: TherapeuticTechnique[] = []

      if (feedbackCount < 3) {
        // COLD START: Usuario nuevo
        console.log('🆕 Aplicando estrategia Cold Start')
        recommendedTechniques = await getColdStartRecommendations(userProfile, filterByEmotions)
      } else {
        // EXPERIENCIADO: Usar colaborativo + content-based
        console.log('🤖 Aplicando estrategia Colaborativa')
        
        // Obtener recomendaciones colaborativas (usuarios similares)
        const collaborativeTechniques = await getCollaborativeRecommendations(userProfile, filterByEmotions)
        
        // Obtener algunas técnicas basadas en emociones del usuario
        const targetEmotions = filterByEmotions || await getUserEmotionalPatterns(userProfile.id)
        let query = supabase
          .from('therapeutic_techniques')
          .select('*')
          .overlaps('target_emotions', targetEmotions)
          .order('score', { ascending: false })
          .limit(3)

        const { data: contentBasedTechniques } = await query

        // Combinar colaborativo + content-based
        const combinedTechniques = [
          ...collaborativeTechniques,
          ...(contentBasedTechniques || []).map(t => ({ ...t, recommendationScore: t.score || 0 }))
        ]

        // Eliminar duplicados
        const uniqueTechniques = combinedTechniques.filter((technique, index, self) => 
          index === self.findIndex(t => t.id === technique.id)
        )

        recommendedTechniques = uniqueTechniques
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 6)
      }

      // GARANTIZAR 9 TÉCNICAS: Usar fallback si es necesario
      if (recommendedTechniques.length < 9) {
        console.log(`📋 Necesitamos ${9 - recommendedTechniques.length} técnicas más, usando fallback`)
        
        const excludeIds = recommendedTechniques.map(t => t.id)
        const fallbackTechniques = await getFallbackTechniques(excludeIds, filterByEmotions)
        
        recommendedTechniques = [
          ...recommendedTechniques,
          ...fallbackTechniques.slice(0, 9 - recommendedTechniques.length)
        ]
      }

      // Asegurar exactamente 9 técnicas
      const finalTechniques = recommendedTechniques.slice(0, 9)
      
      console.log(`✅ Recomendaciones completadas: ${finalTechniques.length} técnicas`)
      
      techniques.value = finalTechniques
      return finalTechniques

    } catch (error: any) {
      console.error('❌ Error en sistema de recomendaciones:', error)
      error.value = 'Error generando recomendaciones personalizadas'
      
      // Fallback de emergencia: técnicas populares
      const emergencyTechniques = await getFallbackTechniques([], filterByEmotions)
      techniques.value = emergencyTechniques.slice(0, 9)
      return techniques.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Guarda feedback del usuario sobre una técnica
   * Actualiza la puntuación de la técnica basada en el rating
   */
  const saveTechniqueFeedback = async (feedback: {
    technique_id: string
    rating: number
    comments?: string
  }) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    try {
      // Insertar feedback
      const { data, error: saveError } = await supabase
        .from('user_technique_feedback')
        .insert({
          user_id: user.value.id,
          technique_id: feedback.technique_id,
          rating: feedback.rating,
          comments: feedback.comments,
          tried_at: new Date().toISOString(),
          feedback_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) throw saveError

      // Actualizar score de la técnica (simple promedio ponderado)
      const scoreIncrement = feedback.rating >= 4 ? 1 : (feedback.rating <= 2 ? -1 : 0)
      
      if (scoreIncrement !== 0) {
        const { error: updateError } = await supabase.rpc('increment_technique_score', {
          technique_id: feedback.technique_id,
          score_increment: scoreIncrement
        })

        if (updateError) {
          console.warn('No se pudo actualizar score de técnica:', updateError)
        }
      }

      console.log('✅ Feedback guardado exitosamente')
      return { success: true, feedback: data }

    } catch (err: any) {
      console.error('❌ Error guardando feedback:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Limpia el estado del composable
   */
  const clearTechniques = () => {
    techniques.value = []
    selectedTechnique.value = null
    error.value = ''
  }

  /**
   * Selecciona una técnica específica para mostrar detalles
   */
  const selectTechnique = (technique: TherapeuticTechnique) => {
    selectedTechnique.value = technique
  }

  return {
    // Estados (readonly)
    techniques: readonly(techniques),
    selectedTechnique: readonly(selectedTechnique),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Métodos principales
    getRecommendedTechniques,
    getTechniquesByEmotions,
    saveTechniqueFeedback,
    selectTechnique,
    clearTechniques,

    // Métodos auxiliares (expuestos para testing)
    getUserFeedbackCount,
    getUserEmotionalPatterns
  }
}