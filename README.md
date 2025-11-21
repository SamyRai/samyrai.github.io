# SamyRai Resume Site

A modern, responsive resume website built with Hugo and custom SCSS.

## Features

- Data-driven content using YAML files
- Responsive design with custom CSS
- Hugo Pipes for asset processing
- PDF generation capability
- GitHub Pages deployment

## Development

### Prerequisites

- Hugo extended version (0.148+)
- Node.js (for PDF generation)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Structure

- `content/` - Content files (currently data-driven)
- `data/` - YAML data files for resume sections
- `layouts/` - Hugo templates
- `assets/` - SCSS and JS source files
- `static/` - Static assets
- `themes/resume-theme/` - Custom theme

## Deployment

The site is configured for GitHub Pages deployment with the `CNAME` file.

## License

MIT
