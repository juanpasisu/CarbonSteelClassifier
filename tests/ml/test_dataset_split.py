from pathlib import Path

from ml.src.config.phase_presence import phase_presence_for_class
from ml.src.config.settings import DATASET_CONFIG
from ml.src.data.index import ImageRecord, split_by_source_group
from ml.src.evaluation.external import assert_no_source_overlap
from ml.src.training.dataset import build_train_augmenter


def test_default_split_follows_work_plan_70_20_10() -> None:
    assert DATASET_CONFIG.validation_split == 0.20
    assert DATASET_CONFIG.test_split == 0.10
    assert abs(1.0 - DATASET_CONFIG.validation_split - DATASET_CONFIG.test_split - 0.70) < 1e-9


def test_split_keeps_augmented_variants_together() -> None:
    records = [
        ImageRecord(Path("a.png"), "austenita", "source-a", False),
        ImageRecord(Path("a_aug1.png"), "austenita", "source-a", True),
        ImageRecord(Path("b.png"), "austenita", "source-b", False),
        ImageRecord(Path("c.png"), "austenita", "source-c", False),
        ImageRecord(Path("d.png"), "austenita", "source-d", False),
        ImageRecord(Path("e.png"), "austenita", "source-e", False),
        ImageRecord(Path("f.png"), "austenita", "source-f", False),
        ImageRecord(Path("g.png"), "austenita", "source-g", False),
        ImageRecord(Path("h.png"), "austenita", "source-h", False),
        ImageRecord(Path("i.png"), "austenita", "source-i", False),
        ImageRecord(Path("j.png"), "austenita", "source-j", False),
    ]

    partitions = split_by_source_group(records, seed=42)
    locations = {
        record.source_group: partition
        for partition, partition_records in partitions.items()
        for record in partition_records
    }

    assert locations["source-a"] in {"train", "validation", "test"}
    assert all(
        locations[record.source_group] == locations["source-a"]
        for record in records[:2]
    )

    group_counts = {
        name: len({record.source_group for record in partition_records})
        for name, partition_records in partitions.items()
    }
    assert group_counts["test"] == 1
    assert group_counts["validation"] == 2
    assert group_counts["train"] == 7


def test_phase_presence_matches_work_plan_constituents() -> None:
    ferrite = {item["name"]: item["present"] for item in phase_presence_for_class("Ferrita")}
    pearlite = {item["name"]: item["present"] for item in phase_presence_for_class("Perlita")}
    martensite = {
        item["name"]: item["present"] for item in phase_presence_for_class("Martensita")
    }

    assert ferrite == {"Ferrita": True, "Perlita": False, "Cementita": False}
    assert pearlite == {"Ferrita": True, "Perlita": True, "Cementita": True}
    assert martensite == {"Ferrita": False, "Perlita": False, "Cementita": False}


def test_train_augmenter_applies_joint_geometric_and_photometric_ops() -> None:
    names = [layer.name for layer in build_train_augmenter().layers]
    joined = " ".join(names)
    assert "random_flip" in joined or any("flip" in name for name in names)
    assert any("rotation" in name for name in names)
    assert any("zoom" in name for name in names)
    assert any("brightness" in name for name in names)
    assert any("contrast" in name for name in names)


def test_external_overlap_is_rejected() -> None:
    shared = ImageRecord(Path("lab.png"), "ferrita", "coupon-1", False)
    try:
        assert_no_source_overlap([shared], [shared])
    except ValueError as error:
        assert "overlaps" in str(error)
    else:
        raise AssertionError("expected overlap to raise ValueError")
