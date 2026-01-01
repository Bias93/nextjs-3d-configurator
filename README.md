# Configuratore 3D Prodotti

Web app per visualizzare modelli 3D (GLB/glTF) e applicare texture personalizzate in tempo reale. Ideale per e-commerce di abbigliamento sportivo, biciclette, e prodotti personalizzabili.

## Stack Tecnologico

- **Next.js 16** - App Router, React 19, Turbopack
- **@google/model-viewer 4.1.0** - Web component per rendering 3D
- **Tailwind CSS 4** - Styling
- **TypeScript 5.7** - Type safety

## Requisiti

- Node.js 20.9+
- npm 10+

## Installazione

```bash
# Clona o estrai il progetto
cd 3d-configurator

# Installa dipendenze
npm install

# Avvia in sviluppo
npm run dev
```

Apri http://localhost:3000

## Uso

### 1. Prepara il modello 3D

Il modello deve essere in formato **GLB** (consigliato) o **glTF**.

**Conversione da FBX a GLB con Blender (gratuito):**

1. Apri Blender → File → Import → FBX
2. Seleziona il file FBX
3. File → Export → glTF 2.0 (.glb/.gltf)
4. Scegli "GLB" come formato
5. Esporta

### 2. Carica e personalizza

1. Trascina il file GLB nell'area "Modello 3D"
2. Trascina un'immagine (JPG/PNG/WebP) nell'area "La tua grafica"
3. La texture viene applicata automaticamente al modello

### 3. Funzionalità

- **Rotazione automatica** - Il modello ruota per mostrare tutti i lati
- **Controlli touch/mouse** - Ruota, zoom, sposta
- **AR Ready** - Su dispositivi compatibili, visualizza in realtà aumentata
- **Screenshot** - Salva un'immagine della configurazione

## Struttura Progetto

```
src/
├── app/
│   ├── globals.css      # Design system Tailwind v4
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Pagina configuratore
├── components/
│   ├── ProductViewer.tsx    # Wrapper model-viewer
│   ├── ModelUploader.tsx    # Upload modelli GLB
│   ├── TextureUploader.tsx  # Upload texture
│   └── ViewerControls.tsx   # Controlli viewer
└── types/
    └── model-viewer.d.ts    # TypeScript definitions
```

## Personalizzazione

### Cambiare i colori

Modifica `src/app/globals.css`:

```css
@theme {
  /* Accent - cambia questi per il brand del cliente */
  --color-accent-400: oklch(0.72 0.12 55);
  --color-accent-500: oklch(0.62 0.14 50);
  --color-accent-600: oklch(0.52 0.12 48);
}
```

### Modello di default

Per caricare un modello predefinito:

```tsx
// In page.tsx
const [modelUrl, setModelUrl] = useState('/models/default.glb');
```

E posiziona il file in `public/models/default.glb`

## Integrazione E-commerce

Per integrare con un sistema di ordini:

```tsx
// Aggiungi un pulsante "Ordina"
<button onClick={() => {
  const screenshot = viewer.toDataURL('image/png');
  // Invia a backend con configurazione
  submitOrder({ 
    productId, 
    textureFile, 
    previewImage: screenshot 
  });
}}>
  Ordina ora
</button>
```

## Build Produzione

```bash
npm run build
npm run start
```

Oppure deploy su Vercel:

```bash
npx vercel
```

## Formati Supportati

### Modelli 3D
- GLB (consigliato)
- glTF

### Texture
- JPEG
- PNG
- WebP

## Browser Supportati

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

AR disponibile su:
- Android (Chrome) via Scene Viewer
- iOS (Safari) via Quick Look

## Troubleshooting

**Il modello non si vede:**
- Verifica che il file sia un GLB valido
- Controlla la console per errori

**La texture non si applica:**
- Il modello deve avere materiali PBR con baseColorTexture
- Verifica che l'immagine sia in un formato supportato

**Performance lenta:**
- Ottimizza il modello (ridurre poligoni)
- Comprimi le texture (max 2048x2048)

## Licenza

MIT
