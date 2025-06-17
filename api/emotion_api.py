# emotion_api.py - VERSIÓN CORREGIDA PARA ETIQUETAS
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from functools import lru_cache
import os
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification, pipeline
)

# 🔧 Usar checkpoint específico
FINETUNED_MODEL_PATH = "emotion_model"  # Ajustar según tu checkpoint

class InputText(BaseModel):
    text: str

app = FastAPI(title="MoodGraph - Detector de emociones fine-tuneado 🇪🇸")

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
def load_finetuned_classifier():
    """Carga tu modelo fine-tuneado desde checkpoint"""
    print(f"🔄 Cargando modelo fine-tuneado desde: {FINETUNED_MODEL_PATH}")
    
    if not os.path.exists(FINETUNED_MODEL_PATH):
        raise Exception(f"No se encontró el modelo en: {FINETUNED_MODEL_PATH}")
    
    try:
        # Cargar tokenizer y modelo
        tokenizer = AutoTokenizer.from_pretrained(FINETUNED_MODEL_PATH)
        model = AutoModelForSequenceClassification.from_pretrained(FINETUNED_MODEL_PATH)
        
        # 🔍 Debug: Ver configuración del modelo
        print("📊 Configuración del modelo:")
        print(f"   - num_labels: {model.config.num_labels}")
        print(f"   - id2label: {model.config.id2label}")
        print(f"   - label2id: {model.config.label2id}")
        
        # Crear pipeline con return_all_scores=True en lugar de top_k=None
        classifier = pipeline(
            "text-classification", 
            model=model, 
            tokenizer=tokenizer, 
            return_all_scores=True,  # 🔧 Cambio importante
            device=-1
        )
        
        print("✅ Modelo fine-tuneado cargado exitosamente")
        return classifier
        
    except Exception as e:
        print(f"❌ Error cargando modelo: {e}")
        import traceback
        traceback.print_exc()
        raise e

# Cargar el modelo al iniciar
print("🚀 Iniciando carga del modelo...")
classifier = load_finetuned_classifier()

@app.post("/predict")
def predict_emotion(payload: InputText):
    """Endpoint principal para análisis de emociones"""
    if not payload.text or len(payload.text.strip()) < 2:
        raise HTTPException(400, "Texto muy corto o vacío")

    print(f"📝 Analizando texto: '{payload.text[:50]}...'")
    
    try:
        # Procesar con el modelo
        raw_predictions = classifier(payload.text)
        
        print(f"🔍 Tipo de predicciones: {type(raw_predictions)}")
        print(f"🔍 Predicciones raw: {raw_predictions}")
        
        # 🔧 SOLUCIÓN: Manejar el formato anidado [[{...}]]
        predictions = raw_predictions
        
        # Si es una lista anidada, extraer el primer elemento
        if isinstance(predictions, list) and len(predictions) > 0:
            if isinstance(predictions[0], list):
                # Formato [[{...}]] -> extraer la lista interna
                predictions = predictions[0]
                print(f"🔧 Extraído de formato anidado: {predictions}")
        
        # Verificar que tenemos una lista de diccionarios
        if not isinstance(predictions, list):
            raise Exception(f"Formato inesperado: {type(predictions)}")
        
        # Formatear resultado
        formatted_predictions = []
        for pred in predictions:
            if isinstance(pred, dict):
                label = pred.get("label", "unknown")
                score = pred.get("score", 0)
                
                formatted_predictions.append({
                    "label": str(label),
                    "score": float(score)
                })
                print(f"✅ Procesado: {label} -> {score:.4f}")
            else:
                print(f"⚠️ Elemento ignorado (no es dict): {pred}")
        
        # Verificar que tenemos resultados
        if not formatted_predictions:
            raise Exception("No se encontraron predicciones válidas")
        
        # Ordenar por score y tomar top 3
        top_emotions = sorted(
            formatted_predictions, 
            key=lambda x: x["score"], 
            reverse=True
        )[:3]
        
        print(f"🏆 Top 3 emociones: {top_emotions}")
        
        return {
            "success": True,
            "emotions": top_emotions,
            "model_info": {
                "name": "spanish-emotions-finetuned",
                "checkpoint": FINETUNED_MODEL_PATH.split('/')[-1],
                "total_emotions_detected": len(formatted_predictions)
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
        # 🔧 Test más seguro
        test_result = classifier("Me siento feliz")
        print(f"🔍 Test result type: {type(test_result)}")
        print(f"🔍 Test result: {test_result}")
        
        # Extraer primer resultado de forma segura
        first_result = None
        if isinstance(test_result, list) and len(test_result) > 0:
            first_result = test_result[0]
            if isinstance(first_result, dict):
                test_label = first_result.get("label", first_result.get("LABEL", "unknown"))
            else:
                test_label = str(first_result)
        else:
            test_label = "test_completed"
        
        return {
            "status": "ok", 
            "model_loaded": True,
            "checkpoint": FINETUNED_MODEL_PATH.split('/')[-1],
            "test_prediction": test_label
        }
    except Exception as e:
        print(f"❌ Error en health check: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error", 
            "model_loaded": False, 
            "error": str(e)
        }

@app.get("/model-info")
def get_model_info():
    """Endpoint para obtener información del modelo"""
    try:
        # Acceder al modelo directamente
        model = classifier.model
        tokenizer = classifier.tokenizer
        
        return {
            "model_name": model.config.name_or_path if hasattr(model.config, 'name_or_path') else "unknown",
            "num_labels": model.config.num_labels,
            "id2label": model.config.id2label,
            "label2id": model.config.label2id,
            "tokenizer_vocab_size": tokenizer.vocab_size,
            "checkpoint_path": FINETUNED_MODEL_PATH
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    print("🌟 Iniciando servidor FastAPI...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)