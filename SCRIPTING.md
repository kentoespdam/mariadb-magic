# SCRIPTING RULES

## General
- Read `CONTEXT.md` to understand the application;
- Understand the commands before executing them;
- Keep the script as simple as possible;
- Keep the script under 120 lines;
- Use `context7` before start writing the script.
- update `CONTEXT.md` if you find any new term or concept that is not yet documented.
- if working with FE use `bun run build` to build the FE, `bun run lint` to check lint, and `bun run format` to format the code.
- if need new components ShadCN UI is the default component library, just install with `bunx --bun shadcn@latest add <component-name>` and import the components from `@shadcn/ui`.
- if creating tests when writing `go`, write tests into `tests` folder with the same name as the file being tested, and use `go test` to run the tests.