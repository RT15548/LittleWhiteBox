"""Independent adult cast morphology and surface art, not gameplay capability."""

from dataclasses import dataclass

from design import CharacterDesign, npc_identity, player_identity
from lin_design import DESIGN as LIN


@dataclass(frozen=True)
class SurfaceStyle:
    hair: str
    hair_color: tuple[float, float, float]
    skin: tuple[float, float, float]
    lip_strength: float


def stance(*, arms, neck, thighs, wrist):
    return {"neck_lower": -neck, "neck_upper": -2, "head": neck + 2,
            "thigh_out": thighs, "shoulder_drop": 1.5, "upperarm_in": arms,
            "elbow_unbend": 30, "forearm_out": 7, "wrist_out": wrist, "thumb_fold": 30}


def bilateral(morphs, controls):
    for side in ("l", "r"):
        for path, value in controls.items():
            morphs[path.format(side=side)] = value
    return morphs


def male_base(old, lean, muscle):
    return {
        "macrodetails/asian-male-young.target": 1 - old,
        "macrodetails/asian-male-old.target": old,
        "macrodetails/universal-male-young-averagemuscle-averageweight.target": (1 - old) * (1 - lean - muscle),
        "macrodetails/universal-male-young-averagemuscle-minweight.target": (1 - old) * lean,
        "macrodetails/universal-male-young-maxmuscle-averageweight.target": (1 - old) * muscle,
        "macrodetails/universal-male-old-averagemuscle-averageweight.target": old,
    }


XU_LEAN_BLEND = .74
XU_MORPHS = bilateral({
    "macrodetails/asian-female-young.target": 1,
    "macrodetails/universal-female-young-averagemuscle-minweight.target": XU_LEAN_BLEND,
    "head/head-round.target": .26, "head/head-invertedtriangular.target": .36,
    "chin/chin-bones-decr.target": .28, "chin/chin-width-decr.target": .12,
    "chin/chin-height-decr.target": .10,
    "nose/nose-width2-decr.target": .32, "nose/nose-scale-depth-decr.target": .10,
    "nose/nose-point-width-decr.target": .18,
    "mouth/mouth-upperlip-volume-incr.target": .22, "mouth/mouth-lowerlip-volume-incr.target": .32,
    "mouth/mouth-cupidsbow-incr.target": .30, "mouth/mouth-angles-up.target": .18,
    "neck/neck-scale-horiz-decr.target": .10, "neck/neck-trans-backward.target": .12,
    "torso/torso-scale-horiz-decr.target": .20, "torso/torso-scale-depth-decr.target": .10,
    "measure/measure-shoulder-dist-decr.target": .43,
    "stomach/stomach-tone-incr.target": .32, "hip/hip-scale-horiz-decr.target": .23,
    "pelvis/pelvis-tone-incr.target": .55, "breast/breast-trans-up.target": .25,
    "breast/breast-volume-vert-up.target": .34, "breast/breast-dist-decr.target": .78,
}, {
    "cheek/{side}-cheek-volume-incr.target": .24,
    "cheek/{side}-cheek-trans-up.target": .12,
    "eyes/{side}-eye-scale-incr.target": .34,
    "eyes/{side}-eye-height1-incr.target": .30,
    "eyes/{side}-eye-height2-incr.target": .36,
    "eyes/{side}-eye-corner1-up.target": .14,
    "armslegs/{side}-upperarm-fat-decr.target": .23,
    "armslegs/{side}-lowerarm-fat-decr.target": .10,
    "armslegs/{side}-upperleg-fat-decr.target": .46,
    "armslegs/{side}-lowerleg-fat-decr.target": .30,
    "armslegs/{side}-upperleg-scale-horiz-decr.target": .16,
    "armslegs/{side}-lowerleg-scale-horiz-decr.target": .12,
    "armslegs/{side}-hand-fingers-distance-decr.target": .34,
    "armslegs/{side}-upperarm-shoulder-muscle-decr.target": .23,
})
for weight, amount in (("averageweight", 1 - XU_LEAN_BLEND), ("minweight", XU_LEAN_BLEND)):
    stem = f"female-young-averagemuscle-{weight}"
    XU_MORPHS[f"macrodetails/proportions/{stem}-idealproportions.target"] = .23 * amount
    XU_MORPHS[f"breast/{stem}-averagecup-maxfirmness.target"] = .58 * amount
    XU_MORPHS[f"breast/{stem}-maxcup-maxfirmness.target"] = .34 * amount

ZHOU_MORPHS = bilateral({
    **male_base(.24, 0, .42),
    "head/head-square.target": .36, "head/head-age-incr.target": .24,
    "chin/chin-width-incr.target": .18, "chin/chin-prominent-incr.target": .16,
    "nose/nose-width2-incr.target": .12, "nose/nose-scale-depth-incr.target": .16,
    "mouth/mouth-upperlip-volume-incr.target": .04, "mouth/mouth-lowerlip-volume-incr.target": .08,
    "neck/neck-scale-horiz-incr.target": .12, "neck/neck-trans-backward.target": .06,
    "torso/torso-scale-horiz-incr.target": .10,
}, {"eyes/{side}-eye-height2-incr.target": .10, "cheek/{side}-cheek-bones-incr.target": .18,
    "armslegs/{side}-hand-fingers-distance-decr.target": .26})

