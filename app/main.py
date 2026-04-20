from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil

app = FastAPI()

BASE_DIR = Path(__file__).parent
ROM_DIR = BASE_DIR / "roms"
SAVE_DIR = BASE_DIR / "saves"
STATIC_DIR = BASE_DIR / "static"

# Ensure directories exist
ROM_DIR.mkdir(parents=True, exist_ok=True)
SAVE_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
async def root():
    # Serve the main index.html
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {"message": "RetroVault GBA Emulator - Please add index.html to static/"}


@app.get("/rom")
async def get_rom():
    # Return the first ROM file found (for V1 single ROM)
    rom_files = list(ROM_DIR.glob("*.gba"))
    if not rom_files:
        raise HTTPException(status_code=404, detail="ROM not found")
    return FileResponse(rom_files[0])


@app.post("/upload-save")
async def upload_save(file: UploadFile = File(...)):
    save_path = SAVE_DIR / file.filename
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"status": "saved", "filename": file.filename}


@app.get("/download-save")
async def download_save(filename: str):
    save_path = SAVE_DIR / filename
    if not save_path.is_file():
        raise HTTPException(status_code=404, detail="Save file not found")
    return FileResponse(save_path)
