from pathlib import Path

from ml.src.data.index import ImageRecord, split_by_source_group


def test_split_keeps_augmented_variants_together() -> None:
    records = [
        ImageRecord(Path("a.png"), "austenita", "source-a", False),
        ImageRecord(Path("a_aug1.png"), "austenita", "source-a", True),
        ImageRecord(Path("b.png"), "austenita", "source-b", False),
        ImageRecord(Path("c.png"), "austenita", "source-c", False),
        ImageRecord(Path("d.png"), "austenita", "source-d", False),
        ImageRecord(Path("e.png"), "austenita", "source-e", False),
        ImageRecord(Path("f.png"), "austenita", "source-f", False),
    ]

    partitions = split_by_source_group(records, validation_split=0.2, test_split=0.2, seed=42)
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
