# Material Symbols Rounded

This directory vendors the Material Symbols Rounded variable font and its
codepoints file from the Google Material Design Icons repository.

- Source: `google/material-design-icons`, `variablefont/`
- Font file: `MaterialSymbolsRounded[FILL,GRAD,opsz,wght].woff2`
- Codepoints file: `MaterialSymbolsRounded[FILL,GRAD,opsz,wght].codepoints`
- Local runtime font name: `Material Symbols Rounded`
- License: Apache-2.0, see `LICENSE`

The Tavern app loads `material-symbols-rounded.woff2` at runtime through the
host-provided extension base path. The codepoints file is used only by
`scripts/build-material-symbols-names.mjs` to generate the shared name list.
