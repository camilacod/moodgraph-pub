<template>
    <div class="min-h-screen bg-gradient-to-br from-sage-50 to-lavender-50">
      <!-- Navigation Sidebar -->
      <div class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-sage-200 z-10">
        <div class="p-6">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-10 h-10 bg-gradient-to-r from-sage-500 to-lavender-500 rounded-xl flex items-center justify-center">
              <Icon name="lucide:trending-up" class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold text-sage-800">MoodGraph</h1>
          </div>
          
          <nav class="space-y-2">
            <NuxtLink 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                $route.path === item.path 
                  ? 'bg-sage-100 text-sage-800 shadow-sm' 
                  : 'text-sage-600 hover:bg-sage-50 hover:text-sage-700'
              ]"
            >
              <Icon :name="item.icon" class="w-5 h-5" />
              <span class="font-medium">{{ item.label }}</span>
            </NuxtLink>
          </nav>
        </div>
        
        <div class="absolute bottom-6 left-6 right-6">
          <div class="bg-gradient-to-r from-sage-500 to-lavender-500 rounded-lg p-4 text-white">
            <p class="text-sm font-medium mb-1">Racha Diaria</p>
            <p class="text-2xl font-bold">{{ streak }} días</p>
            <p class="text-xs opacity-90">¡Sigue así! 🌟</p>
          </div>
        </div>
      </div>
  
      <!-- Main Content -->
      <div class="ml-64 min-h-screen">
        <!-- Header -->
        <header class="bg-white border-b border-sage-200 px-8 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-sage-800">{{ currentPageTitle }}</h2>
              <p class="text-sage-600 mt-1">{{ currentDate }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <button class="p-2 text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-colors">
                <Icon name="lucide:bell" class="w-5 h-5" />
              </button>
              <div class="w-8 h-8 bg-gradient-to-r from-sage-500 to-lavender-500 rounded-full"></div>
            </div>
          </div>
        </header>
  
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