from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from predict import predict_image

app = FastAPI()

# ✅ CORS FIX (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Home route
@app.get("/")
def home():
    return {"message": "Plant Disease API running 🌿"}

# ✅ Prediction route
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ✅ Predict
        label, confidence = predict_image(file_path)

        # ✅ FIX: clean label
        clean_label = label.replace("_", " ").title()

        # ✅ FIX: detect healthy properly
        is_healthy = "healthy" in label.lower()

        return {
            "label": clean_label,
            "confidence": round(confidence, 2),
            "is_healthy": is_healthy
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        # ✅ Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)