<template>
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-8">
        <h3 class="text-xl font-semibold text-sage-800 mb-6">Configuración del Perfil</h3>
        
        <div class="space-y-6">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-gradient-to-r from-sage-500 to-lavender-500 rounded-full flex items-center justify-center">
              <Icon name="lucide:user" class="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 class="text-lg font-medium text-sage-800">Sarah Johnson</h4>
              <p class="text-sage-600">Miembro desde marzo 2024</p>
            </div>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-sage-700 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value="sarah@example.com"
                class="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-sage-700 mb-2">Zona Horaria</label>
              <select class="w-full p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent">
                <option>Hora del Este (ET)</option>
                <option>Hora del Pacífico (PT)</option>
                <option>Hora Central (CT)</option>
              </select>
            </div>
          </div>
  
          <div>
            <label class="block text-sm font-medium text-sage-700 mb-2">Recordatorio Diario</label>
            <div class="flex items-center space-x-4">
              <input type="time" value="20:00" class="p-3 border border-sage-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent" />
              <label class="flex items-center space-x-2">
                <input type="checkbox" checked class="rounded border-sage-300 text-sage-600 focus:ring-sage-500" />
                <span class="text-sage-700">Habilitar notificaciones</span>
              </label>
            </div>
          </div>
  
          <div class="pt-6 border-t border-sage-200">
            <button class="w-full py-3 bg-gradient-to-r from-sage-500 to-lavender-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
  
      <div class="bg-white rounded-2xl shadow-sm border border-sage-200 p-8">
        <h3 class="text-xl font-semibold text-sage-800 mb-6">Privacidad y Datos</h3>
        <div class="space-y-4">
          <label class="flex items-center justify-between">
            <span class="text-sage-700">Compartir datos anónimos para investigación</span>
            <input type="checkbox" class="rounded border-sage-300 text-sage-600 focus:ring-sage-500" />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sage-700">Permitir compartir recomendaciones</span>
            <input type="checkbox" checked class="rounded border-sage-300 text-sage-600 focus:ring-sage-500" />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sage-700">Exportar mis datos</span>
            <button class="px-4 py-2 text-sage-600 hover:text-sage-800 transition-colors">
              <Icon name="lucide:download" class="w-4 h-4" />
            </button>
          </label>
        </div>
      </div>
    </div>
  </template>