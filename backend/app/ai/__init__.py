# Import all providers to trigger their factory registration.
# Each import is wrapped in try/except so missing SDKs don't crash the app.

def _safe_import(module_path: str):
    try:
        __import__(module_path)
    except ImportError as e:
        import logging
        logging.getLogger(__name__).warning(f"Could not load {module_path}: {e}")

_safe_import("app.ai.providers.openai_provider")
_safe_import("app.ai.providers.anthropic_provider")
_safe_import("app.ai.providers.gemini_provider")
_safe_import("app.ai.providers.mistral_provider")
_safe_import("app.ai.providers.openai_compatible_provider")
_safe_import("app.ai.providers.qwen_provider")
