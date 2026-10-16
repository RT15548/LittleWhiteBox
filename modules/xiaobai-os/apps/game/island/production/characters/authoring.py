"""Local input validation and new-output protection shared by authoring entry points."""

import os
from pathlib import Path
import subprocess

from makehuman_data import SOURCE_COMMIT


def prepare_build(source, output, design):
    source, output = Path(source).resolve(strict=True), Path(output).resolve()
    data = source / "makehuman/data"
    required = ["3dobjs/base.obj", "rigs/default.mhskel", "rigs/default_weights.mhw",
                "eyes/low-poly/low-poly.obj", "eyes/low-poly/low-poly.mhclo", "eyes/materials/brown_eye.png"]
    missing = [str(data / path) for path in required if not (data / path).is_file()]
    missing.extend(str(data / "targets" / path) for path in design.morphs
                   if not (data / "targets" / path).is_file())
    if missing:
        raise FileNotFoundError("Missing local character inputs; no download attempted:\n" + "\n".join(missing))
    # An authoring run may create a new review, never overwrite a prior review or approved source.
    output.mkdir(parents=True, exist_ok=False)
    receipt = output / "source-commit.txt"
    environment = {**os.environ, "GIT_NO_LAZY_FETCH": "1"}
    # A real file avoids subprocess pipe handles, unsupported inside the Windows sandbox.
    with receipt.open("w", encoding="utf-8") as stream:
        subprocess.run(["git", "--no-optional-locks", "-C", str(source), "rev-parse", "HEAD"],
                       stdout=stream, check=True, env=environment)
    revision = receipt.read_text(encoding="utf-8").strip()
    if revision != SOURCE_COMMIT:
        raise ValueError(f"Unexpected source revision: {revision}")
    return source, output
