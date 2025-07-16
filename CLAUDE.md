# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal portfolio website (amirhjalali.com) exported from Google Sites. The repository contains static HTML files with embedded Google Sites functionality and associated image assets.

## Project Structure

```
amirhjalali.com/
├── HOME.html           # Main landing page
├── PROJECTS.html       # Projects portfolio page
├── AI TOOLS.html       # AI tools showcase page
├── RESOURCES.html      # Resources page
├── RESUME.html         # Resume/CV page
├── THOUGHTS.html       # Blog/thoughts page
├── HOME/               # Images for home page
├── PROJECTS/           # Images for projects page
├── AI TOOLS/           # Images for AI tools page
├── THOUGHTS/           # Images for thoughts page
└── package.json        # Auto-commit configuration
```

## Development Commands

### Auto-commit Watcher
```bash
npm run auto-commit
```
This watches for changes in HTML, CSS, JS, MD, and TXT files and automatically commits them to git with a timestamped message. Uses a 2-second delay before committing.

### Installing Dependencies
```bash
npm install
```
This will install nodemon (the only dependency) for the auto-commit functionality.

## Key Technical Details

1. **Static HTML Export**: All HTML files are exported from Google Sites and contain:
   - Embedded Google Sites JavaScript and styling
   - Large file sizes (1.4-2MB each) due to inline content
   - Google-specific metadata and configuration

2. **No Build Process**: This is a static website with no build pipeline, bundling, or compilation steps.

3. **No Testing Framework**: No tests are configured for this project.

4. **Auto-commit Setup**: The repository uses nodemon to automatically commit changes, useful for continuous deployment or backup purposes.

## Working with the Codebase

- When modifying HTML files, be aware they contain Google Sites-specific code that may break if significantly altered
- Image assets are organized in directories matching their corresponding HTML pages
- The auto-commit watcher will track changes to HTML, CSS, JS, MD, and TXT files
- There is no local development server; files can be opened directly in a browser

## Git Workflow

The repository uses an auto-commit system. When making changes:
1. The auto-commit watcher will automatically stage and commit changes
2. Manual commits can still be made when the watcher is not running
3. The main branch is used for all development

## Important Rules

### Always Commit Changes
**ALWAYS commit any changes made to the repository with a descriptive message.** When completing any task:
1. Stage all modified files using `git add .`
2. Commit with a concise but descriptive message summarizing the changes
3. Example: `git commit -m "Update projects page with new portfolio item"`
4. Do not leave changes uncommitted