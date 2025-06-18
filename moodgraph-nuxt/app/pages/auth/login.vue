<template>
    <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">MoodGraph</h1>
          <p class="text-white/80">Inicia sesión para continuar</p>
        </div>
  
        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-white/90 text-sm font-medium mb-2">
              Email
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
  
          <!-- Password -->
          <div>
            <label class="block text-white/90 text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
  
          <!-- Error -->
          <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
            <p class="text-red-100 text-sm">{{ error }}</p>
          </div>
  
          <!-- Botón Login -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Iniciar Sesión</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Iniciando...
            </span>
          </button>
        </form>
  
        <!-- Link a Register -->
        <div class="mt-6 text-center">
          <p class="text-white/80 text-sm">
            ¿No tienes cuenta?
            <NuxtLink to="/auth/register" class="text-white font-semibold hover:text-white/80 transition-colors">
              Regístrate aquí
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { LoginData } from '~/types'
  
  // Metadata
  definePageMeta({
    layout: false,
    auth: false
  })
  
  // Composables
  const { login, isLoading, error } = useAuth()
  
  // Estado del formulario
  const loginForm = ref<LoginData>({
    email: '',
    password: ''
  })
  
  // Manejar login
  const handleLogin = async () => {
    const result = await login(loginForm.value)
    
    if (result.success) {
      console.log('✅ Login exitoso')
      await navigateTo('/entry')
    }
  }
  
  // Limpiar errores al escribir
  watch(() => loginForm.value.email, () => {
    if (error.value) error.value = ''
  })
  </script>