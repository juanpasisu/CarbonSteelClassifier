"""MobileNetV2 transfer-learning classifier built with TensorFlow/Keras."""

from __future__ import annotations

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers


def build_mobilenet_v2_classifier(
    *,
    num_classes: int = 7,
    image_size: tuple[int, int] = (224, 224),
    dropout_rate: float = 0.2,
    trainable_base: bool = False,
) -> keras.Model:
    """Build MobileNetV2 + classification head for microstructure labels.

    Inputs are expected to be already processed with
    ``tf.keras.applications.mobilenet_v2.preprocess_input``.
    """

    if num_classes != 7:
        raise ValueError(f"Expected exactly 7 classes, received {num_classes}")

    inputs = keras.Input(shape=(*image_size, 3), name="image")
    base_model = keras.applications.MobileNetV2(
        input_shape=(*image_size, 3),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = trainable_base

    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="gap")(x)
    x = layers.Dropout(dropout_rate, name="dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="MicrostructureCNN")
    model.base_model = base_model
    return model


def unfreeze_top_layers(model: keras.Model, *, layers_to_unfreeze: int = 40) -> None:
    """Unfreeze the last convolutional blocks for fine-tuning."""

    base_model = getattr(model, "base_model", None)
    if base_model is None:
        for layer in model.layers:
            if isinstance(layer, keras.Model) and layer.name.startswith("mobilenet"):
                base_model = layer
                model.base_model = layer
                break
    if base_model is None:
        raise ValueError("Model does not expose a MobileNetV2 base_model attribute")

    base_model.trainable = True
    for layer in base_model.layers[:-layers_to_unfreeze]:
        layer.trainable = False


def compile_model(
    model: keras.Model,
    *,
    learning_rate: float,
    class_weight: dict[int, float] | None = None,
) -> None:
    """Compile with sparse categorical cross-entropy and accuracy."""

    del class_weight  # Passed to fit(), not compile().
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.SparseCategoricalCrossentropy(),
        metrics=["accuracy"],
    )


def set_global_seed(seed: int) -> None:
    """Seed Python/runtime RNGs used by TensorFlow."""

    tf.keras.utils.set_random_seed(seed)
