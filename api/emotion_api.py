# emotion_api.py - VERSIÓN HÍBRIDA
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from functools import lru_cache
import os

from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification, pipeline
)

from dotenv import load_dotenv
load_dotenv() 

USE_FINETUNED = os.getenv("USE_FINETUNED", "false").lower() == "true"
FINETUNED_MODEL_PATH = os.getenv("FINETUNED_MODEL_PATH", "emotion_model/")
BASE_MODEL = "daveni/twitter-xlm-roberta-emotion-es"

class InputText(BaseModel):
    text: str

app = FastAPI(title="MoodGraph - Detector de emociones híbrido 🇪🇸")

# CORS para permitir conexiones desde Nuxt
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@lru_cache()
def load_classifier():
    """Carga el modelo según la configuración"""
    
    if USE_FINETUNED:
        print(f"🎯 Cargando modelo FINE-TUNEADO desde: {FINETUNED_MODEL_PATH}")
        
        if not os.path.exists(FINETUNED_MODEL_PATH):
            print(f"❌ Modelo fine-tuneado no encontrado. Usando modelo base.")
            return load_base_model()
        
        try:
            tokenizer = AutoTokenizer.from_pretrained(FINETUNED_MODEL_PATH)
            model = AutoModelForSequenceClassification.from_pretrained(FINETUNED_MODEL_PATH)
            
            classifier = pipeline(
                "text-classification", 
                model=model, 
                tokenizer=tokenizer, 
                return_all_scores=True,
                device=-1
            )
            
            print("✅ Modelo fine-tuneado cargado exitosamente")
            return classifier, "finetuned"
            
        except Exception as e:
            print(f"❌ Error cargando modelo fine-tuneado: {e}")
            print("🔄 Fallback al modelo base...")
            return load_base_model()
    else:
        return load_base_model()

def load_base_model():
    """Carga el modelo base original"""
    print(f"🌐 Cargando modelo BASE: {BASE_MODEL}")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
        model = AutoModelForSequenceClassification.from_pretrained(BASE_MODEL)
        
        classifier = pipeline(
            "text-classification", 
            model=model, 
            tokenizer=tokenizer, 
            top_k=None,
            device=-1
        )
        
        print("✅ Modelo base cargado exitosamente")
        return classifier, "base"
        
    except Exception as e:
        print(f"❌ Error cargando modelo base: {e}")
        raise e

# Cargar el modelo al iniciar
print("🚀 Iniciando carga del modelo...")
classifier, model_type = load_classifier()

def filter_others_emotion(predictions):
    """Filtra 'others' y devuelve top 3 de emociones reales"""
    
    # Filtrar 'others' y similares
    filtered = []
    for pred in predictions:
        label = pred.get("label", "").lower()
        if label not in ["others", "other", "unknown", "error"]:
            filtered.append(pred)
    
    # Si no hay suficientes emociones después del filtro, mantener algunas
    if len(filtered) < 3 and len(predictions) > len(filtered):
        # Agregar las mejores "others" si es necesario
        others = [p for p in predictions if p.get("label", "").lower() in ["others", "other"]]
        filtered.extend(others[:3-len(filtered)])
    
    # Ordenar por score y tomar top 3
    return sorted(filtered, key=lambda x: x["score"], reverse=True)[:3]

