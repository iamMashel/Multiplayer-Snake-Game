#!/usr/bin/env python3
"""
Generate the social/OG preview image (1200x630 PNG) for the Snake game.

Run once and commit the output:
    python3 scripts/generate_og_image.py

Output: frontend/public/og-image.png
Requires: Pillow + DejaVu fonts (present on most Linux installs).
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
BG = (10, 14, 23)
GREEN = (52, 211, 120)
GREEN_GLOW = (34, 230, 120)
CYAN = (56, 220, 240)
PURPLE = (190, 130, 255)
WHITE = (235, 245, 245)
RED = (240, 70, 70)

FONT_DIR = "/usr/share/fonts/truetype/dejavu"
BOLD = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")
REG = os.path.join(FONT_DIR, "DejaVuSans.ttf")
MONO = os.path.join(FONT_DIR, "DejaVuSansMono-Bold.ttf")

OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "og-image.png")


def font(path, size):
    return ImageFont.truetype(path, size)


def glow_text(base, xy, text, fnt, color, glow_color, blur=14, anchor="mm"):
    """Draw text with a neon glow underneath it."""
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).text(xy, text, font=fnt, fill=glow_color + (255,), anchor=anchor)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).text(xy, text, font=fnt, fill=color + (255,), anchor=anchor)


def main():
    img = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(img)

    # Radial-ish glow in the centre (approximate with a big blurred ellipse)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W // 2 - 420, H // 2 - 320, W // 2 + 420, H // 2 + 240],
                                 fill=(34, 197, 94, 38))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))

    # Faint grid
    for x in range(0, W + 1, 40):
        d.line([(x, 0), (x, H)], fill=(120, 180, 255, 12), width=1)
    for y in range(0, H + 1, 40):
        d.line([(0, y), (W, y)], fill=(120, 180, 255, 12), width=1)

    # Neon border (glow + crisp)
    border = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle([24, 24, W - 24, H - 24], radius=28,
                                             outline=GREEN_GLOW + (255,), width=6)
    img.alpha_composite(border.filter(ImageFilter.GaussianBlur(10)))
    d.rounded_rectangle([24, 24, W - 24, H - 24], radius=28, outline=GREEN + (255,), width=5)

    # Wordmark
    glow_text(img, (W // 2, 210), "SNAKE", font(BOLD, 170), GREEN, GREEN_GLOW, blur=22)

    # Subtitle (letter-spaced)
    d.text((W // 2, 320), "N E O N   A R C A D E",
           font=font(BOLD, 44), fill=CYAN + (255,), anchor="mm")

    # Tagline
    d.text((W // 2, 392), "Daily Challenge  •  Global Leaderboard  •  Score Cards",
           font=font(REG, 32), fill=WHITE + (230,), anchor="mm")

    # Mini snake + food
    seg = 40
    gap = 10
    n = 6
    total = n * seg + (n - 1) * gap + 60  # snake + food
    start_x = (W - total) // 2
    cy = 480
    for i in range(n):
        x0 = start_x + i * (seg + gap)
        shade = (40 + i * 2, 200 - i * 6, 110)
        d.rounded_rectangle([x0, cy, x0 + seg, cy + seg], radius=10, fill=shade + (255,))
    # food
    fx = start_x + n * (seg + gap) + 20
    d.ellipse([fx, cy + 6, fx + seg - 12, cy + seg - 6], fill=RED + (255,))

    # Footer
    d.text((W // 2, 570), "Can you beat the high score?",
           font=font(MONO, 28), fill=PURPLE + (255,), anchor="mm")

    img.convert("RGB").save(os.path.abspath(OUT), "PNG")
    print("wrote", os.path.abspath(OUT))


if __name__ == "__main__":
    main()
