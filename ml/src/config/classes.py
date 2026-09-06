"""Loader for the canonical project microstructure registry."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


_CLASSES_PATH = Path(__file__).resolve().parents[3] / "shared" / "microstructure_classes.json"


@lru_cache
def get_class_registry() -> tuple[dict[str, Any], ...]:
    """Load the class registry used by training and inference."""

    with _CLASSES_PATH.open(encoding="utf-8") as classes_file:
        return tuple(json.load(classes_file)["classes"])
