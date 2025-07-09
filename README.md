# MoodCoach 📈🧠

> Your personal AI-powered mental health companion. Advanced emotion analysis, personalized therapeutic recommendations, and comprehensive mood tracking in Spanish.

**MoodCoach** is a sophisticated mental health application that combines cutting-edge AI emotion analysis with evidence-based therapeutic techniques. The system provides personalized recommendations, comprehensive analytics, and a seamless user experience for mental wellness tracking.

## 🎯 Key Features

- **🤖 AI-Powered Emotion Analysis**: Advanced Spanish emotion classification using fine-tuned transformers
- **💡 Intelligent Recommendation System**: Personalized therapeutic technique suggestions with cold-start and collaborative filtering
- **📊 Comprehensive Analytics**: Detailed mood tracking, trigger analysis, and trend visualization
- **🔒 Secure & Private**: Row-level security with Supabase authentication
- **🎨 Modern UI/UX**: Responsive design with TailwindCSS and smooth animations
- **⚡ Real-time Updates**: Live data synchronization and instant feedback

---

## 📋 Table of Contents

- [🏗️ System Architecture](#️-system-architecture)
- [🧠 AI & Recommendation System](#-ai--recommendation-system)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔧 Configuration](#-configuration)
- [🎨 Frontend Features](#-frontend-features)
- [📡 API Documentation](#-api-documentation)
- [🗄️ Database Schema](#️-database-schema)
- [📈 Analytics & Insights](#-analytics--insights)
- [🔒 Security & Privacy](#-security--privacy)
- [🚀 Deployment](#-deployment)
- [👥 Contributing](#-contributing)

---

## 🏗️ System Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    AI Pipeline    ┌─────────────────┐
│  Nuxt 3 Client  │ ──────────────▶ │   FastAPI API   │ ──────────────▶  │  HF Transformers │
│  (TypeScript)   │                 │   (Python)      │                   │   (ES Models)    │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
         │                                   │                                       │
         │                                   │                                       │
         ▼                                   ▼                                       ▼
┌─────────────────┐    WebSocket     ┌─────────────────┐    SQL Queries     ┌─────────────────┐
│   Supabase      │ ◀──────────────▶ │  Recommendation │ ◀──────────────▶  │   PostgreSQL    │
│   (Auth/DB)     │                 │     Engine      │                   │   (Supabase)    │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
         │                                   │                                       │
         │                                   │                                       │
         ▼                                   ▼                                       ▼
┌─────────────────┐    Analytics     ┌─────────────────┐    Feedback Loop   ┌─────────────────┐
│  TailwindCSS    │ ◀──────────────▶ │   Vue 3 + Pinia │ ◀──────────────▶  │  Machine Learning│
│   (Styling)     │                 │   (State Mgmt)  │                   │   (Improvements) │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
```

### Core Components

1. **🎨 Frontend** (`moodgraph-nuxt/`)
   - **Nuxt 3** with Vue 3 Composition API
   - **TypeScript** for type safety
   - **TailwindCSS** for responsive design
   - **VueUse** for utility functions
   - **Supabase** integration for auth and real-time data

2. **🔧 Backend** (`api/`)
   - **FastAPI** for high-performance API
   - **HuggingFace Transformers** for emotion analysis
   - **Hybrid model system** (base + fine-tuned)
   - **CORS enabled** for cross-origin requests

3. **🗄️ Database** (Supabase PostgreSQL)
   - **Row-level security** for user data protection
   - **Real-time subscriptions** for live updates
   - **Optimized queries** for analytics performance

---

## 🧠 AI & Recommendation System

### 🎭 Emotion Analysis Pipeline

The emotion analysis system uses a sophisticated hybrid approach combining **fine-tuned transformers** with **LLM-powered analysis**:

```python
# Hybrid Model Architecture
if USE_FINETUNED:
    model = AutoModelForSequenceClassification.from_pretrained("emotion_model/")
    tokenizer = AutoTokenizer.from_pretrained("emotion_model/")
else:
    model = "daveni/twitter-xlm-roberta-emotion-es"
```

#### 🔬 Fine-Tuning Process

Our emotion model is fine-tuned on a comprehensive Spanish emotion dataset:

**Dataset Composition:**
- **TASS Dataset**: 6,743 Spanish tweets with emotion labels
- **EmoEvent Dataset**: 8,409 Spanish emotional expressions
- **Combined Dataset**: 15,152 labeled samples across 7 emotions

**Data Processing Pipeline:**
```python
# Data cleaning and preprocessing
def clean_tweet(text: str) -> str:
    text = re.sub(r"https?://\S+", " ", text)            # URLs
    text = re.sub(r"@\w+", " ", text)                    # @mentions
    text = re.sub(r"#\w+", " ", text)                    # hashtags
    text = re.sub(r"\b(HASHTAG|USER)\b", " ", text, flags=re.I)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
```

**Fine-Tuning Configuration:**
```python
training_args = TrainingArguments(
    output_dir            = "./emotion_model",
    evaluation_strategy   = "epoch",
    learning_rate         = 2e-5,
    per_device_train_batch_size = 16,
    num_train_epochs      = 3,
    weight_decay          = 0.01,
    metric_for_best_model = "accuracy",
)
```

**Model Performance:**
- **Base Model**: `daveni/twitter-xlm-roberta-emotion-es`
- **Fine-tuned**: Custom model trained on combined Spanish datasets
- **Accuracy**: High performance on Spanish emotional text classification
- **Emotions Detected**: joy, sadness, anger, fear, surprise, disgust, others

#### 🤖 LLM Integration

The system integrates **OpenAI GPT-4o-mini** for advanced language understanding:

**1. Personalized Advice Generation** (`/api/advice/generate`)
```typescript
// OpenAI integration for therapeutic advice
const response = await $fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  body: {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 600,
    temperature: 0.7
  }
})
```

**2. Automatic Trigger Analysis** (`/api/trigger/analyze`)
```typescript
// LLM-powered trigger categorization
const systemPrompt = `Eres un experto en psicología que analiza texto emocional 
para identificar los desencadenantes o triggers de las emociones.

CATEGORÍAS DE TRIGGERS DISPONIBLES:
- relaciones, trabajo, salud mental, finanzas, etc.

FORMATO DE RESPUESTA:
{
  "trigger": "descripción específica del trigger detectado",
  "type": "una de las categorías disponibles", 
  "confidence": "alto/medio/bajo"
}`
```

**LLM Usage Areas:**
- **🎯 Personalized Therapeutic Advice**: Contextual recommendations based on user's emotional state
- **🔍 Trigger Detection**: Automatic categorization of emotional triggers
- **📝 Content Analysis**: Deep understanding of emotional context
- **🤝 User Interaction**: Natural language processing for better UX

**Features:**
- **Spanish-optimized** transformer models
- **Multi-emotion detection** with confidence scores
- **Contextual understanding** of triggers and situations
- **Real-time processing** with sub-second response times
- **LLM-enhanced** advice generation and trigger analysis

### 🎯 Intelligent Recommendation System

Our recommendation engine combines multiple approaches for personalized therapeutic suggestions:

#### 🆕 Cold Start Strategy (< 3 interactions)
```typescript
// For new users
const recommendations = await getColdStartRecommendations(userProfile, filterByEmotions)
```

**Process:**
1. **Emotional Pattern Analysis**: Analyzes user's last 10 mood entries
2. **Popularity-Based Filtering**: Selects high-scoring techniques from database
3. **Demographic Matching**: Applies bonuses for psychological conditions
4. **Evidence-Based Prioritization**: Prioritizes techniques with high research evidence

#### 🤝 Collaborative Filtering (≥ 3 interactions)
```typescript
// For experienced users
const collaborativeRecommendations = await getCollaborativeRecommendations(userProfile, emotions)
```

**Process:**
1. **User Similarity Detection**: Finds users with similar psychological profiles
2. **Preference Mining**: Analyzes 4+ star ratings from similar users
3. **Technique Scoring**: Combines average rating × user count
4. **Personalization**: Filters by current emotional state

#### 🔄 Hybrid Algorithm
```typescript
// Main recommendation function
const getRecommendedTechniques = async (userProfile, filterByEmotions?) => {
  const feedbackCount = await getUserFeedbackCount(userProfile.id)
  
  if (feedbackCount < 3) {
    return await getColdStartRecommendations(userProfile, filterByEmotions)
  } else {
    return await getCollaborativeRecommendations(userProfile, filterByEmotions)
  }
}
```

#### 📊 Key Metrics
- **Precision**: Techniques match user's emotional needs
- **Personalization**: Adapts to individual psychological conditions
- **Diversity**: Ensures variety in recommendation categories
- **Feedback Loop**: Continuously improves with user ratings

---

## 📁 Project Structure

```
moodgraph-public/
├── 📁 api/                          # FastAPI Backend
│   ├── 🐍 emotion_api.py           # Main FastAPI application
│   ├── 📊 notebooks/               # Jupyter notebooks for ML
│   │   ├── preprocessing-and-eda.ipynb
│   │   └── finetuning.ipynb
│   ├── 🤖 emotion_model/           # Fine-tuned model checkpoint
│   ├── 📋 requirements.txt
│   ├── 🐳 Dockerfile
│   └── 🧪 tests/                   # API tests
├── 📁 moodgraph-nuxt/              # Nuxt 3 Frontend
│   ├── 📁 app/
│   │   ├── 🎨 assets/css/          # Global styles
│   │   ├── 🧩 components/          # Vue components
│   │   │   ├── AdviceFlow.vue       # Technique recommendation flow
│   │   │   ├── RecommendationFlow.vue
│   │   │   ├── TechniqueCard.vue
│   │   │   └── FeedbackSection.vue
│   │   ├── 🔧 composables/         # Reusable logic
│   │   │   ├── useAuth.ts           # Authentication
│   │   │   ├── useEmotionAnalysis.ts # Emotion processing
│   │   │   ├── useTherapeuticTechniques.ts # Recommendation engine
│   │   │   ├── useMoodEntries.ts    # Mood data management
│   │   │   └── useTriggerAnalysis.ts # Trigger categorization
│   │   ├── 🗃️ layouts/             # App layouts
│   │   ├── 🛡️ middleware/          # Route guards
│   │   ├── 📄 pages/               # Application pages
│   │   │   ├── index.vue            # Dashboard
│   │   │   ├── entry.vue            # New mood entry
│   │   │   ├── history.vue          # Mood history
│   │   │   ├── analytics.vue        # Data visualization
│   │   │   ├── recommendations.vue  # Personalized techniques
│   │   │   └── profile.vue          # User settings
│   │   ├── 🔌 plugins/             # Nuxt plugins
│   │   ├── 🖥️ server/api/          # Server API routes
│   │   │   ├── advice/generate.post.ts
│   │   │   ├── techniques/recommend.post.ts
│   │   │   └── feedback/submit.post.ts
│   │   └── 🏷️ types/               # TypeScript definitions
│   ├── ⚙️ nuxt.config.ts           # Nuxt configuration
│   ├── 🎨 tailwind.config.js       # Tailwind CSS config
│   └── 📦 package.json
├── ☁️ cloudbuild.yaml              # CI/CD pipeline
└── 📖 README.md                    # This file
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js 18+** (for Nuxt development)
- **Python 3.10+** (for FastAPI backend)
- **PostgreSQL** (via Supabase)
- **Git** for version control

### 🛠️ Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/moodgraph-public.git
cd moodgraph-public
```

#### 2. Backend Setup (FastAPI)
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn emotion_api:app --reload --port 8080
```

#### 3. Frontend Setup (Nuxt 3)
```bash
cd moodgraph-nuxt
bun install  # or npm install
bun run dev  # Starts on http://localhost:3000
```

#### 4. Database Setup (Supabase)
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations (see `database/` folder)
3. Configure environment variables

---

## 🔧 Configuration

### 🌍 Environment Variables

#### Backend (`.env` in `api/`)
```env
# AI Model Configuration
USE_FINETUNED=true
FINETUNED_MODEL_PATH=emotion_model/
OPENAI_API_KEY=your_openai_key_here

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend (`.env` in `moodgraph-nuxt/`)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration
NUXT_PUBLIC_API_URL=http://localhost:8080
OPENAI_API_KEY=your_openai_key_here
```

---

## 🎨 Frontend Features

### 📱 Core Pages

#### 🏠 Dashboard (`/`)
- **Real-time mood trends** with visual indicators
- **Today's emotional distribution** with interactive charts
- **Recent entries** with quick access
- **Weekly statistics** and streaks

#### ✍️ New Entry (`/entry`)
- **AI-powered emotion analysis** from text input
- **Automatic trigger detection** and categorization
- **Personalized technique recommendations** based on emotions
- **Progressive technique instructions** with step-by-step guidance

#### 📊 Analytics (`/analytics`)
- **Emotion distribution charts** with time filtering
- **Trigger analysis** with category breakdown
- **Trend visualization** with interactive graphs
- **Statistical insights** and patterns

#### 🎯 Recommendations (`/recommendations`)
- **Personalized technique suggestions** based on user profile
- **Cold start vs. experienced user** differentiation
- **Interactive technique exploration** with detailed instructions
- **Feedback system** for continuous improvement

#### 📚 History (`/history`)
- **Paginated mood entries** with advanced filtering
- **Search functionality** across entries
- **Detailed entry views** with context
- **Export capabilities** for personal records

### 🧩 Key Components

#### `AdviceFlow.vue`
```vue
<!-- Intelligent technique recommendation flow -->
<AdviceFlow 
  :mood-entry="currentEntry"
  :user-profile="userProfile"
  @advice-generated="handleAdvice"
  @feedback-submitted="handleFeedback"
/>
```

#### `TechniqueCard.vue`
```vue
<!-- Individual technique display -->
<TechniqueCard 
  :technique="technique"
  @select-technique="selectTechnique"
/>
```

---

## 📡 API Documentation

### 🔌 Core Endpoints

#### Emotion Analysis
```http
POST /predict
Content-Type: application/json

{
  "text": "Me siento muy ansioso por el trabajo"
}
```

**Response:**
```json
{
  "success": true,
  "emotions": [
    {"label": "fear", "score": 0.78, "translated": "miedo"},
    {"label": "sadness", "score": 0.45, "translated": "tristeza"},
    {"label": "anger", "score": 0.23, "translated": "enojo"}
  ],
  "model_info": {
    "name": "fine-tuned-spanish-emotions",
    "version": "1.0.0"
  }
}
```

#### Technique Recommendations
```http
POST /api/techniques/recommend
Content-Type: application/json

{
  "emotions": ["fear", "sadness"],
  "user_profile": { "id": "user_123", "psychological_conditions": ["anxiety"] }
}
```

#### Advice Generation
```http
POST /api/advice/generate
Content-Type: application/json

{
  "entryData": {
    "emotions": [...],
    "trigger": "work stress",
    "energyLevel": 4
  },
  "userProfile": {...},
  "selectedTechnique": {...}
}
```

---

## 🗄️ Database Schema

### 📊 Core Tables

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  gender VARCHAR CHECK (gender IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  age INTEGER,
  psychological_conditions TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `mood_entries`
```sql
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  timestamp_date TIMESTAMP DEFAULT NOW(),
  trigger TEXT NOT NULL,
  trigger_type VARCHAR,
  level INTEGER CHECK (level >= 1 AND level <= 10),
  emocion1 JSONB NOT NULL,
  emocion2 JSONB NOT NULL,
  emocion3 JSONB NOT NULL,
  advice TEXT,
  advice_generated_at TIMESTAMP,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `therapeutic_techniques`
```sql
CREATE TABLE therapeutic_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  category VARCHAR NOT NULL,
  evidence_level VARCHAR CHECK (evidence_level IN ('high', 'medium', 'low')),
  target_emotions TEXT[] NOT NULL,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  duration_minutes INTEGER,
  score INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_technique_feedback`
```sql
CREATE TABLE user_technique_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  technique_id UUID REFERENCES therapeutic_techniques(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  tried_at TIMESTAMP DEFAULT NOW(),
  feedback_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📈 Analytics & Insights

### 📊 Dashboard Metrics

1. **Emotional Patterns**
   - Daily emotion distribution
   - Weekly trend analysis
   - Peak emotion times
   - Trigger correlation

2. **Progress Tracking**
   - Mood improvement over time
   - Technique effectiveness
   - User engagement metrics
   - Feedback sentiment analysis

3. **Personalization Metrics**
   - Recommendation accuracy
   - User satisfaction scores
   - Technique adoption rates
   - Collaborative filtering performance

### 🔍 Advanced Analytics

```typescript
// Emotion trend analysis
const emotionTrends = computed(() => {
  return analyzeEmotionTrends(entries.value, timeRange.value)
})

// Trigger pattern detection
const triggerPatterns = computed(() => {
  return detectTriggerPatterns(entries.value, userProfile.value)
})
```

---

## 🔒 Security & Privacy

### 🛡️ Authentication & Authorization

- **Supabase Auth** with JWT tokens
- **Row-level security** for all user data
- **API key protection** for external services
- **CORS configuration** for secure requests

### 🔐 Data Protection

```sql
-- Row-level security example
CREATE POLICY "Users can only see their own data" ON mood_entries
  FOR ALL USING (auth.uid() = user_id);
```

### 📱 Privacy Features

- **Data encryption** at rest and in transit
- **Anonymized analytics** for system improvements
- **User data export** and deletion capabilities
- **Consent management** for data processing

---

## 🚀 Deployment

### ☁️ Cloud Deployment (Recommended)

#### FastAPI Backend (Google Cloud Run)
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/moodcoach-api
gcloud run deploy moodcoach-api \
  --image gcr.io/$PROJECT_ID/moodcoach-api \
  --platform managed \
  --allow-unauthenticated
```

#### Nuxt Frontend (Vercel)
```bash
# Connect to Vercel
vercel --prod
```

### 🐳 Docker Setup

```dockerfile
# API Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "emotion_api:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## 🧪 Testing

### 🔬 Backend Testing
```bash
cd api
pytest tests/ -v
```

### 🎯 Frontend Testing
```bash
cd moodgraph-nuxt
bun run test
```

### 📊 Performance Testing
```bash
# API load testing
ab -n 1000 -c 10 http://localhost:8080/predict

# Frontend performance
bun run lighthouse
```

---

## 👥 Contributing

### 🤝 Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📝 Code Standards

- **Python**: PEP 8 with `black` formatting
- **TypeScript**: ESLint with Prettier
- **Commits**: Conventional Commits format
- **Documentation**: JSDoc for functions, comments for complex logic

### 🏗️ Architecture Decisions

- **Monorepo structure** for easier development
- **Composable-first** Vue 3 architecture
- **Type-safe** development with TypeScript
- **Performance-optimized** with lazy loading and caching

---

## 📚 Resources

### 🔗 Documentation Links

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers)

### 🎓 Learning Resources

- [Vue 3 Composition API](https://vuejs.org/guide/composition-api-introduction.html)
- [TailwindCSS](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **HuggingFace** for providing excellent Spanish emotion models
- **Supabase** for the robust backend infrastructure
- **Nuxt Team** for the outstanding developer experience
- **Caffeine and L-theanine** for the energy boost


---

## 💬 Support

For questions, issues, or contributions, please:

1. 📧 Open an issue on GitHub
2. 📖 Check the documentation


**Made with ❤️ for mental health and well-being**