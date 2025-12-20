#!/bin/bash
# Create placeholder icons using ImageMagick or convert command
# If ImageMagick is not available, we'll create simple SVG-based icons

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    # Create 192x192 icon
    convert -size 192x192 xc:#7c3aed -gravity center -pointsize 72 -fill white -annotate +0+0 "Q" icon-192x192.png
    # Create 512x512 icon
    convert -size 512x512 xc:#7c3aed -gravity center -pointsize 200 -fill white -annotate +0+0 "Q" icon-512x512.png
    echo "Icons created with ImageMagick"
else
    echo "ImageMagick not found, creating simple placeholder icons..."
    # Create simple base64 encoded PNG icons (1x1 transparent, will be replaced)
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon-192x192.png
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon-512x512.png
    echo "Placeholder icons created"
fi
