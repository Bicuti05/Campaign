from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT = Path(__file__).resolve().parent / "20261013"
font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
names = [("poc-divider-135", "Thanh ngang chia hai hàng"),
         ("poc-corner-225", "Thanh L giữ biên trên–trái"),
         ("poc-frame-45", "Thanh U bao hai tầng vòng")]
sheet = Image.new("RGB", (1620, 805), "#f5f0e6")
draw = ImageDraw.Draw(sheet)
for i, (stem, title) in enumerate(names):
    draw.text((i * 540 + 20, 14), title, fill="#283b36", font=font)
    sheet.paste(Image.open(OUT / (stem + ".png")), (i * 540, 50))
draw.text((20, 778), "Cùng scale • Khung 18 × 24 • Physics2D/feel Editor đã kiểm • Chưa nghiệm thu thẩm mỹ", fill="#283b36", font=small)
sheet.save(OUT / "poc-overview.png")
