// // app/composables/useTherapeuticTechniques.ts
// export const useTherapeuticTechniques = () => {
//     const supabase = useSupabaseClient()

import type { TherapeuticTechnique } from "~/types"

    
//     // Estados reactivos
//     const techniques = ref<TherapeuticTechnique[]>([])
//     const selectedTechnique = ref<TherapeuticTechnique | null>(null)
//     const userFeedback = ref<TechniqueFeedback[]>([])
//     const isLoading = ref(false)
//     const error = ref('')
  
//     // Obtener técnicas filtradas por emociones
//     const fetchTechniquesByEmotions = async (emotions: string[], difficultyMax: number = 5) => {
//       isLoading.value = true
//       error.value = ''
      
//       try {
//         const { data, error: fetchError } = await supabase
//           .from('therapeutic_techniques')
//           .select('*')
//           .overlaps('target_emotions', emotions)
//           .lte('difficulty_level', difficultyMax)
//           .order('evidence_level', { ascending: false })
//           .order('difficulty_level', { ascending: true })
  
//         if (fetchError) throw fetchError
        
//         techniques.value = data || []
//         return data
        
//       } catch (err: any) {
//         console.error('Error fetching techniques:', err)
//         error.value = err.message || 'Error obteniendo técnicas'
//         return []
//       } finally {
//         isLoading.value = false
//       }
//     }
  
//     // Obtener técnicas por categoría
//     // const fetchTechniquesByCategory = async (category: string) => {
//     //   isLoading.value = true
//     //   error.value = ''
      
//     //   try {
//     //     const { data, error: fetchError } = await supabase
//     //       .from('therapeutic_techniques')
//     //       .select('*')
//     //       .eq('category', category)
//     //       .order('difficulty_level', { ascending: true })
  
//     //     if (fetchError) throw fetchError
        
//     //     techniques.value = data || []
//     //     return data
        
//     //   } catch (err: any) {
//     //     console.error('Error fetching techniques by category:', err)
//     //     error.value = err.message || 'Error obteniendo técnicas'
//     //     return []
//     //   } finally {
//     //     isLoading.value = false
//     //   }
//     // }
  
//     // Obtener técnica específica por ID
//     // const fetchTechniqueById = async (id: string) => {
//     //   isLoading.value = true
//     //   error.value = ''
      
//     //   try {
//     //     const { data, error: fetchError } = await supabase
//     //       .from('therapeutic_techniques')
//     //       .select('*')
//     //       .eq('id', id)
//     //       .single()
  
//     //     if (fetchError) throw fetchError
        
//     //     selectedTechnique.value = data
//     //     return data
        
//     //   } catch (err: any) {
//     //     console.error('Error fetching technique:', err)
//     //     error.value = err.message || 'Error obteniendo técnica'
//     //     return null
//     //   } finally {
//     //     isLoading.value = false
//     //   }
//     // }
  
//     // Algoritmo de recomendación híbrido
//     const getRecommendedTechniques = async (
//       userEmotions: string[], 
//       userProfile: any,
//       previousFeedback: TechniqueFeedback[] = []
//     ): Promise<TherapeuticTechnique[]> => {
//       try {
//         // 1. Content-based filtering: por emociones detectadas
//         const emotionBasedTechniques = await fetchTechniquesByEmotions(userEmotions)
        
//         // 2. Collaborative filtering: basado en feedback positivo previo
//         // const likedCategories = previousFeedback
//         //   .filter(f => f.rating >= 4)
//         //   .map(f => f.technique_category)
//         //   .filter(Boolean)
  
//         // let collaborativeTechniques: TherapeuticTechnique[] = []
//         // if (likedCategories.length > 0) {
//         //   const { data } = await supabase
//         //     .from('therapeutic_techniques')
//         //     .select('*')
//         //     .in('category', likedCategories)
//         //     .order('evidence_level', { ascending: false })
          
//         //   collaborativeTechniques = data || []
//         // }
  
//         // 3. Personalización por perfil del usuario
//         // let maxDifficulty = 3 // Por defecto
//         // if (userProfile.age && userProfile.age > 50) maxDifficulty = 2 // Más simple para adultos mayores
//         // if (userProfile.psychological_conditions?.includes('ansiedad')) {
//         //   // Priorizar técnicas de respiración y mindfulness
//         // }
  
//         // 4. Combinar y rankear
//         const allTechniques = [...emotionBasedTechniques]
//         const uniqueTechniques = allTechniques.filter((technique, index, self) => 
//           index === self.findIndex(t => t.id === technique.id)
//         )
  
//         // 5. Scoring híbrido
//         const scoredTechniques = uniqueTechniques.map(technique => {
//           let score = 0
          
//           // Puntos por coincidencia de emociones
//           const emotionMatches = technique.target_emotions.filter(emotion => 
//             userEmotions.includes(emotion)
//           ).length
//           score += emotionMatches * 10
          
//           // Puntos por nivel de evidencia
//           // if (technique.evidence_level === 'high') score += 8
//           // else if (technique.evidence_level === 'medium') score += 5
//           // else score += 2
          
//           // Puntos por simplicidad (inverso de dificultad)
//           // score += (6 - technique.difficulty_level) * 2
          
