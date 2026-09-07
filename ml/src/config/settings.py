"""Reproducible dataset and training configuration."""

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class DatasetConfig:
    """Configuration shared by dataset preparation, training and inference."""

    image_size: tuple[int, int] = (224, 224)
    seed: int = 42
    validation_split: float = 0.15
    test_split: float = 0.15
    batch_size: int = 32
    supported_extensions: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".webp"})


@dataclass(frozen=True)
class TrainingConfig:
    """Hyperparameters for CNN training."""

    epochs: int = 20
    learning_rate: float = 1e-3
    fine_tune_learning_rate: float = 1e-4
    fine_tune_epochs: int = 8
    weight_decay: float = 1e-4
    early_stopping_patience: int = 5
    num_workers: int = 0
    model_name: str = "MicrostructureCNN"
    model_version: str = "2.0"


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_DATASET_DIR = PROJECT_ROOT / "ml" / "data" / "raw"
DEFAULT_CHECKPOINT_DIR = PROJECT_ROOT / "ml" / "models" / "checkpoints"
DEFAULT_TRAINED_DIR = PROJECT_ROOT / "ml" / "models" / "trained"
DATASET_CONFIG = DatasetConfig()
TRAINING_CONFIG = TrainingConfig()
