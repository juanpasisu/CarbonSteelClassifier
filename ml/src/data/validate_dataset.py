"""Validate the folder-based image dataset without modifying source files."""

import argparse
import json
import re
from pathlib import Path
from typing import Any

from ml.src.config.classes import get_class_registry
from ml.src.config.settings import DATASET_CONFIG, DEFAULT_DATASET_DIR


_AUGMENTATION_PATTERN = re.compile(r"_aug\d+$", re.IGNORECASE)
_IGNORED_SUFFIX = ":Zone.Identifier"


def source_group_id(image_path: Path) -> str:
    """Return the source image identifier shared by original and augmented files."""

    return _AUGMENTATION_PATTERN.sub("", image_path.stem)


def is_ignored_auxiliary_file(path: Path) -> bool:
    """Identify Windows metadata sidecars that are not dataset images."""

    return path.name == ".gitkeep" or path.name.endswith(_IGNORED_SUFFIX)


def collect_dataset_report(dataset_dir: Path = DEFAULT_DATASET_DIR) -> dict[str, Any]:
    """Build a structural report for the canonical class-folder dataset.

    This function checks paths and extensions only. Pixel-level readability will
    be added to the preprocessing phase, where the selected image library is
    available.
    """

    registry = get_class_registry()
    expected_slugs = [item["slug"] for item in registry]
    expected_set = set(expected_slugs)
    present_directories = (
        {path.name for path in dataset_dir.iterdir() if path.is_dir()}
        if dataset_dir.is_dir()
        else set()
    )

    class_reports: dict[str, dict[str, Any]] = {}
    missing_classes: list[str] = []
    unsupported_files: list[str] = []
    ignored_auxiliary_files: list[str] = []
    total_images = 0
    total_augmented_images = 0
    source_groups: set[tuple[str, str]] = set()

    for slug in expected_slugs:
        class_dir = dataset_dir / slug
        if not class_dir.is_dir():
            missing_classes.append(slug)
            class_reports[slug] = {
                "image_count": 0,
                "source_group_count": 0,
                "augmented_image_count": 0,
            }
            continue

        image_count = 0
        augmented_image_count = 0
        class_source_groups: set[str] = set()

        for path in sorted(class_dir.rglob("*")):
            if not path.is_file():
                continue
            if is_ignored_auxiliary_file(path):
                ignored_auxiliary_files.append(str(path))
                continue
            if path.suffix.lower() not in DATASET_CONFIG.supported_extensions:
                unsupported_files.append(str(path))
                continue

            image_count += 1
            group_id = source_group_id(path)
            class_source_groups.add(group_id)
            source_groups.add((slug, group_id))
            if group_id != path.stem:
                augmented_image_count += 1

        class_reports[slug] = {
            "image_count": image_count,
            "source_group_count": len(class_source_groups),
            "augmented_image_count": augmented_image_count,
            "meets_plan_minimum": image_count >= DATASET_CONFIG.min_images_per_class,
        }
        total_images += image_count
        total_augmented_images += augmented_image_count

    below_plan_minimum = [
        slug
        for slug, report in class_reports.items()
        if report["image_count"] < DATASET_CONFIG.min_images_per_class
    ]

    return {
        "dataset_dir": str(dataset_dir),
        "expected_classes": expected_slugs,
        "unexpected_directories": sorted(present_directories - expected_set),
        "missing_classes": missing_classes,
        "classes": class_reports,
        "total_images": total_images,
        "total_source_groups": len(source_groups),
        "total_augmented_images": total_augmented_images,
        "ignored_auxiliary_file_count": len(ignored_auxiliary_files),
        "unsupported_file_count": len(unsupported_files),
        "unsupported_files": unsupported_files,
        "min_images_per_class": DATASET_CONFIG.min_images_per_class,
        "below_plan_minimum": below_plan_minimum,
        "is_structurally_valid": not missing_classes and total_images > 0,
    }


def main() -> int:
    """Print a JSON dataset report and return a shell-friendly status code."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dataset-dir",
        type=Path,
        default=DEFAULT_DATASET_DIR,
        help="Root directory containing one folder per class slug.",
    )
    args = parser.parse_args()
    report = collect_dataset_report(args.dataset_dir)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["is_structurally_valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
