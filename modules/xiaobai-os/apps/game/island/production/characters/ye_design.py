"""Art direction for the first adult, fictional survivor sample; not a face scan."""

# User-supplied design constraints, not measurements inferred from the reference photos.
BRIEF = {"height_m": 1.60, "mass_kg": 45, "bra_cup": "C", "age_years": 45}
HEIGHT = BRIEF["height_m"]

# Visual authoring controls. These are not a kilograms/cup-size conversion formula.
LEAN_BLEND = 0.68
PROPORTION_BLEND = 0.30
CUP_VOLUME_BLEND = 0.46
FIRMNESS_BLEND = 0.76
# Brow silhouette in metres, independent of skin color and scalp hair.
BROW_ARCH = {"height": 0.0048, "peak_curve": 1.5, "tail_drop": 0.0012}
# Rest geometry stays in its binding pose. These angles describe the character's
# presentation stance, shared by the clay review and both exported motion clips.
STANDING_POSE = {
    "shoulder_drop": 1.5,
    "upperarm_in": 36,
    "elbow_unbend": 30,
    "forearm_out": 7,
    "wrist_out": 21,
    "thumb_fold": 30,
}
WALK_ARM_CLEARANCE = 3.5
MORPHS = {
    "macrodetails/asian-female-young.target": 1.0,
    "macrodetails/universal-female-young-averagemuscle-minweight.target": LEAN_BLEND,
    "head/head-oval.target": 0.30,
    "head/head-invertedtriangular.target": 0.62,
    "head/head-age-incr.target": 0.24,
    "head/head-scale-horiz-decr.target": 0.06,
    "chin/chin-width-decr.target": 0.10,
    "chin/chin-prominent-decr.target": 0.12,
    "chin/chin-bones-decr.target": 0.44,
    "chin/chin-height-decr.target": 0.14,
    "nose/nose-width2-decr.target": 0.44,
    "nose/nose-width3-decr.target": 0.16,
    "nose/nose-scale-depth-incr.target": 0.10,
    "nose/nose-point-width-decr.target": 0.18,
    "mouth/mouth-upperlip-volume-incr.target": 0.26,
    "mouth/mouth-lowerlip-volume-incr.target": 0.20,
    "mouth/mouth-upperlip-height-incr.target": 0.42,
    "mouth/mouth-lowerlip-height-incr.target": 0.24,
    "mouth/mouth-cupidsbow-incr.target": 0.54,
    "mouth/mouth-trans-backward.target": 0.22,
    "mouth/mouth-angles-up.target": 0.16,
    "neck/neck-trans-backward.target": 0.18,
    "neck/neck-scale-horiz-decr.target": 0.10,
    "torso/torso-scale-depth-decr.target": 0.12,
    "torso/torso-scale-horiz-decr.target": 0.18,
    "measure/measure-shoulder-dist-decr.target": 0.50,
    "stomach/stomach-tone-incr.target": 0.24,
    "hip/hip-scale-horiz-decr.target": 0.32,
    "hip/hip-trans-up.target": 0.16,
    "pelvis/pelvis-tone-incr.target": 0.65,
    "breast/breast-trans-up.target": 0.22,
    "breast/breast-volume-vert-up.target": 0.40,
    "breast/breast-dist-decr.target": 0.58,
}

for side in ("l", "r"):
    # Keep cheek fullness above the jaw instead of narrowing the entire face.
    MORPHS[f"cheek/{side}-cheek-inner-incr.target"] = 0.16
    MORPHS[f"cheek/{side}-cheek-volume-incr.target"] = 0.10
    MORPHS[f"cheek/{side}-cheek-trans-up.target"] = 0.22
    MORPHS[f"cheek/{side}-cheek-bones-incr.target"] = 0.08
    MORPHS[f"eyes/{side}-eye-scale-incr.target"] = 0.38
    MORPHS[f"eyes/{side}-eye-height1-incr.target"] = 0.32
    MORPHS[f"eyes/{side}-eye-height2-incr.target"] = 0.46
    MORPHS[f"eyes/{side}-eye-height3-incr.target"] = 0.22
    MORPHS[f"eyes/{side}-eye-corner1-up.target"] = 0.18
    MORPHS[f"eyes/{side}-eye-eyefold-up.target"] = 0.28
    for region, amount in (("upperarm", 0.16), ("lowerarm", 0.08), ("upperleg", 0.50), ("lowerleg", 0.30)):
        MORPHS[f"armslegs/{side}-{region}-fat-decr.target"] = amount
    MORPHS[f"armslegs/{side}-upperleg-scale-horiz-decr.target"] = 0.20
    MORPHS[f"armslegs/{side}-lowerleg-scale-horiz-decr.target"] = 0.16
    MORPHS[f"armslegs/{side}-hand-fingers-distance-decr.target"] = 0.38
    MORPHS[f"armslegs/{side}-upperarm-shoulder-muscle-decr.target"] = 0.32

# Blend each supplied shape against the same body-weight mixture; don't add both at full strength.
for weight, contribution in (("averageweight", 1 - LEAN_BLEND), ("minweight", LEAN_BLEND)):
    stem = f"female-young-averagemuscle-{weight}"
    MORPHS[f"macrodetails/proportions/{stem}-idealproportions.target"] = PROPORTION_BLEND * contribution
    MORPHS[f"breast/{stem}-maxcup-averagefirmness.target"] = CUP_VOLUME_BLEND * (1 - FIRMNESS_BLEND) * contribution
    MORPHS[f"breast/{stem}-averagecup-maxfirmness.target"] = (1 - CUP_VOLUME_BLEND) * FIRMNESS_BLEND * contribution
    MORPHS[f"breast/{stem}-maxcup-maxfirmness.target"] = CUP_VOLUME_BLEND * FIRMNESS_BLEND * contribution
