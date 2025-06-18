
export interface UserProfile {
    id: string
    name: string
    gender?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'
    age?: number
    psychological_conditions?: string[]
    sign_up_date: string
    created_at: string
    updated_at: string
  }
  
  export interface EmotionData {
    label: string
    score: number
    translated: string
  }
  
  export interface MoodEntry {
    id: string
    user_id: string
    timestamp_date: string
    trigger: string
    level: number
    emocion1: EmotionData
    emocion2: EmotionData
    emocion3: EmotionData
    advice?: string
    advice_generated_at?: string
    feedback_rating?: number
    feedback_comment?: string
    feedback_date?: string
    model_info?: any
    created_at: string
    updated_at: string
  }
  
  export interface CreateMoodEntry {
    trigger: string
    level: number
    emocion1: EmotionData
    emocion2: EmotionData
    emocion3: EmotionData
    model_info?: any
  }
  
  export interface RegisterData {
    email: string
    password: string
    name: string
    gender?: UserProfile['gender']
    age?: number
    psychological_conditions?: string[]
  }
  
  export interface LoginData {
    email: string
    password: string
  }

  export interface AdviceRequest {
    entryData: {
      emotions: Array<{label: string, score: number, translated?: string}>
      trigger: string
      energyLevel: number
    }
    userProfile: UserProfile
    entryId?: string
  }
  
  export interface AdviceResponse {
    success: boolean
    advice: string
    generated_at: string
  }