<template>
    <div class="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <!-- Navigation Sidebar -->
      <div class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-teal-200 z-10">
        <div class="p-6">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-12 h-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <!-- Círculo envolvente (simboliza acompañamiento y guía) -->
                <circle cx="100" cy="100" r="90" fill="#f0f4ff" stroke="#5A8DEE" stroke-width="4"/>
              
                <!-- Cerebro estilizado para representar la AI -->
                <path d="M60,100 a20,20 0 1,1 40,0 a20,20 0 1,1 40,0" fill="#5A8DEE" opacity="0.2"/>
                <path d="M70,100 q10,-20 20,0 q10,-20 20,0 q10,-20 20,0" stroke="#5A8DEE" stroke-width="2" fill="none"/>
              
                <!-- Pluma digital girada hacia arriba -->
                <g transform="rotate(180 100 100)">
                  <path d="M50,70 q50,-20 100,0" stroke="#111827" stroke-width="2" fill="none"/>
                  <circle cx="55" cy="68" r="5" fill="#111827"/>
                </g>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-teal-800">MoodCoach</h1>
          </div>
          
          <nav class="space-y-2">
            <NuxtLink 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                $route.path === item.path 
                  ? 'bg-teal-100 text-teal-800 shadow-sm' 
                  : 'text-teal-600 hover:bg-teal-50 hover:text-teal-700'
              ]"
            >
              <Icon :name="item.icon" class="w-5 h-5" />
              <span class="font-medium">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
        
        <div class="absolute bottom-6 left-6 right-6">
          <div class="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg p-4 text-white">
            <p class="text-sm font-medium mb-1">Racha Diaria</p>
            <p class="text-2xl font-bold">{{ streak }} días</p>
            <p class="text-xs opacity-90">¡Sigue así! 🌟</p>
          </div>
        </div>
      </div>
  
      <!-- Main Content Area -->
      <div class="ml-64 min-h-screen">
        <!-- Header Bar -->
        <div class="p-6 bg-white shadow-sm border-b border-teal-200 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-teal-800">{{ currentPageTitle }}</h2>
          
          <div class="flex items-center space-x-4">
            <!-- Streak Badge -->
            <div class="flex items-center space-x-2 bg-teal-50 px-3 py-1.5 rounded-lg">
              <Icon name="lucide:flame" class="w-4 h-4 text-blue-500" />
              <span class="text-sm font-medium text-teal-700">{{ streak }} días</span>
            </div>
            
            <!-- Logout Button -->
            <button 
              @click="logout" 
              class="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Icon name="lucide:log-out" class="w-5 h-5" />
            </button>
            <div class="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
        
        <!-- Page Content -->
        <main class="p-8">
          <slot />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  const route = useRoute()
  const streak = ref(7)

  // Importar la función de logout desde el composable useAuth
  const { logout } = useAuth()
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'lucide:trending-up' },
    { path: '/entry', label: 'Nueva Entrada', icon: 'lucide:plus-circle' },
    { path: '/history', label: 'Historial', icon: 'lucide:book-open' },
    { path: '/analytics', label: 'Analytics', icon: 'lucide:bar-chart-3' },
    { path: '/recommendations', label: 'Recomendaciones', icon: 'lucide:brain' },
    { path: '/profile', label: 'Perfil', icon: 'lucide:settings' }
  ]
  
  const currentPageTitle = computed(() => {
    const item = navItems.find(item => item.path === route.path)
    return item ? item.label : 'Dashboard'
  })
  
  const currentDate = computed(() => {
    return new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  })
  </script>