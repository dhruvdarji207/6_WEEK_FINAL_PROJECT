# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Architecture & Best Practices

Waste2Worth AI implements defense-in-depth principles:
1. **Password Hashing:** Passwords are hashed using salted Bcrypt (`bcrypt.hashpw` with standard 12 salt rounds). Plaintext passwords are never stored.
2. **Server-Side Authorization:** Role-Based Access Control (RBAC) is enforced strictly on the server layer using FastAPI dependencies (`require_role`), preventing privilege escalation from frontend tampering.
3. **Audit Trails:** All sensitive transitions, moderations, user logins, and registrations generate immutable entries in the `AuditLog` table.
4. **Input Validation:** All payloads are validated using Pydantic v2 schemas with strict boundaries (e.g. non-negative pricing, bounded contamination 0-100%).
5. **No Secrets in Code:** Environment configuration files (`.env`) are excluded via `.gitignore`. The starter `.env.example` contains placeholders only.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly by contacting the project maintainers or creating a private advisory. Please do not disclose vulnerabilities publicly until patched.
