# 3D Product Configurator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)](https://www.typescriptlang.org/)
[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://nextjs-3d-configurator.vercel.app)

A modern, interactive 3D product configurator built with Next.js and Google's model-viewer. Allows users to upload 3D models, apply custom textures, and modify material colors in real-time.

**[🚀 Live Demo](https://nextjs-3d-configurator.vercel.app)**

## Features

- **3D Model Viewing** — Load and display GLB/glTF models with smooth camera controls
- **Texture Customization** — Apply custom images as textures to model materials
- **Color Picker** — Real-time material color modification with preset palette
- **AR Support** — WebXR and Quick Look AR integration for mobile devices
- **Screenshot Export** — Capture and download current configuration
- **Responsive Design** — Optimized for desktop and mobile viewports

## Tech Stack

| Technology | Version |
|------------|---------|
| Next.js | 16 |
| React | 19 |
| TypeScript | 5.7 |
| Tailwind CSS | 4 |
| model-viewer | 4.1 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Bias93/nextjs-3d-configurator.git
cd nextjs-3d-configurator
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Upload a Model** — Drag and drop or click to upload a GLB/glTF file
2. **Apply Textures** — Upload an image (JPG, PNG, WebP) to apply as a texture
3. **Customize Colors** — Select materials and apply colors from the palette
4. **Take Screenshot** — Use the camera button to export your configuration

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main configurator page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ProductViewer.tsx  # 3D viewer component
│   ├── ModelUploader.tsx  # Model file upload
│   ├── TextureUploader.tsx # Texture image upload
│   ├── ColorPicker.tsx    # Material color picker
│   └── ViewerControls.tsx # Viewer action buttons
└── types/
    └── model-viewer.d.ts  # TypeScript definitions
```

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 79+ |
| Firefox | 70+ |
| Safari | 14+ |
| Edge | 79+ |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Bias93** — [GitHub](https://github.com/Bias93)

---
