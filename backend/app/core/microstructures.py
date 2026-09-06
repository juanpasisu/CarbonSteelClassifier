"""Canonical microstructure labels shared by the application domain."""

import json
from functools import lru_cache
from pathlib import Path
from typing import TypedDict


class MicrostructureClass(TypedDict):
    """Serialized representation of one supported microstructure class."""

    slug: str
    name: str
    scientific_description: str


_CLASSES_PATH = Path(__file__).resolve().parents[3] / "shared" / "microstructure_classes.json"


@lru_cache
def get_microstructure_classes() -> tuple[MicrostructureClass, ...]:
    """Load the project-wide class registry from the canonical JSON file."""

    with _CLASSES_PATH.open(encoding="utf-8") as classes_file:
        payload = json.load(classes_file)

    return tuple(payload["classes"])
