---
name: optimize-assets
description: Compress and optimize 3D models, textures, and images for web performance
disable-model-invocation: true
---

# Optimize Assets

Compress 3D models, textures, and images for optimal web performance.

## Usage
`/optimize-assets [path]` - Optimize all assets, or specify a path

## Steps

### 1. 3D Models (.glb/.gltf)
```bash
# Install gltf-transform if needed
npx @gltf-transform/cli optimize input.glb output.glb --compress draco --texture-compress webp

# Or for maximum compression:
npx @gltf-transform/cli optimize input.glb output.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024 \
  --simplify --simplify-ratio 0.75
```

### 2. Textures & Images
```bash
# Convert to WebP (smaller than PNG/JPG)
npx sharp-cli --input src/assets/textures/*.png --output src/assets/textures/ --format webp --quality 80

# For hero textures (higher quality)
npx sharp-cli --input src/assets/textures/hero-*.png --output src/assets/textures/ --format webp --quality 90

# Resize oversized textures to max 1024 (2048 for hero only)
npx sharp-cli --input src/assets/textures/*.png --output src/assets/textures/ --resize 1024
```

### 3. Audit Asset Sizes
```bash
# List all assets sorted by size
find src/assets -type f -exec ls -lhS {} + | head -20
```

Report any file over:
- 500KB for 3D models (should be Draco compressed)
- 200KB for textures (should be WebP)
- 100KB for UI images (should be WebP/AVIF)
- 50KB for icons/logos (should be SVG)

### 4. Generate Size Report
Output a markdown table:
| Asset | Original Size | Optimized Size | Reduction |
|-------|--------------|----------------|-----------|

### Rules
- Never optimize in place - always create optimized copies first, verify, then replace
- Maintain original aspect ratios
- Test visual quality after compression - don't over-compress hero assets
- All textures should be power-of-2 dimensions (256, 512, 1024, 2048)
- Prefer SVG for icons and simple graphics
- Use WebP with PNG fallback for broad compatibility
