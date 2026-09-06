"""Upload the image-only training dataset to Supabase Storage."""

from __future__ import annotations

import argparse
import json
import os
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen


ALLOWED_MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


def read_dotenv(path: Path) -> dict[str, str]:
    """Read simple KEY=VALUE entries without exposing them in output."""

    values: dict[str, str] = {}
    if not path.is_file():
        return values

    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        values[key] = value
    return values


def load_required_settings(env_file: Path) -> tuple[str, str]:
    """Load the Supabase URL and backend-only service-role key."""

    file_values = read_dotenv(env_file)
    supabase_url = os.environ.get("SUPABASE_URL", file_values.get("SUPABASE_URL", ""))
    service_role_key = os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY",
        file_values.get("SUPABASE_SERVICE_ROLE_KEY", ""),
    )
    if not supabase_url or not service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in the environment."
        )
    return supabase_url.rstrip("/"), service_role_key


def load_class_slugs(registry_path: Path) -> set[str]:
    """Load the canonical class slugs instead of duplicating them."""

    payload = json.loads(registry_path.read_text(encoding="utf-8"))
    entries = payload.get("classes", [])
    slugs = {str(entry["slug"]) for entry in entries}
    if not slugs:
        raise RuntimeError(f"No classes found in {registry_path}.")
    return slugs


def iter_image_paths(dataset_root: Path, class_slugs: set[str]) -> list[Path]:
    """Return supported images and reject files outside canonical class folders."""

    if not dataset_root.is_dir():
        raise RuntimeError(f"Dataset directory does not exist: {dataset_root}")

    images: list[Path] = []
    for path in sorted(dataset_root.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in ALLOWED_MIME_TYPES:
            continue
        relative_parts = path.relative_to(dataset_root).parts
        if not relative_parts or relative_parts[0] not in class_slugs:
            raise RuntimeError(
                f"Image is not inside a canonical class folder: {path}"
            )
        images.append(path)
    return images


def storage_object_path(
    image_path: Path, dataset_root: Path, prefix: str
) -> str:
    """Create a Storage-safe path while preserving the original file locally."""

    relative_parts = image_path.relative_to(dataset_root).parts
    normalized_parts = [
        unicodedata.normalize("NFKD", part)
        .encode("ascii", errors="ignore")
        .decode("ascii")
        for part in relative_parts
    ]
    relative_path = "/".join(normalized_parts)
    return f"{prefix.strip('/')}/{relative_path}"


def upload_one(
    image_path: Path,
    dataset_root: Path,
    supabase_url: str,
    service_role_key: str,
    bucket: str,
    prefix: str,
    retries: int,
) -> str:
    """Upload one image with idempotent overwrite semantics."""

    object_path = storage_object_path(image_path, dataset_root, prefix)
    encoded_bucket = quote(bucket, safe="")
    encoded_object_path = quote(object_path, safe="/")
    endpoint = (
        f"{supabase_url}/storage/v1/object/"
        f"{encoded_bucket}/{encoded_object_path}"
    )
    request = Request(
        endpoint,
        data=image_path.read_bytes(),
        method="POST",
        headers={
            "Authorization": f"Bearer {service_role_key}",
            "apikey": service_role_key,
            "Content-Type": ALLOWED_MIME_TYPES[image_path.suffix.lower()],
            "Cache-Control": "3600",
            "x-upsert": "true",
        },
    )

    for attempt in range(retries + 1):
        try:
            with urlopen(request, timeout=60) as response:
                if response.status not in {200, 201}:
                    raise RuntimeError(
                        f"Unexpected Storage status {response.status} for {image_path}"
                    )
                return object_path
        except HTTPError as error:
            body = error.read(512).decode("utf-8", errors="replace").strip()
            if error.code < 500 or attempt == retries:
                detail = f": {body}" if body else ""
                raise RuntimeError(
                    f"Storage upload failed for {image_path} "
                    f"(HTTP {error.code}){detail}"
                ) from error
        except (TimeoutError, URLError) as error:
            if attempt == retries:
                raise RuntimeError(
                    f"Storage upload failed for {image_path}: {error}"
                ) from error
        time.sleep(2**attempt)

    raise RuntimeError(f"Storage upload failed for {image_path}")


def parse_args() -> argparse.Namespace:
    """Parse the dataset upload options."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", type=Path, default=Path("ml/data/raw"))
    parser.add_argument(
        "--registry",
        type=Path,
        default=Path("shared/microstructure_classes.json"),
    )
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    parser.add_argument("--bucket", default="microstructure-images")
    parser.add_argument("--prefix", default="dataset")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    """Validate and upload the complete local dataset."""

    args = parse_args()
    if args.workers < 1 or args.retries < 0:
        raise SystemExit("--workers must be positive and --retries cannot be negative.")

    class_slugs = load_class_slugs(args.registry)
    image_paths = iter_image_paths(args.dataset, class_slugs)
    total_bytes = sum(path.stat().st_size for path in image_paths)
    print(f"validated-images:{len(image_paths)}")
    print(f"validated-bytes:{total_bytes}")
    print(f"storage-prefix:{args.prefix.strip('/')}")

    if args.dry_run:
        print("upload:dry-run")
        return 0

    supabase_url, service_role_key = load_required_settings(args.env_file)
    failures: list[str] = []
    uploaded = 0
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(
                upload_one,
                path,
                args.dataset,
                supabase_url,
                service_role_key,
                args.bucket,
                args.prefix,
                args.retries,
            ): path
            for path in image_paths
        }
        for future in as_completed(futures):
            path = futures[future]
            try:
                future.result()
                uploaded += 1
                if uploaded % 100 == 0 or uploaded == len(image_paths):
                    print(f"uploaded:{uploaded}/{len(image_paths)}")
            except Exception as error:  # noqa: BLE001 - report all file failures.
                failures.append(f"{path}: {error}")

    if failures:
        print(f"upload:failed:{len(failures)}")
        for failure in failures[:20]:
            print(failure)
        if len(failures) > 20:
            print(f"...and {len(failures) - 20} more failures")
        return 1

    print(f"upload:complete:{uploaded}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
