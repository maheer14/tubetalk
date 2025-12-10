from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TubeTalk API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    message: str

class VideoRequest(BaseModel):
    youtube_url: str

class VideoResponse(BaseModel):
    success: bool
    message: str
    chunk_count: int = 0
    error: str = None

# Existing endpoints
@app.get("/")
async def root():
    return {"message": "TubeTalk API is running"}

@app.get("/api/health")
async def health_check():
    return HealthResponse(status="ok", message="API is healthy")

@app.post("/api/process-video", response_model=VideoResponse)
async def process_video(request: VideoRequest):
    """
    Process a YouTube video URL and extract transcript
    """
    try:
        youtube_url = request.youtube_url
        
        # Validate URL
        if not youtube_url or ("youtube.com" not in youtube_url and "youtu.be" not in youtube_url):
            return VideoResponse(
                success=False,
                message="Invalid YouTube URL",
                error="Please provide a valid YouTube URL"
            )
        
        print(f"Processing YouTube video: {youtube_url}")
        
        # TODO: Add your actual video processing logic here
        # For now, we'll return a mock response
        
        # Mock processing
        import time
        time.sleep(1)  # Simulate processing time
        
        return VideoResponse(
            success=True,
            message=f"Successfully processed video: {youtube_url}",
            chunk_count=42  # Mock number of transcript chunks
        )
        
    except Exception as e:
        return VideoResponse(
            success=False,
            message="Error processing video",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)