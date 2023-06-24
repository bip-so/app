# Local development

Run `yarn dev` from root. A local server will run.

## Guidelines

### Folder structure

- All pages/routes in `pages`

- All common components under `src/components`

### Imports order (top to bottom)

- Packages > Local
- Hooks > Components > Utils > Assets
- Alphabetical

### Naming

- Normal Folder &#8594; `lowerCamelCase`
- Component &#8594; `CamelCase`
- Hooks &#8594; `lowerCamelCase`
- Components &#8594; `CamelCase`
- Utils &#8594; `kebab-case`

### More Rules

- Always define `Text, Language` in `public/locales`
- Always define `Enums, Constants, Interfaces` and use. no hardcoding
- Always check `Warnings & Unused Code` before PR
- Move common functionality to `Utils`
