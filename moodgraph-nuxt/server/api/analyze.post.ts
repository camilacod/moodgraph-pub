export default defineEventHandler(async (event) => {
    try {
      const { text, triggerTypes } = await readBody(event)

      // Aquí llamamos a OpenAI para analizar el texto
      const prompt = `Eres un psicologo experto. Analiza el siguiente texto emocional y determina qué tipo de situación causó los sentimientos expresados, siguiendo estos pasos:

PASO 1: Lee cuidadosamente el texto y detecta qué evento o situación concreta parece haber generado la emoción. Resume esa situación como un "trigger" específico.

PASO 2: Reflexiona sobre cuál es el área de la vida principalmente afectada por ese trigger. Elige **una sola** opción de entre los siguientes tipos disponibles:
${triggerTypes.join(', ')}

PASO 3: Devuelve la información en formato JSON, sin ninguna explicación adicional. El JSON debe tener dos campos:
- "trigger": descripción específica del evento que generó la emoción
- "type": uno de los tipos disponibles que representa el área de vida afectada

Texto a analizar: "${text}"

Responde SOLO con:
{
  "trigger": "descripción específica del trigger",
  "type": "uno de los tipos disponibles"
}
`

      // Usar OpenAI API (similar a como lo hacen en useAdvice)
      type OpenAIResponse = {
        choices: {
          message: {
            content: string
          }
        }[]
      }
      const openaiResponse = await $fetch<OpenAIResponse>('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200
        }
      })

      const result = JSON.parse(openaiResponse.choices[0].message.content)

      return {
        success: true,
        trigger: result.trigger,
        type: result.type
      }

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  })
