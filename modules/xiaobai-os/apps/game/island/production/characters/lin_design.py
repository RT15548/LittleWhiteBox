"""Lin's independent adult anatomy; her surface design is owned by roster_designs."""

from design import CharacterDesign, npc_identity

# Long, slender lines with a narrow ribcage and light limbs, not fuller thighs.
# Keep the waist/bust silhouette readable without widening the whole torso.
LEAN_BLEND = 0.82
MORPHS = {
    "macrodetails/asian-female-young.target": 1.0,
    "macrodetails/universal-female-young-averagemuscle-minweight.target": LEAN_BLEND,
    "head/head-oval.target": 0.48,
    "head/head-round.target": 0.17,
    "head/head-age-incr.target": 0.12,
    "head/head-scale-horiz-incr.target": 0.09,
    "chin/chin-width-decr.target": 0.05,
    "chin/chin-prominent-incr.target": 0.08,
    "chin/chin-height-incr.target": 0.10,
    "nose/nose-width2-decr.target": 0.18,
    "nose/nose-width3-decr.target": 0.08,
    "nose/nose-scale-depth-incr.target": 0.16,
    "mouth/mouth-upperlip-volume-incr.target": 0.14,
    "mouth/mouth-lowerlip-volume-incr.target": 0.24,
    "mouth/mouth-cupidsbow-incr.target": 0.20,
    "mouth/mouth-angles-up.target": 0.05,
    "neck/neck-trans-backward.target": 0.08,
    "neck/neck-scale-horiz-decr.target": 0.14,
    "torso/torso-scale-depth-decr.target": 0.13,
    "torso/torso-scale-horiz-decr.target": 0.23,
    "measure/measure-shoulder-dist-decr.target": 0.45,
    "stomach/stomach-tone-incr.target": 0.28,
    "hip/hip-scale-horiz-decr.target": 0.26,
    "hip/hip-trans-up.target": 0.12,
    "pelvis/pelvis-tone-incr.target": 0.55,
    "breast/breast-trans-up.target": 0.24,
    "breast/breast-volume-vert-up.target": 0.30,
    "breast/breast-dist-decr.target": 0.82,
}
for side in ("l", "r"):
    MORPHS[f"cheek/{side}-cheek-volume-incr.target"] = 0.14
    MORPHS[f"cheek/{side}-cheek-bones-incr.target"] = 0.12
    MORPHS[f"eyes/{side}-eye-scale-incr.target"] = 0.18
    MORPHS[f"eyes/{side}-eye-height1-incr.target"] = 0.12
    MORPHS[f"eyes/{side}-eye-height2-incr.target"] = 0.16
    MORPHS[f"eyes/{side}-eye-corner1-up.target"] = 0.08
    MORPHS[f"armslegs/{side}-upperarm-fat-decr.target"] = 0.24
    MORPHS[f"armslegs/{side}-lowerarm-fat-decr.target"] = 0.12
    MORPHS[f"armslegs/{side}-upperleg-fat-decr.target"] = 0.52
    MORPHS[f"armslegs/{side}-lowerleg-fat-decr.target"] = 0.34
    MORPHS[f"armslegs/{side}-upperleg-scale-horiz-decr.target"] = 0.20
    MORPHS[f"armslegs/{side}-lowerleg-scale-horiz-decr.target"] = 0.17
    MORPHS[f"armslegs/{side}-hand-fingers-distance-decr.target"] = 0.32
    MORPHS[f"armslegs/{side}-upperarm-shoulder-muscle-decr.target"] = 0.30
for weight, contribution in (("averageweight", 1 - LEAN_BLEND), ("minweight", LEAN_BLEND)):
    stem = f"female-young-averagemuscle-{weight}"
    MORPHS[f"macrodetails/proportions/{stem}-idealproportions.target"] = 0.32 * contribution
    MORPHS[f"breast/{stem}-averagecup-maxfirmness.target"] = 0.62 * contribution
    MORPHS[f"breast/{stem}-maxcup-maxfirmness.target"] = 0.28 * contribution

STANDING_POSE = {"neck_lower": -7, "neck_upper": -2, "head": 9, "thigh_out": 5,
                 "shoulder_drop": 1.5, "upperarm_in": 36, "elbow_unbend": 30,
                 "forearm_out": 7, "wrist_out": 20, "thumb_fold": 30}
DESIGN = CharacterDesign(identity=npc_identity("lin"), morphs=MORPHS,
                         standing_pose=STANDING_POSE, walk_arm_clearance=4.5,
                         brow_arch={"height": 0.0034, "peak_curve": 1.3, "tail_drop": 0.0010})
