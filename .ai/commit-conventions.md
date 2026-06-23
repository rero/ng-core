<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Commit Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

## Rules

- **Subject line**: must not exceed **50 characters** (including type and scope).
- **Body lines**: each line must not exceed **72 characters**.
- **Subject**: use the imperative mood, lowercase, no trailing period.
- **Body**: explain *what* and *why*, not *how*. Separate from subject with a blank line.
- **Body lists**: use `*` (asterisk) for bullet points, never `-` (dash).
- **Footer**: used for breaking changes (`BREAKING CHANGE:`) and issue references.

## Types

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or correcting tests                       |
| `docs`     | Documentation only changes                       |
| `style`    | Formatting, missing semicolons, etc.             |
| `chore`    | Build process, dependency updates, tooling       |
| `perf`     | Performance improvement                          |
| `ci`       | CI/CD configuration changes                      |

## Examples

```text
feat(search): add full-text filter by date range

fix(editor): prevent double-save on rapid submit

refactor(translate): extensible loading per app
```