//           // Bonus por feedback positivo previo en la categoría
//           // if (likedCategories.includes(technique.category)) score += 15
          
//           // Penalización por feedback negativo previo
//           // const negativeFeedback = previousFeedback.find(f => 
//           //   f.technique_id === technique.id && f.rating <= 2
//           // )
//           // if (negativeFeedback) score -= 20
          
//           return { ...technique, recommendationScore: score }
//         })
  
//         // 6. Ordenar por score y retornar top 5
//         return scoredTechniques
//           .sort((a, b) => b.recommendationScore - a.recommendationScore)
//           .slice(0, 5)
          
//       } catch (err: any) {
//         console.error('Error in recommendation algorithm:', err)
//         return []
//       }
//     }
  
//     // Guardar feedback del usuario sobre una técnica
//     const saveTechniqueFeedback = async (feedback: {
//       technique_id: string
//       mood_entry_id?: string
//       rating: number
//       was_helpful: boolean
//       comments?: string
//     }) => {
//       const { user } = useAuth()
//       if (!user.value) throw new Error('Usuario no autenticado')
  
//       try {
//         const { data, error: saveError } = await supabase
//           .from('user_technique_feedback')
//           .insert({
//             user_id: user.value.id,
//             ...feedback
//           })
//           .select()
//           .single()
  
//         if (saveError) throw saveError
        
//         return { success: true, feedback: data }
        
//       } catch (err: any) {
//         console.error('Error saving feedback:', err)
//         return { success: false, error: err.message }
//       }
//     }
  
//     // Obtener feedback del usuario
//     const fetchUserFeedback = async (userId?: string) => {
//       const { user } = useAuth()
//       const targetUserId = userId || user.value?.id
      
//       if (!targetUserId) return []
  
//       try {
//         const { data, error: fetchError } = await supabase
//           .from('user_technique_feedback')
//           .select(`
//             *,
//             therapeutic_techniques (
//               name,
//               category,
//               subcategory
//             )
//           `)
//           .eq('user_id', targetUserId)
//           .order('feedback_at', { ascending: false })
  
//         if (fetchError) throw fetchError
        
//         userFeedback.value = data || []
//         return data
        
//       } catch (err: any) {
//         console.error('Error fetching user feedback:', err)
//         return []
//       }
//     }
  
//     // Obtener estadísticas de efectividad de técnicas
//     const getTechniqueEffectiveness = async (techniqueId: string) => {
//       try {
//         const { data, error: fetchError } = await supabase
//           .from('user_technique_feedback')
//           .select('rating, was_helpful')
//           .eq('technique_id', techniqueId)
  
//         if (fetchError) throw fetchError
        
//         const feedback = data || []
//         const totalFeedback = feedback.length
        
//         if (totalFeedback === 0) return null
        
//         const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
//         const helpfulCount = feedback.filter(f => f.was_helpful).length
//         const helpfulPercentage = (helpfulCount / totalFeedback) * 100
        
//         return {
//           averageRating: avgRating,
//           helpfulPercentage,
//           totalFeedback
//         }
        
//       } catch (err: any) {
//         console.error('Error fetching technique effectiveness:', err)
//         return null
//       }
//     }
  
//     return {
//       // Estados reactivos (readonly)
//       techniques: readonly(techniques),
//       selectedTechnique: readonly(selectedTechnique),
//       userFeedback: readonly(userFeedback),
//       isLoading: readonly(isLoading),
//       error: readonly(error),
      
//       // Métodos
//       fetchTechniquesByEmotions,
//       fetchTechniquesByCategory,
//       fetchTechniqueById,
//       getRecommendedTechniques,
//       saveTechniqueFeedback,
//       fetchUserFeedback,
//       getTechniqueEffectiveness,
      
//       // Reset
//       clearTechniques: () => {
//         techniques.value = []
//         selectedTechnique.value = null
//         error.value = ''
//       }
//     }
//   }


export const useTherapeuticTechniques = () => {

  const supabase = useSupabaseClient()

  const techniques = ref<TherapeuticTechnique[]>([])
  const isLoading = ref(false)
  const error = ref('')



  const getTechniquesByEmotions = async (emotions: string[]) => {

    isLoading.value = true
    error.value = ''

    try {
      const { data, error: fetchError } = await supabase
      .from('therapeutic_techniques')
      .select('*')
      .overlaps('target_emotions', emotions)
      .order('difficulty_level', { ascending: true })
      .order('evidence_level', { ascending: false })
      .limit(6)

      if (fetchError) throw fetchError

      techniques.value = data || []
      return data || []
        
    } catch (error) {
        console.error('Error obteniendo técnicas:', error)
        error.value = 'Error cargando técnicas terapéuticas'
        techniques.value = []
        return []
        
    } finally {
        isLoading.value = false
    }
  }
    const clearTechniques = () => {
      techniques.value = []
      error.value = ''
    }

    return {
      // Estados (readonly)
      techniques: readonly(techniques),
      isLoading: readonly(isLoading),
      error: readonly(error),

      // Métodos
      getTechniquesByEmotions,
      clearTechniques
    }
    
}
