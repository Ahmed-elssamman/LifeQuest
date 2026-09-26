"""Build the README tour from public-page screenshots. Requires Pillow."""

from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont

MEDIA = Path(__file__).resolve().parents[2] / "docs" / "media"
SIZE = (1100, 840)


def font(size):
    try:
        path = subprocess.check_output(
            ["fc-match", "-f", "%{file}", "sans"], text=True
        ).strip()
        return ImageFont.truetype(path, size)
    except (OSError, subprocess.CalledProcessError):
        return ImageFont.load_default(size=size)


def scene(index, title, subtitle, image_name, mobile=False):
    canvas = Image.new("RGB", SIZE, "#191522")
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((28, 24, 69, 65), radius=12, fill="#B8E7D1")
    draw.text((40, 30), str(index + 1).zfill(2), font=font(18), fill="#263C33")
    draw.text((85, 20), title, font=font(25), fill="#F5F0FF")
    draw.text((86, 57), subtitle, font=font(13), fill="#BCAECF")
    screenshot = Image.open(MEDIA / image_name).convert("RGB")
    if mobile:
        draw.rounded_rectangle((28, 104, 1072, 804), radius=20, fill="#292136")
        draw.text((80, 253), "Your next step.", font=font(38), fill="#F5F0FF")
        draw.text((80, 307), "Always with you.", font=font(38), fill="#B8E7E2")
        draw.text((83, 397), "A little better, every day.", font=font(19), fill="#C2B4D6")
        for y, label in [(478, "Goals with meaning"), (524, "Habits at your pace"), (570, "Progress worth keeping")]:
            draw.ellipse((84, y + 8, 91, y + 15), fill="#B8E7D1")
            draw.text((110, y), label, font=font(17), fill="#D9CFE8")
        screenshot.thumbnail((304, 658), Image.Resampling.LANCZOS)
        x, y = 682, 128
        draw.rounded_rectangle((x - 10, y - 10, x + screenshot.width + 10, y + screenshot.height + 10), radius=30, fill="#0C0912", outline="#6C5E80", width=2)
        mask = Image.new("L", screenshot.size)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, screenshot.width, screenshot.height), radius=23, fill=255)
        canvas.paste(screenshot, (x, y), mask)
    else:
        screenshot = screenshot.resize((1044, 696), Image.Resampling.LANCZOS)
        draw.rounded_rectangle((28, 100, 1072, 804), radius=18, fill="#362C47")
        for x, color in [(47, "#B394BE"), (65, "#C9B58C"), (83, "#96BDA8")]:
            draw.ellipse((x, 113, x + 7, 120), fill=color)
        draw.text((417, 106), "lifequest-web-cyan.vercel.app", font=font(11), fill="#C8BED8")
        # A narrow crop preserves legibility and the browser-window proportions.
        canvas.paste(screenshot.crop((0, 0, 1044, 667)), (28, 133))
    for step in range(3):
        left = 486 + step * 46
        draw.rounded_rectangle((left, 818, left + 33, 822), radius=2, fill="#B8E7D1" if step == index else "#493C5B")
    return canvas


scenes = [
    scene(0, "Make room for a life that feels like you.", "THE PUBLIC EXPERIENCE  /  ENGLISH + LIGHT", "landing.png"),
    scene(1, "A different language. The same sense of balance.", "ARABIC + RIGHT-TO-LEFT  /  DARK THEME", "arabic-dark.png"),
    scene(2, "Small steps, wherever the day takes you.", "RESPONSIVE DESIGN  /  MOBILE", "mobile.png", mobile=True),
]

# Use a shared palette for clean, stable colors during the slow crossfades.
palette_source = Image.new("RGB", (550, 420 * 3))
for index, image in enumerate(scenes):
    palette_source.paste(image.resize((550, 420)), (0, index * 420))
palette = palette_source.quantize(colors=240)
frames, durations = [], []
for index, image in enumerate(scenes):
    frames.append(image.quantize(palette=palette, dither=Image.Dither.NONE))
    durations.append(3300)
    following = scenes[(index + 1) % len(scenes)]
    for step in range(1, 9):
        alpha = step / 9
        alpha = alpha * alpha * (3 - alpha * 2)
        blended = Image.blend(image, following, alpha)
        frames.append(blended.quantize(palette=palette, dither=Image.Dither.NONE))
        durations.append(80)

destination = MEDIA / "product-tour.gif"
frames[0].save(destination, save_all=True, append_images=frames[1:], duration=durations, loop=0, optimize=True)
print(f"Created {destination.name}: {destination.stat().st_size / 1024 / 1024:.2f} MiB, {sum(durations) / 1000:.1f}s loop.")
