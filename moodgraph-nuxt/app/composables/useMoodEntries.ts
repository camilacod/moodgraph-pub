// app/composables/useMoodEntries.ts
import type { MoodEntry, CreateMoodEntry } from '~/types'

export const useMoodEntries = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const entries = ref<MoodEntry[]>([])
  const isLoading = ref(false)
  const error = ref('')

  // Crear nueva entrada
  const createEntry = async (entryData: CreateMoodEntry) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    isLoading.value = true
    error.value = ''

    try {
      const { data, error: insertError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.value.id,
          ...entryData
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Agregar a la lista local
      entries.value.unshift(data)
      
      return { success: true, entry: data }

    } catch (err: any) {
      console.error('Error creando entrada:', err)
      error.value = err.message || 'Error guardando entrada'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Obtener entradas del usuario
  const fetchEntries = async (limit = 10) => {
    if (!user.value) return

    isLoading.value = true
    error.value = ''

    try {
      const { data, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.value.id)
        .order('timestamp_date', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError

      entries.value = data || []
      return data

    } catch (err: any) {
      console.error('Error obteniendo entradas:', err)
      error.value = err.message || 'Error cargando entradas'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Actualizar entrada (para agregar advice o feedback)
  const updateEntry = async (entryId: string, updates: Partial<MoodEntry>) => {
    if (!user.value) {
      throw new Error('Usuario no autenticado')
    }

    isLoading.value = true
    error.value = ''

    try {
      const { data, error: updateError } = await supabase
        .from('mood_entries')
        .update(updates)
        .eq('id', entryId)
        .eq('user_id', user.value.id) // Seguridad: solo sus entradas
        .select()
        .single()

      if (updateError) throw updateError

      // Actualizar en la lista local
      const index = entries.value.findIndex(entry => entry.id === entryId)
      if (index !== -1) {
        entries.value[index] = data
      }

      return { success: true, entry: data }

    } catch (err: any) {
      console.error('Error actualizando entrada:', err)
      error.value = err.message || 'Error actualizando entrada'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Estadísticas básicas
  const getStats = computed(() => {
    if (entries.value.length === 0) return null

    const totalEntries = entries.value.length
    const avgLevel = entries.value.reduce((sum, entry) => sum + entry.level, 0) / totalEntries
    
    // Emoción más frecuente
    const emotions: Record<string, number> = {}
    entries.value.forEach(entry => {
      emotions[entry.emocion1.label] = (emotions[entry.emocion1.label] || 0) + 1
    })
    
    const mostFrequentEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0]

    return {
      totalEntries,
      avgLevel: Math.round(avgLevel * 10) / 10,
      mostFrequentEmotion: mostFrequentEmotion ? mostFrequentEmotion[0] : null,
      emotionFrequencies: emotions
    }
  })

  return {
    // Estado
    entries: readonly(entries),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    stats: getStats,
    hasEntries: computed(() => entries.value.length > 0),
    latestEntry: computed(() => entries.value[0] || null),
    
    // Métodos
    createEntry,
    fetchEntries,
    updateEntry
  }
}