@app.post("/predict")
def predict_emotion(payload: InputText):
    """Endpoint principal para análisis de emociones"""
    if not payload.text or len(payload.text.strip()) < 2:
        raise HTTPException(400, "Texto muy corto o vacío")

    print(f"📝 Analizando texto: '{payload.text[:50]}...'")
    
    try:
        # Procesar con el modelo
        raw_predictions = classifier(payload.text)
        
        print(f"🔍 Modelo: {model_type}")
        print(f"🔍 Predicciones raw: {raw_predictions}")
        
        # 🔧 SOLUCIÓN: Manejar formato anidado para AMBOS modelos
        predictions = raw_predictions
        
        # Extraer de formato anidado [[{...}]] -> [{...}]
        if isinstance(predictions, list) and len(predictions) > 0:
            if isinstance(predictions[0], list):
                predictions = predictions[0]
                print(f"🔧 Extraído de formato anidado: {len(predictions)} emociones")
        
        # Verificar que tenemos una lista de diccionarios
        if not isinstance(predictions, list):
            raise Exception(f"Formato inesperado: {type(predictions)}")
        
        # Formatear resultado
        formatted_predictions = []
        for pred in predictions:
            if isinstance(pred, dict) and "label" in pred and "score" in pred:
                label = pred.get("label", "unknown")
                score = pred.get("score", 0)
                
                formatted_predictions.append({
                    "label": str(label),
                    "score": float(score)
                })
                print(f"✅ Procesado: {label} -> {score:.4f}")
            else:
                print(f"⚠️ Elemento ignorado: {pred}")
        
        # Verificar que tenemos resultados
        if not formatted_predictions:
            raise Exception("No se encontraron predicciones válidas")
        
        # 🎯 FILTRAR "others" y obtener top 3
        filtered_predictions = []
        for pred in formatted_predictions:
            label = pred["label"].lower()
            if label not in ["others", "other", "unknown", "error"]:
                filtered_predictions.append(pred)
        
        # Si no hay suficientes emociones después del filtro, mantener algunas "others"
        if len(filtered_predictions) < 3 and len(formatted_predictions) > len(filtered_predictions):
            others = [p for p in formatted_predictions if p["label"].lower() in ["others", "other"]]
            filtered_predictions.extend(others[:3-len(filtered_predictions)])
        
        # Ordenar por score y tomar top 3
        top_emotions = sorted(
            filtered_predictions, 
            key=lambda x: x["score"], 
            reverse=True
        )[:3]
        
        print(f"🏆 Top 3 emociones (filtradas): {top_emotions}")
        
        return {
            "success": True,
            "emotions": top_emotions,
            "model_info": {
                "name": f"spanish-emotions-{model_type}",
                "type": model_type,
                "base_model": BASE_MODEL if model_type == "base" else "custom-finetuned",
                "total_emotions_detected": len(formatted_predictions),
                "filtered_others": len(formatted_predictions) - len(filtered_predictions)
            }
        }
        
    except Exception as e:
        print(f"❌ Error en predicción: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Error procesando texto: {str(e)}")

@app.get("/health")
def health_check():
    """Endpoint para verificar que la API funciona"""
    try:
        test_result = classifier("Me siento feliz")
        
        return {
            "status": "ok", 
            "model_loaded": True,
            "model_type": model_type,
            "model_name": BASE_MODEL if model_type == "base" else FINETUNED_MODEL_PATH,
            "use_finetuned": USE_FINETUNED,
            "test_completed": True
        }
    except Exception as e:
        print(f"❌ Error en health check: {str(e)}")
        return {
            "status": "error", 
            "model_loaded": False, 
            "error": str(e)
        }

@app.get("/model-info")
def get_model_info():
    """Endpoint para obtener información del modelo"""
    try:
        model = classifier.model
        tokenizer = classifier.tokenizer
        
        return {
            "model_type": model_type,
            "model_name": model.config.name_or_path if hasattr(model.config, 'name_or_path') else "unknown",
            "num_labels": model.config.num_labels,
            "id2label": model.config.id2label,
            "label2id": model.config.label2id,
            "tokenizer_vocab_size": tokenizer.vocab_size,
            "use_finetuned": USE_FINETUNED,
            "base_model": BASE_MODEL
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/switch-model/{model_type}")
def switch_model_endpoint(model_type: str):
    """Endpoint para cambiar modelo (requiere reinicio)"""
    if model_type not in ["base", "finetuned"]:
        raise HTTPException(400, "Tipo de modelo debe ser 'base' o 'finetuned'")
    
    return {
        "message": f"Para usar modelo {model_type}, configura USE_FINETUNED={'true' if model_type == 'finetuned' else 'false'} y reinicia la API",
        "current_model": model_type,
        "restart_required": True
    }

if __name__ == "__main__":
    import uvicorn
    print("🌟 Iniciando servidor FastAPI híbrido...")
    print(f"🎯 Modelo activo: {model_type}")
    print(f"🔧 USE_FINETUNED: {USE_FINETUNED}")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)