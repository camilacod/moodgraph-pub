// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'app/',
  serverDir: 'server/',
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vueuse/nuxt',
    '@nuxtjs/supabase'
  ],
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/', '/auth/register', '/auth/login'] // Homepage será pública
    }
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Variables privadas (servidor)
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseKey: process.env.SUPABASE_KEY,

    
    
    // Variables públicas (cliente)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY

    }
  }
})