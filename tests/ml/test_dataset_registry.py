from pathlib import Path

from ml.src.config.classes import get_class_registry
from ml.src.data.validate_dataset import source_group_id


def test_registry_contains_the_seven_confirmed_classes() -> None:
    assert [item["slug"] for item in get_class_registry()] == [
        "austenita",
        "ferrita",
        "martensita",
        "perlita",
        "perlita-cementita",
        "perlita-ferrita-equiaxial",
        "perlita-ferrita-widmanstatten",
    ]


def test_augmented_images_share_their_original_source_group() -> None:
    assert source_group_id(Path("sample_aug2.png")) == "sample"
    assert source_group_id(Path("sample.png")) == "sample"
