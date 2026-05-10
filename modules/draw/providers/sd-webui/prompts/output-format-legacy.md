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
        center: "A1~E5 5x5 grid position"

Rules:
- Every image must include index, anchor, scene, and characters.
- For pure scenery or object-focused images, use characters: [].
- If a selected image contains a known character from the provided character list, output that character in characters using the exact registered name.
- Known characters should keep stable name and danbooru, and still include costume/action/interact/uc/center for the current moment.
- Unknown characters must include type and appear.
- Do not output generic quality tags such as masterpiece, best quality, highres.
- Do not output scene-level negative prompts. Negative prompting is controlled by user presets and character uc fields.
- Do not invent model, sampler, LoRA, VAE, ControlNet, script, scheduler, seed, or extension settings.
- Prefer concise, stable YAML for weaker models.
- Use spaces in tags, not underscores, unless a canonical character tag requires underscores.
- Output single valid YAML.
