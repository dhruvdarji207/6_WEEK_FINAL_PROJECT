import os
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ZIP_OUT = BASE_DIR / "Waste2Worth_AI_GitHub_Release.zip"

EXCLUDED_DIRS = {
    ".venv", "venv", "node_modules", ".git", ".pytest_cache", 
    "__pycache__", "dist", ".vite", "Waste2Worth_AI_Website_Agent_Starter_Kit"
}

EXCLUDED_FILES = {
    "Waste2Worth_AI_Final_Project.zip", "Waste2Worth_AI_GitHub_Release.zip",
    "test_waste2worth.db", ".DS_Store"
}

def create_clean_zip():
    print(f"Creating clean release archive at {ZIP_OUT}...")
    with zipfile.ZipFile(ZIP_OUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(BASE_DIR):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file in files:
                if file in EXCLUDED_FILES or file.endswith('.pyc'):
                    continue
                full_path = Path(root) / file
                rel_path = full_path.relative_to(BASE_DIR)
                zipf.write(full_path, rel_path)
    
    size_mb = ZIP_OUT.stat().st_size / (1024 * 1024)
    print(f"Clean ZIP archive created successfully: {ZIP_OUT.name} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    create_clean_zip()
