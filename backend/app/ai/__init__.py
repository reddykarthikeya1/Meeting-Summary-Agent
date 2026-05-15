# Import all providers to trigger their factory registration
import app.ai.providers.openai_provider  # noqa: F401
import app.ai.providers.anthropic_provider  # noqa: F401
import app.ai.providers.gemini_provider  # noqa: F401
import app.ai.providers.mistral_provider  # noqa: F401
import app.ai.providers.openai_compatible_provider  # noqa: F401
import app.ai.providers.qwen_provider  # noqa: F401
