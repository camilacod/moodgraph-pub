<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-sage-800">Recomendaciones Personalizadas</h3>
          <p class="text-sage-600 mt-1">
            {{ feedbackCount < 3 
              ? 'Técnicas populares seleccionadas para ti' 
              : 'Basado en tus preferencias y usuarios similares' 
            }}
          </p>
        </div>
        <div v-if="feedbackCount >= 0" class="text-right">
          <p class="text-sm text-sage-600">Experiencia</p>
          <p class="text-lg font-semibold text-sage-800">
            {{ feedbackCount < 3 ? 'Nuevo usuario' : `${feedbackCount} técnicas probadas` }}
          </p>
        </div>
      </div>
      
      <!-- User Info -->
      <div v-if="profile" class="bg-sage-50 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-sage-500 to-lavender-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ profile.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h4 class="font-medium text-sage-800">{{ profile.name }}</h4>
            <p class="text-sm text-sage-600">
              {{ getProfileSummary() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendation Flow -->
    <RecommendationFlow 
      v-if="profile"
      :user-profile="profile"
      @feedback-submitted="handleFeedbackSubmitted"
    />
    
    <!-- Loading state when no profile -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-sage-200 p-12 text-center">
      <Icon name="lucide:loader-2" class="w-12 h-12 text-sage-600 animate-spin mx-auto mb-4" />
      <p class="text-sage-600">Cargando tu perfil...</p>
    </div>
  </div>
</template>

<script setup>
// Proteger página con middleware de autenticación
definePageMeta({
  middleware: 'auth'
})

// Composables
const { user, profile } = useAuth()
const { getUserFeedbackCount } = useTherapeuticTechniques()

// Estados reactivos
const feedbackCount = ref(0)

// Computed properties
const getProfileSummary = () => {
  if (!profile.value) return ''
  
  const parts = []
  if (profile.value.age) parts.push(`${profile.value.age} años`)
  if (profile.value.psychological_conditions?.length > 0) {
    parts.push(`${profile.value.psychological_conditions.length} condición(es)`)
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Sin información adicional'
}

// Métodos
const handleFeedbackSubmitted = async (data) => {
  console.log('✅ Feedback recibido:', data)
  
  // Actualizar contador de feedback
  if (user.value?.id) {
    feedbackCount.value = await getUserFeedbackCount(user.value.id)
  }
}

const loadUserStats = async () => {
  if (user.value?.id) {
    try {
      feedbackCount.value = await getUserFeedbackCount(user.value.id)
      console.log(`📊 Usuario tiene ${feedbackCount.value} técnicas con feedback`)
    } catch (error) {
      console.error('Error cargando estadísticas del usuario:', error)
    }
  }
}

// Cargar estadísticas al montar
onMounted(async () => {
  await loadUserStats()
})

// Watch para cargar stats cuando cambie el usuario
watch(user, async (newUser) => {
  if (newUser) {
    await loadUserStats()
  } else {
    feedbackCount.value = 0
  }
}, { immediate: true })
</script>