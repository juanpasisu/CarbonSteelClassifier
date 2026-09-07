from tensorflow import keras

from ml.src.config.classes import get_class_registry
from ml.src.models.cnn import build_mobilenet_v2_classifier


def test_cnn_outputs_seven_probabilities() -> None:
    model = build_mobilenet_v2_classifier(num_classes=7, trainable_base=False)
    batch = keras.ops.zeros((2, 224, 224, 3))
    probabilities = model(batch, training=False)
    assert tuple(probabilities.shape) == (2, 7)


def test_registry_matches_official_training_order() -> None:
    names = [item["name"] for item in get_class_registry()]
    assert names == [
        "Austenita",
        "Ferrita",
        "Perlita",
        "Cementita + Perlita",
        "Perlita + Ferrita Widmanstätten",
        "Perlita + Ferrita Equiaxial",
        "Martensita",
    ]
