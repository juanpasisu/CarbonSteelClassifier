"""Reproducible dataset and training configuration."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DatasetConfig:
    """Configuration shared by dataset preparation and future training."""

    image_size: tuple[int, int] = (224, 224)
    seed: int = 42
    validation_split: float = 0.15
    test_split: float = 0.15
    batch_size: int = 32
    supported_extensions: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".webp"})


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_DIR = PROJECT_ROOT / "ml" / "data" / "raw"
DATASET_CONFIG = DatasetConfig()
