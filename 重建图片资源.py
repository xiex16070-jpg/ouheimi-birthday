"""重建网站资源：压缩图片、重命名音频、子集化字体。
改过图片/音乐后，双击运行本脚本即可重新生成 assets 里的文件。
需要 pillow 与 fonttools+brotli。"""
import os, glob, shutil, subprocess, sys
from PIL import Image

SRC = r"C:/Users/admin/Desktop/生日祝福网站"
SITE = os.path.join(SRC, "site")
IMG = os.path.join(SITE, "assets", "img")
AUD = os.path.join(SITE, "assets", "audio")
FNT = os.path.join(SITE, "assets", "fonts")
for d in (IMG, AUD, FNT):
    os.makedirs(d, exist_ok=True)


def save(im, path, max_side, q=84):
    im = im.convert("RGB")
    w, h = im.size
    s = min(1.0, max_side / max(w, h))
    if s < 1.0:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"  {os.path.basename(path)}  {im.size}  {os.path.getsize(path)//1024}KB")


print("[1] 长截图 1.jpg / 2.jpg")
save(Image.open(os.path.join(SRC, "1.jpg")), os.path.join(IMG, "p1.jpg"), 1500, 86)
save(Image.open(os.path.join(SRC, "2.jpg")), os.path.join(IMG, "p2.jpg"), 1500, 86)

print("[2] 微信图片 12 张 -> g01..g12")
files = sorted(glob.glob(os.path.join(SRC, "微信图片_*")))
assert len(files) == 12, files
for i, f in enumerate(files, 1):
    save(Image.open(f), os.path.join(IMG, f"g{i:02d}.jpg"), 1400, 84)
    # 缩略图
    save(Image.open(f), os.path.join(IMG, f"t{i:02d}.jpg"), 320, 72)

print("[3] 音频")
bgm1 = [f for f in os.listdir(SRC) if f.endswith(".mp3") and "纯音乐" in f][0]
bgm2 = [f for f in os.listdir(SRC) if f.endswith(".mp3") and "Blessing" in f][0]
shutil.copyfile(os.path.join(SRC, bgm1), os.path.join(AUD, "bgm1.mp3"))
shutil.copyfile(os.path.join(SRC, bgm2), os.path.join(AUD, "bgm2.mp3"))
print("  bgm1 =", bgm1)
print("  bgm2 =", bgm2)

print("[4] 字体子集")
src_font = r"C:/Users/admin/AppData/Local/hermes/cache/scratch/lxgw.zip"
if os.path.exists(src_font):
    # 站点里出现的字符
    chars = set()
    for p in glob.glob(os.path.join(SITE, "*.html")) + glob.glob(os.path.join(SITE, "js", "*.js")) + glob.glob(os.path.join(SITE, "css", "*.css")):
        chars |= set(open(p, encoding="utf-8").read())
    # GB2312 一级汉字（3755 常用字）：保证 TA 手打的愿望也用同一个字体
    for b1 in range(0xB0, 0xD8):
        for b2 in range(0xA1, 0xFF):
            try:
                chars.add(bytes([b1, b2]).decode("gb2312"))
            except Exception:
                pass
    for c in range(0x20, 0x7F):
        chars.add(chr(c))
    # 日文假名 + 中日标点（叁·回响 里有一行日文小字）
    for rng in ((0x3040, 0x30FF), (0x3000, 0x303F), (0xFF01, 0xFF60)):
        for c in range(rng[0], rng[1] + 1):
            chars.add(chr(c))
    for c in "　、。〈〉《》「」『』【】〔〕！（），：；？…—～·×÷°′″€¥£§©®™←↑→↓↔■□●○◆◇★☆♡♥✔✉☀☁❀✦":
        chars.add(c)
    keep = "".join(sorted(chars))
    with open(os.path.join(FNT, "_charset.txt"), "w", encoding="utf-8") as fh:
        fh.write(keep)
    print("  待子集字符数:", len(chars))
    subprocess.run([sys.executable, "-m", "fontTools.subset", src_font,
                    "--text-file=" + os.path.join(FNT, "_charset.txt"),
                    "--output-file=" + os.path.join(FNT, "wenkai-subset.woff2"),
                    "--flavor=woff2", "--layout-features=*", "--no-hinting",
                    "--desubroutinize"], check=True)
    print("  字体:", os.path.getsize(os.path.join(FNT, "wenkai-subset.woff2")) // 1024, "KB")
else:
    print("  跳过：字体源文件不存在（字形子集需要 LXGW 文楷 ttf，可从 github.com/lxgw/LxgwWenKai 下载）")
print("DONE")
