## Brief overview
This rule outlines development workflow preferences, specifically regarding command execution in the project environment.

## Development workflow
- Avoid requesting execution of `npm run dev` command, as the user maintains the development server manually.
- Avoid using `open` command, as it is not recognized in Windows CMD; use `start` instead for opening files or URLs.