LUO_MORPHS = bilateral({
    **male_base(.09, .16, .10),
    "head/head-oval.target": .28, "head/head-age-incr.target": .12,
    "chin/chin-width-decr.target": .06, "chin/chin-prominent-incr.target": .18,
    "nose/nose-width2-decr.target": .12, "nose/nose-scale-depth-incr.target": .22,
    "mouth/mouth-upperlip-volume-incr.target": .10, "mouth/mouth-lowerlip-volume-incr.target": .12,
    "mouth/mouth-angles-up.target": .06,
    "neck/neck-trans-backward.target": .10, "stomach/stomach-tone-incr.target": .10,
}, {"eyes/{side}-eye-scale-incr.target": .12, "eyes/{side}-eye-height2-incr.target": .12,
    "cheek/{side}-cheek-bones-incr.target": .10, "armslegs/{side}-hand-fingers-distance-decr.target": .32})

CHEN_MORPHS = bilateral({
    **male_base(0, .36, .13),
    "head/head-invertedtriangular.target": .17, "head/head-oval.target": .12,
    "chin/chin-width-decr.target": .12, "chin/chin-height-incr.target": .08,
    "nose/nose-width2-decr.target": .16, "nose/nose-scale-depth-incr.target": .14,
    "mouth/mouth-upperlip-volume-incr.target": .14, "mouth/mouth-lowerlip-volume-incr.target": .17,
    "neck/neck-trans-backward.target": .08, "stomach/stomach-tone-incr.target": .22,
    "macrodetails/proportions/male-young-averagemuscle-minweight-idealproportions.target": .13,
    "macrodetails/proportions/male-young-averagemuscle-averageweight-idealproportions.target": .18,
}, {"eyes/{side}-eye-scale-incr.target": .20, "eyes/{side}-eye-height2-incr.target": .20,
    "cheek/{side}-cheek-volume-incr.target": .10, "armslegs/{side}-hand-fingers-distance-decr.target": .30})

DESIGNS = {
    "lin": LIN,
    "xu": CharacterDesign(npc_identity("xu"), XU_MORPHS,
                          stance(arms=35, neck=8, thighs=5, wrist=19), 4,
                          {"height": .0044, "peak_curve": 1.4, "tail_drop": .0006}),
    "zhou": CharacterDesign(npc_identity("zhou"), ZHOU_MORPHS,
                            stance(arms=31, neck=6, thighs=3, wrist=13), 6,
                            {"height": .0022, "peak_curve": 1.1, "tail_drop": .0005}),
    "luo": CharacterDesign(npc_identity("luo"), LUO_MORPHS,
                           stance(arms=33, neck=8, thighs=3, wrist=15), 5,
                           {"height": .0030, "peak_curve": 1.3, "tail_drop": .0010}),
    "chen": CharacterDesign(npc_identity("chen"), CHEN_MORPHS,
                            stance(arms=34, neck=6, thighs=4, wrist=17), 5,
                            {"height": .0025, "peak_curve": 1.1, "tail_drop": .0007}),
}
STYLES = {
    "lin": SurfaceStyle("loose-straight", (.031, .036, .046), (.61, .411, .327), .65),
    "xu": SurfaceStyle("loose-fringe", (.108, .057, .032), (.63, .398, .301), .83),
    "zhou": SurfaceStyle("crop", (.084, .079, .069), (.43, .257, .169), .32),
    "luo": SurfaceStyle("parted", (.055, .039, .025), (.54, .341, .247), .38),
    "chen": SurfaceStyle("textured", (.055, .039, .030), (.58, .367, .264), .44),
}


def player_design(gender, age):
    old = {"twenties": 0, "thirties": .06, "forties": .22, "elder": .82}[age]
    if gender == "male":
        morphs = {**male_base(old, .18 * (1 - old), .13 * (1 - old)),
                  "head/head-oval.target": .15, "chin/chin-prominent-incr.target": .10,
                  "nose/nose-scale-depth-incr.target": .13}
    else:
        morphs = {"macrodetails/asian-female-young.target": 1 - old,
                  "macrodetails/asian-female-old.target": old,
                  "macrodetails/universal-female-old-averagemuscle-averageweight.target": old,
                  "macrodetails/universal-female-young-averagemuscle-minweight.target": .30 * (1 - old),
                  "head/head-oval.target": .23, "head/head-round.target": .12,
                  "chin/chin-bones-decr.target": .20, "nose/nose-width2-decr.target": .22,
                  "breast/breast-dist-decr.target": .18,
                  "measure/measure-shoulder-dist-decr.target": .18,
                  "breast/female-young-averagemuscle-averageweight-averagecup-maxfirmness.target": .32 * (1 - old)}
    morphs.update({"head/head-age-incr.target": old * .40,
                   "mouth/mouth-upperlip-volume-incr.target": .12 * (1 - old),
                   "mouth/mouth-lowerlip-volume-incr.target": .18 * (1 - old),
                   "neck/neck-trans-backward.target": .08})
    bilateral(morphs, {"eyes/{side}-eye-height2-incr.target": .18,
                       "eyes/{side}-eye-scale-incr.target": .12 * (1 - old),
                       "armslegs/{side}-hand-fingers-distance-decr.target": .30})
    identity = player_identity(gender, age)
    design = CharacterDesign(identity, morphs,
                             stance(arms=33, neck=7 if age != "elder" else 4, thighs=4, wrist=17), 5,
                             {"height": .0030, "peak_curve": 1.2, "tail_drop": .0010})
    gray = age == "elder"
    style = SurfaceStyle("parted" if gender == "male" else "bob",
                         (.25, .245, .23) if gray else (.075, .047, .030),
                         (.55, .352, .264) if gender == "male" else (.60, .40, .315),
                         .35 if gender == "male" else .60)
    return design, style


for gender in ("male", "female"):
    for age in ("twenties", "thirties", "forties", "elder"):
        design, style = player_design(gender, age)
        DESIGNS[design.identity.key], STYLES[design.identity.key] = design, style
