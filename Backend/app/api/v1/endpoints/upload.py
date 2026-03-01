from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
from typing import Optional

router = APIRouter()

# Create uploads directory if it doesn't exist
# Get the Backend folder directory
# __file__ = Backend/app/api/v1/endpoints/upload.py
# parent.parent.parent.parent.parent = Backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
UPLOAD_DIR = BASE_DIR / "public" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """
    Upload an image file and return the file path.
    
    Allowed formats: JPG, PNG, GIF, WebP
    Max size: 5MB
    """
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of 5MB"
        )
    
    try:
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Get base URL from request
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        
        # Return full URL for frontend use
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "filename": unique_filename,
                "url": f"{base_url}/uploads/{unique_filename}",
                "original_filename": file.filename
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """
    Delete an uploaded image file.
    """
    try:
        file_path = UPLOAD_DIR / filename
        
        # Security check: ensure file is in uploads directory
        if not str(file_path.resolve()).startswith(str(UPLOAD_DIR.resolve())):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path"
            )
        
        if file_path.exists():
            file_path.unlink()
            return {"message": "Image deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
