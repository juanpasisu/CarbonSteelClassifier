"""Presence of ferrite, pearlite and cementite implied by each official class.

The original work plan asked the tool to report those three constituents.
The production model still predicts one of seven morphological labels; this
module translates that label into presence/absence of the three phases named
in the plan, without replacing the seven-class classifier.
"""

from __future__ import annotations

from typing import Any

from ml.src.config.classes import get_class_registry

# Keys: official class slugs. Pearlite always implies ferrite + cementite lamellae.
_PRESENCE_BY_SLUG: dict[str, dict[str, bool]] = {
    "austenita": {"ferrita": False, "perlita": False, "cementita": False},
    "ferrita": {"ferrita": True, "perlita": False, "cementita": False},
    "perlita": {"ferrita": True, "perlita": True, "cementita": True},
    "cementita-perlita": {"ferrita": True, "perlita": True, "cementita": True},
    "perlita-ferrita-widmanstatten": {
        "ferrita": True,
        "perlita": True,
        "cementita": True,
    },
    "perlita-ferrita-equiaxial": {
        "ferrita": True,
        "perlita": True,
        "cementita": True,
    },
    "martensita": {"ferrita": False, "perlita": False, "cementita": False},
}

_PHASE_ORDER: tuple[tuple[str, str], ...] = (
    ("ferrita", "Ferrita"),
    ("perlita", "Perlita"),
    ("cementita", "Cementita"),
)


def _slug_for_label(label: str) -> str:
    """Resolve a display name or slug to the canonical class slug."""

    normalized = label.strip()
    if normalized in _PRESENCE_BY_SLUG:
        return normalized
    for item in get_class_registry():
        if str(item["name"]) == normalized or str(item["slug"]) == normalized:
            return str(item["slug"])
    raise ValueError(f"Unknown microstructure label: {label}")


def phase_presence_for_class(label: str) -> list[dict[str, Any]]:
    """Return ferrite/pearlite/cementite presence for a predicted class."""

    flags = _PRESENCE_BY_SLUG[_slug_for_label(label)]
    return [
        {"slug": slug, "name": name, "present": flags[slug]}
        for slug, name in _PHASE_ORDER
    ]
