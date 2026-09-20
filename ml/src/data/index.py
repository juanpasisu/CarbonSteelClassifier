"""Build and split a folder-based image dataset without source leakage."""

import random
from dataclasses import dataclass
from pathlib import Path

from ml.src.config.settings import DATASET_CONFIG, DEFAULT_DATASET_DIR
from ml.src.data.validate_dataset import is_ignored_auxiliary_file, source_group_id


@dataclass(frozen=True)
class ImageRecord:
    """Metadata for one valid image file in the dataset."""

    path: Path
    class_slug: str
    source_group: str
    is_augmented: bool


def build_image_index(dataset_dir: Path = DEFAULT_DATASET_DIR) -> list[ImageRecord]:
    """Index supported image files using the canonical class-folder labels."""

    records: list[ImageRecord] = []
    for class_slug in (item["slug"] for item in _class_registry()):
        class_dir = dataset_dir / class_slug
        if not class_dir.is_dir():
            continue

        for path in sorted(class_dir.rglob("*")):
            if (
                not path.is_file()
                or is_ignored_auxiliary_file(path)
                or path.suffix.lower() not in DATASET_CONFIG.supported_extensions
            ):
                continue

            group = source_group_id(path)
            records.append(
                ImageRecord(
                    path=path,
                    class_slug=class_slug,
                    source_group=group,
                    is_augmented=group != path.stem,
                )
            )

    return records


def split_by_source_group(
    records: list[ImageRecord],
    validation_split: float = DATASET_CONFIG.validation_split,
    test_split: float = DATASET_CONFIG.test_split,
    seed: int = DATASET_CONFIG.seed,
) -> dict[str, list[ImageRecord]]:
    """Split records 70/20/10 by source group while preserving class representation.

    Fractions follow the original work plan (train/validation/test). All original
    and augmented variants of one source image stay in exactly one partition so
    that a random-by-file split cannot leak the same micrograph into two sets.
    Groups are shuffled independently inside each class to avoid letting the
    larger classes dominate the split.
    """

    if validation_split < 0 or test_split < 0 or validation_split + test_split >= 1:
        raise ValueError("validation_split and test_split must be non-negative and sum to less than one")

    grouped: dict[str, dict[str, list[ImageRecord]]] = {}
    for record in records:
        grouped.setdefault(record.class_slug, {}).setdefault(record.source_group, []).append(record)

    partitions: dict[str, list[ImageRecord]] = {"train": [], "validation": [], "test": []}
    for class_slug, class_groups in sorted(grouped.items()):
        group_ids = list(class_groups)
        random.Random(f"{seed}:{class_slug}").shuffle(group_ids)
        group_count = len(group_ids)
        test_count = max(1, round(group_count * test_split)) if test_split else 0
        validation_count = max(1, round(group_count * validation_split)) if validation_split else 0
        if test_count + validation_count >= group_count:
            raise ValueError(f"Not enough source groups to split class {class_slug!r}")

        test_groups = set(group_ids[:test_count])
        validation_groups = set(group_ids[test_count : test_count + validation_count])

        for group_id, group_records in class_groups.items():
            partition = (
                "test"
                if group_id in test_groups
                else "validation"
                if group_id in validation_groups
                else "train"
            )
            partitions[partition].extend(group_records)

    for partition_records in partitions.values():
        partition_records.sort(key=lambda record: str(record.path))

    return partitions


def _class_registry() -> tuple[dict[str, object], ...]:
    """Import the registry lazily to keep the module easy to inspect."""

    from ml.src.config.classes import get_class_registry

    return get_class_registry()
