export default defineNuxtRouteMiddleware((to) => {
    const user = useSupabaseUser()
  
    // Si no hay usuario y la ruta requiere auth, redirigir a login
    if (!user.value) {
      return navigateTo('/auth/login')
    }
  })