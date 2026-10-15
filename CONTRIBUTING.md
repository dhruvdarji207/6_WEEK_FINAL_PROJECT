# Contributing to Waste2Worth AI

Thank you for your interest in contributing to **Waste2Worth AI — AI-Powered Industrial Waste Exchange Marketplace**.

## Development Workflow

1. **Fork & Clone:**
   ```bash
   git clone https://github.com/your-username/Waste2Worth-AI.git
   cd Waste2Worth-AI
   ```

2. **Backend Setup:**
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate

   pip install -r requirements.txt
   python backend/app/db/seed_db.py
   python ml/train_all.py
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Testing Standards:**
   Before submitting a Pull Request, ensure that all automated tests pass:
   ```bash
   pytest tests/ -v
   cd frontend && npm run build
   ```

## Contribution Guidelines

- Preserve the distinction between synthetic benchmark fixtures and verified pilot data.
- Ensure all new API endpoints have corresponding Pydantic schemas and unit tests.
- Maintain clear commit messages following Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`).
