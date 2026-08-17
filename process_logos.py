import base64
import os
import shutil
from PIL import Image
import numpy as np

# Load source image
im = Image.open('sd white png.png')
arr = np.array(im)

# Tight crop around non-transparent pixels
alpha = arr[:, :, 3]
non_zero = np.where(alpha > 5)
y1, y2 = non_zero[0].min(), non_zero[0].max()
x1, x2 = non_zero[1].min(), non_zero[1].max()

pad = 10
crop_x1 = max(0, x1 - pad)
crop_y1 = max(0, y1 - pad)
crop_x2 = min(im.width, x2 + pad)
crop_y2 = min(im.height, y2 + pad)

cropped_arr = arr[crop_y1:crop_y2, crop_x1:crop_x2]
h, w, _ = cropped_arr.shape

# 1. Burgundy version (#3B1319 -> 59, 19, 25)
burgundy_arr = np.zeros((h, w, 4), dtype=np.uint8)
burgundy_arr[:, :, 0] = 59
burgundy_arr[:, :, 1] = 19
burgundy_arr[:, :, 2] = 25
burgundy_arr[:, :, 3] = cropped_arr[:, :, 3]

burgundy_im = Image.fromarray(burgundy_arr)
burgundy_im.save('images/sandid-logo-burgundy.png', format='PNG')

# 2. White version (#FFFFFF -> 255, 255, 255)
white_arr = np.zeros((h, w, 4), dtype=np.uint8)
white_arr[:, :, 0] = 255
white_arr[:, :, 1] = 255
white_arr[:, :, 2] = 255
white_arr[:, :, 3] = cropped_arr[:, :, 3]

white_im = Image.fromarray(white_arr)
white_im.save('images/sandid-logo-white.png', format='PNG')

# SVG wrappers with embedded PNG
with open('images/sandid-logo-burgundy.png', 'rb') as f:
    b64_b = base64.b64encode(f.read()).decode('ascii')

with open('images/sandid-logo-white.png', 'rb') as f:
    b64_w = base64.b64encode(f.read()).decode('ascii')

svg_b = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n  <image width="{w}" height="{h}" href="data:image/png;base64,{b64_b}"/>\n</svg>'
svg_w = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n  <image width="{w}" height="{h}" href="data:image/png;base64,{b64_w}"/>\n</svg>'

with open('images/sandid-logo-burgundy.svg', 'w', encoding='utf-8') as f:
    f.write(svg_b)

with open('images/sandid-logo-white.svg', 'w', encoding='utf-8') as f:
    f.write(svg_w)

# Copy to subfolder if exists
if os.path.exists('sandid contracting/images'):
    shutil.copy('images/sandid-logo-burgundy.png', 'sandid contracting/images/sandid-logo-burgundy.png')
    shutil.copy('images/sandid-logo-white.png', 'sandid contracting/images/sandid-logo-white.png')
    shutil.copy('images/sandid-logo-burgundy.svg', 'sandid contracting/images/sandid-logo-burgundy.svg')
    shutil.copy('images/sandid-logo-white.svg', 'sandid contracting/images/sandid-logo-white.svg')

print(f'Successfully generated logo assets with dimensions {w}x{h}')
