export const useMockData = () => {
    const todayEmotions = [
      { name: 'Tranquilo', intensity: 75, color: 'bg-emerald-400' },
      { name: 'Esperanzado', intensity: 60, color: 'bg-sage-400' },
      { name: 'Concentrado', intensity: 45, color: 'bg-lavender-400' }
    ]
  
    const recentEntries = [
      {
        id: 1,
        time: '2:30 PM',
        content: 'Tuve un excelente almuerzo con colegas. Me siento más conectado con el equipo.',
        emotions: ['Feliz', 'Social', 'Energizado'],
        moodColor: 'bg-emerald-400'
      },
      {
        id: 2,
        time: '9:15 AM',
        content: 'La meditación matutina fue bien. Empezando el día con intención.',
        emotions: ['Tranquilo', 'Centrado', 'Pacífico'],
        moodColor: 'bg-sage-400'
      }
    ]
  
    const topTriggers = [
      { name: 'Reuniones de Trabajo', count: 12, percentage: 80 },
      { name: 'Ejercicio', count: 8, percentage: 60 },
      { name: 'Tiempo en Familia', count: 6, percentage: 40 }
    ]
  
    const recommendations = [
      {
        id: 1,
        title: 'Ejercicio de Respiración de 5 Minutos',
        category: 'Atención Plena',
        description: 'Una técnica de respiración rápida para ayudar a reducir la ansiedad y centrarte.',
        rating: 5,
        users: 234,
        icon: 'lucide:heart',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600'
      },
      {
        id: 2,
        title: 'Diario de Gratitud Nocturno',
        category: 'Reflexión',
        description: 'Escribe tres cosas por las que estés agradecido antes de dormir.',
        rating: 4,
        users: 189,
        icon: 'lucide:book-open',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
      },
      {
        id: 3,
        title: 'Relajación Muscular Progresiva',
        category: 'Alivio del Estrés',
        description: 'Una técnica guiada para liberar la tensión física y promover la relajación.',
        rating: 5,
        users: 156,
        icon: 'lucide:target',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
      }
    ]
  
    const allEntries = [
      {
        id: 1,
        date: 'Hoy',
        time: '2:30 PM',
        content: 'Tuve un excelente almuerzo con colegas. Me siento más conectado con el equipo.',
        emotions: ['Feliz', 'Social', 'Energizado'],
        trigger: 'Interacción social',
        energy: 8,
        moodColor: 'bg-emerald-400'
      },
      {
        id: 2,
        date: 'Hoy',
        time: '9:15 AM',
        content: 'La meditación matutina fue bien. Empezando el día con intención.',
        emotions: ['Tranquilo', 'Centrado', 'Pacífico'],
        trigger: 'Meditación',
        energy: 7,
        moodColor: 'bg-sage-400'
      },
      {
        id: 3,
        date: 'Ayer',
        time: '6:45 PM',
        content: 'Me siento abrumado con las fechas límite del trabajo. Necesito encontrar mejor equilibrio.',
        emotions: ['Estresado', 'Ansioso', 'Cansado'],
        trigger: 'Presión laboral',
        energy: 4,
        moodColor: 'bg-orange-400'
      }
    ]
  
    return {
      todayEmotions,
      recentEntries,
      topTriggers,
      recommendations,
      allEntries
    }
  }