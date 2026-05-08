Generate a single valid YAML object with one root-level key: images.
Output only YAML. No Markdown fence. No explanations.

images:
  - index: 1
    anchor: "exact 5-15 character substring copied from the source text, preferably ending at punctuation"
    scene: "comma-separated SD positive prompt: rating if relevant, subject count, composition, camera, background, lighting, mood"
    characters:
      - name: "known character name, or a short temporary name"
        danbooru: "canonical booru tag if confidently known, otherwise empty"
        type: "girl | boy | woman | man | other; only required for unknown characters"
        appear: "only for unknown characters: concise visible appearance tags"
        costume: "current visible outfit, accessories, and clothing state tags"
        action: "pose, expression, gesture, gaze, and single-instant action tags"
        interact: "interaction tags with other characters or objects; use source#/target#/mutual# when direction matters"
        uc: "character-specific exclusions for hidden traits, removed clothes/accessories, or mutually exclusive states"
        center: "center | left | right | top | bottom | top-left | top-right | bottom-left | bottom-right"

## Required Behavior

- Every image must include index, anchor, scene, and characters.
- For pure scenery or object-focused images, use characters: [].
- Known characters should keep stable name and danbooru, and still include costume/action/interact/uc/center for the current moment.
- Unknown characters must include type and appear.
- Do not output generic quality tags such as masterpiece, best quality, highres.
- Do not output scene-level negative prompts. Negative prompting is controlled by user presets and character uc fields.
- Do not invent model, sampler, LoRA, VAE, ControlNet, script, scheduler, seed, or extension settings.
- Prefer 50-80 tags per image after assembly, with the most important tags first.
- Use spaces in tags, not underscores, unless a canonical character tag requires underscores.
- Output single valid YAML.

## Scene Composition

- Subject count: `solo`, `duo`, `trio`, `group`, `1girl`, `1boy`, `2girls`, `1girl 1boy`.
- Camera: `from front`, `from side`, `from behind`, `from above`, `from below`, `pov`.
- Framing: `portrait`, `upper body`, `cowboy shot`, `full body`, `close-up`, `wide shot`.
- Background: include a concrete place and visible objects, such as `bedroom, bed, window`, not only `indoors`.
- Lighting: `sunlight`, `moonlight`, `warm lighting`, `dim lighting`, `backlighting`, `rim light`.

## Character Prompt Rules

- costume must describe the current visible clothing state for this image.
- action should choose one clear instant rather than stacking continuous actions.
- interact is only for meaningful interaction.
- uc is for character-specific exclusions, hidden traits, or mutually exclusive expressions/clothing.
- Do not output type/appear for known characters.

## Example

images:
  - index: 1
    anchor: "靠在窗边发呆。"
    scene: "1girl, solo, from side, upper body, indoors, classroom, window, desk, afternoon, sunlight, soft lighting, quiet atmosphere"
    characters:
      - name: "小樱"
        danbooru: "kinomoto_sakura_(cardcaptor_sakura)"
        costume: "school uniform, white shirt, red bow, pleated skirt"
        action: "sitting, leaning on hand, looking out window, melancholy, half-closed eyes"
        interact: ""
        uc: "happy, running"
        center: "center"
