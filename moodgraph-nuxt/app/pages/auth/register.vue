<template>
  <div class="min-h-screen bg-gradient-to-br from-green-300 via-green-500 to-green-700 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-lg border border-white/20 shadow-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">MoodCoach</h1>
        <p class="text-white/80">Crea tu cuenta para empezar</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Datos básicos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <div class="md:col-span-2">
            <label class="block text-white/90 text-sm font-medium mb-2">
              Email *
            </label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="tu@email.com"
            />
          </div>

          <!-- Password -->
          <div class="md:col-span-2">
            <label class="block text-white/90 text-sm font-medium mb-2">
              Contraseña *
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <!-- Nombre -->
          <div class="md:col-span-2">
            <label class="block text-white/90 text-sm font-medium mb-2">
              Nombre *
            </label>
            <input
              v-model="registerForm.name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Tu nombre"
            />
          </div>

          <!-- Edad -->
          <div>
            <label class="block text-white/90 text-sm font-medium mb-2">
              Edad
            </label>
            <input
              v-model.number="registerForm.age"
              type="number"
              min="13"
              max="120"
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="25"
            />
          </div>

          <!-- Género -->
          <div>
            <label class="block text-white/90 text-sm font-medium mb-2">
              Género
            </label>
            <select
              v-model="registerForm.gender"
              class="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="" disabled class="text-gray-900">Seleccionar</option>
              <option value="masculino" class="text-gray-900">Masculino</option>
              <option value="femenino" class="text-gray-900">Femenino</option>
              <option value="otro" class="text-gray-900">Otro</option>
              <option value="prefiero_no_decir" class="text-gray-900">Prefiero no decir</option>
            </select>
          </div>

          <!-- Condiciones psicológicas -->
          <div class="md:col-span-2">
            <label class="block text-white/90 text-sm font-medium mb-2">
              Condiciones psicológicas (opcional)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="condition in psychConditions" :key="condition" class="flex items-center space-x-2 text-white/90 text-sm">
                <input
                  v-model="selectedConditions"
                  :value="condition"
                  type="checkbox"
                  class="rounded border-white/30 bg-white/20 text-green-600 focus:ring-white/50"
                />
                <span>{{ condition }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
          <p class="text-red-100 text-sm">{{ error }}</p>
        </div>

        <!-- Botón Register -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-white text-green-600 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Crear Cuenta</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Creando cuenta...
          </span>
        </button>
      </form>

      <!-- Link a Login -->
      <div class="mt-6 text-center">
        <p class="text-white/80 text-sm">
          ¿Ya tienes cuenta?
          <NuxtLink to="/auth/login" class="text-white font-semibold hover:text-white/80 transition-colors">
            Inicia sesión aquí
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterData } from '~/types'

// Metadata
definePageMeta({
  layout: false,
  auth: false
})

// Composables
const { register, isLoading, error } = useAuth()

// Condiciones psicológicas disponibles
const psychConditions = [
  'Ansiedad', 'Depresión', 'Estrés', 'TDAH', 
  'Bipolaridad', 'TOC', 'Insomnio', 'Otro'
]

// Estado del formulario
const registerForm = ref<RegisterData>({
  email: '',
  password: '',
  name: '',
  gender: undefined,
  age: undefined,
  psychological_conditions: []
})

const selectedConditions = ref<string[]>([])

// Actualizar condiciones en el formulario
watch(selectedConditions, (newConditions) => {
  registerForm.value.psychological_conditions = newConditions
}, { deep: true })

// Manejar registro
const handleRegister = async () => {
  const result = await register(registerForm.value)
  
  if (result.success) {
    console.log('✅ Registro exitoso')
    await navigateTo('/entry')
  }
}

// Limpiar errores al escribir
watch(() => registerForm.value.email, () => {
  if (error.value) error.value = ''
})
</script>