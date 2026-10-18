"""Render the simple Brake It Easy mark used by the iOS app icon."""

from pathlib import Path
from PIL import Image, ImageDraw


SIZE = 1024
SCALE = 2
TEAL = "#007F94"
WHITE = "#FFFFFF"
PALE = "#E3F3FC"


def point(x: int, y: int) -> tuple[int, int]:
    return x * SCALE, y * SCALE


image = Image.new("RGB", (SIZE * SCALE, SIZE * SCALE), PALE)
draw = ImageDraw.Draw(image)
draw.rounded_rectangle(tuple(value * SCALE for value in (150, 150, 874, 874)), radius=178 * SCALE, fill=TEAL)

# A road and car silhouette identify the app without the earlier circular dial.
stroke = 30 * SCALE
draw.line([point(378, 594), point(413, 487), point(611, 487), point(646, 594)], fill=WHITE, width=stroke, joint="curve")
draw.line([point(368, 596), point(656, 596)], fill=WHITE, width=stroke)
draw.line([point(388, 596), point(388, 653)], fill=WHITE, width=stroke)
draw.line([point(636, 596), point(636, 653)], fill=WHITE, width=stroke)
draw.ellipse(tuple(value * SCALE for value in (405, 615, 441, 651)), fill=WHITE)
draw.ellipse(tuple(value * SCALE for value in (583, 615, 619, 651)), fill=WHITE)
draw.rounded_rectangle(tuple(value * SCALE for value in (498, 317, 526, 410)), radius=14 * SCALE, fill=WHITE)
draw.rounded_rectangle(tuple(value * SCALE for value in (498, 721, 526, 793)), radius=14 * SCALE, fill=WHITE)

output = Path(__file__).resolve().parents[1] / "assets" / "icon.png"
image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(output)
print(output)
