"""Explicit offline character designs; cast measurements belong to the island catalog."""

from dataclasses import dataclass
import importlib.util
import json
from pathlib import Path


CATALOG = Path(__file__).resolve().parents[2] / "character-catalog.json"


@dataclass(frozen=True)
class CharacterIdentity:
    key: str
    gender: str
    height_m: float
    npc_age_years: int | None = None


def npc_identity(identifier):
    record = json.loads(CATALOG.read_text(encoding="utf-8"))["npcs"][identifier]
    return CharacterIdentity(identifier, record["gender"], record["heightMetres"], record["age"])


def player_identity(gender, age):
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    if age not in catalog["playerAges"]:
        raise ValueError(f"Unknown player appearance age: {age}")
    return CharacterIdentity(f"player-{gender}-{age}", gender, catalog["playerBodies"][gender]["heightMetres"])


@dataclass(frozen=True)
class CharacterDesign:
    identity: CharacterIdentity
    morphs: dict[str, float]
    standing_pose: dict[str, float]
    walk_arm_clearance: float
    brow_arch: dict[str, float]
    # Only a separately authored style may enter the clothed-sample builder.
    # None is a real unfinished art boundary, not a fallback to Ye's clothes/hair.
    sample_style: str | None = None


def load_design(path):
    """Load a user-selected local design, with no implicit character or network access."""
    source = Path(path).resolve(strict=True)
    spec = importlib.util.spec_from_file_location("island_selected_design", source)
    if spec is None or spec.loader is None:
        raise ValueError(f"Not a Python character design: {source}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    design = module.DESIGN
    if not isinstance(design, CharacterDesign):
        raise TypeError("The selected module must export a CharacterDesign as DESIGN")
    if design.identity.gender not in ("female", "male"):
        raise ValueError("Unknown authored body identity")
    if design.identity.npc_age_years is not None and design.identity.npc_age_years < 18:
        raise ValueError("NPC character production requires an authored adult identity")
    return design
