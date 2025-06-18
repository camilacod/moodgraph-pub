// app/composables/useAuth.ts
import type { UserProfile, RegisterData, LoginData } from '~/types'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Estado reactivo del perfil
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref('')

  // Obtener perfil del usuario
  const fetchProfile = async () => {
    if (!user.value) return null
    
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      
      if (profileError) throw profileError
      
      profile.value = data
      return data
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      return null
    }
  }

  // Registrar nuevo usuario
  const register = async (registerData: RegisterData) => {
    isLoading.value = true
    error.value = ''
    
    try {
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // 2. Crear perfil de usuario
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            name: registerData.name,
            gender: registerData.gender,
            age: registerData.age,
            psychological_conditions: registerData.psychological_conditions || []
          })
        
        if (profileError) throw profileError
        
        // 3. Obtener el perfil creado
        await fetchProfile()
        
        return { success: true, user: authData.user }
      }
      
      throw new Error('No se pudo crear el usuario')
      
    } catch (err: any) {
      console.error('Error en registro:', err)
      error.value = err.message || 'Error en el registro'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Iniciar sesión
  const login = async (loginData: LoginData) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })
      
      if (authError) throw authError
      
      // Obtener perfil después del login
      await fetchProfile()
      
      return { success: true, user: data.user }
      
    } catch (err: any) {
      console.error('Error en login:', err)
      error.value = err.message || 'Error en el inicio de sesión'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Cerrar sesión
  const logout = async () => {
    isLoading.value = true
    
    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      
      profile.value = null
      await navigateTo('/auth/login')
      
    } catch (err: any) {
      console.error('Error en logout:', err)
      error.value = err.message || 'Error cerrando sesión'
    } finally {
      isLoading.value = false
    }
  }

  // Actualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return { success: false, error: 'No autenticado' }
    
    isLoading.value = true
    error.value = ''
    
    try {
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      profile.value = data
      return { success: true, profile: data }
      
    } catch (err: any) {
      console.error('Error actualizando perfil:', err)
      error.value = err.message || 'Error actualizando perfil'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Inicializar perfil al cargar
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchProfile()
    } else {
      profile.value = null
    }
  }, { immediate: true })

  return {
    // Estado
    user: readonly(user),
    profile: readonly(profile),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    isAuthenticated: computed(() => !!user.value),
    hasProfile: computed(() => !!profile.value),
    userEmail: computed(() => user.value?.email || ''),
    userFullData: computed(() => ({
      id: user.value?.id || '',
      email: user.value?.email || '',
      ...profile.value
    })),
    
    // Métodos
    register,
    login,
    logout,
    updateProfile,
    fetchProfile
  }
}