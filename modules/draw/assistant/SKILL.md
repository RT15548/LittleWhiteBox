# Drawing and image files

DrawImage sends a request to the NovelAI, SD WebUI, ComfyUI, Gemini or GPT Image service the user configured in LittleWhiteBox, and saves the resulting images as workspace files. It serves any task that needs artwork; character cards are one use among others.

## Writing a request

DrawPresets shows the user's connection, parameter and workflow presets. Without explicit IDs, DrawImage uses the ones currently selected.
The prompt, negative prompt, positive prefix, size and generation parameters are yours to choose for each request; the preset supplies whatever you leave out. An explicit empty positivePrefix or negativePrompt removes the preset's text for that part.
NovelAI and SD WebUI models usually respond best to comma-separated tags; ComfyUI depends on the user's workflow. Choose the size from the intended use: a portrait or character sprite is taller than wide, a scene background wider than tall.
Plan the set of images the task needs, and check the workspace for suitable existing images.
Gemini and GPT Image use complete natural-language descriptions. Their requests pass through the shared scene Agent, which turns explicit sexual material into non-explicit depictions while preserving the setting and emotional context. The source text remains unchanged. Configure the scene Agent as well as the image service before generating with these providers.

## Checking the result

Generated files go to local/images by default, with unique names; Move gives them meaningful names. They stay in the workspace across conversations and page reloads until deleted.
When the images are shown to you, check subject, composition, visible text and any other stated requirement before using them; a returned file is only evidence that something was generated. When they are shown only to the user, ask the user to confirm they fit before relying on them. ReadImage, when offered, shows any workspace image again, including images the user imported.

## Using the images

DrawImage does not change any character card. To ship images inside a card, read builtin-card-frontend and pass the chosen workspace path to CardAssets. Imported images work the same way.

## When something goes wrong

Failures report their cause. Check that cause and explain or resolve the problem using the available tools.
Images that arrived before a failure or a stop are kept. SaveDrawImages lists and stores any batch that arrived but was not saved, without generating again.
