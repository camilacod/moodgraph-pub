<template>
    <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div class="text-center">
          <div class="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold text-white mb-2">Verificando sesión...</h2>
          <p class="text-white/80">Te redirigiremos en un momento</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Metadata
  definePageMeta({
    layout: false,
    auth: false
  })
  
  // Auto-redirect después de procesar callback
  onMounted(async () => {
    // Esperar un poco para que Supabase procese el callback
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Verificar si el usuario está autenticado
    const user = useSupabaseUser()
    
    if (user.value) {
      await navigateTo('/entry')
    } else {
      await navigateTo('/auth/login')
    }
  })
  </script>