try:
    from app.core.database import SessionLocal, engine, Base
    print("✓ Database imports successful")
except ImportError as e:
    print(f"✗ Database import error: {e}")

try:
    from app.core.config import settings
    print("✓ Config import successful")
except ImportError as e:
    print(f"✗ Config import error: {e}")

try:
    from app.routers import auth
    print("✓ Auth router import successful")
except ImportError as e:
    print(f"✗ Auth router import error: {e}")

try:
    from app.routers import leaves
    print("✓ Leaves router import successful")
except ImportError as e:
    print(f"✗ Leaves router import error: {e}")

try:
    from app.routers import users
    print("✓ Users router import successful")
except ImportError as e:
    print(f"✗ Users router import error: {e}")

print("All imports tested")