"""Build small, renamed font subsets from the official files in assets/fonts/source/.

Jua and Pretendard are SIL OFL 1.1 with a Reserved Font Name, so a subset we cut is a
"Modified Version" and must not carry the reserved name -> output families are renamed
"GG Display" (from Jua) and "GG Text" (from Pretendard). Run after changing on-screen text:
    python scripts/subset-fonts.py
Fails (exit 1) if any character used by the app is missing from the source fonts.
"""
import glob, pathlib, sys
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'assets/fonts/source', ROOT / 'assets/fonts'
texts = [p.read_text(encoding='utf-8') for p in [*ROOT.glob('src/*.js'), *ROOT.glob('src/*.css'), ROOT / 'index.html']]
chars = {c for t in texts for c in t if ord(c) > 0x7F} | {chr(c) for c in range(0x20, 0x7F)} | set('·…“”‘’–—→←↑↓•※○●')
hangul = {c for c in chars if 0xAC00 <= ord(c) <= 0xD7A3}
# ponytail: text is collected from source files, so runtime-built strings outside src/ are not covered; add them here if one ever appears.

def cut(src, dst, family, style, keep):
    font = TTFont(src)
    cmap = font.getBestCmap()
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']
    sub = subset.Subsetter(opts); sub.populate(unicodes=[ord(c) for c in keep if ord(c) in cmap]); sub.subset(font)
    for rec in font['name'].names:  # drop the Reserved Font Name everywhere it appears
        if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22):
            full = f'{family} {style}'
            rec.string = {1: family, 3: f'{family.replace(" ", "")}-{style};subset', 4: full, 6: full.replace(' ', ''),
                          16: family, 17: style, 21: family, 22: style}[rec.nameID]
    opts.flavor = 'woff2'; font.flavor = 'woff2'; font.save(dst)
    return {c for c in keep if ord(c) not in cmap}

missing = set()
missing |= hangul & cut(SRC/'jua-korean-400.woff2', OUT/'gg-display-ko.woff2', 'GG Display', 'Regular', hangul | {c for c in chars if 0x3000 <= ord(c) <= 0x303F or 0xFF00 <= ord(c) <= 0xFFEF})
cut(SRC/'jua-latin-400.woff2', OUT/'gg-display-latin.woff2', 'GG Display', 'Regular', {c for c in chars if ord(c) < 0x2200})
for w in ('Regular', 'Bold'):
    missing |= {c for c in cut(SRC/f'Pretendard-{w}.subset.woff2', OUT/f'gg-text-{w.lower()}.woff2', 'GG Text', w, chars) if c in hangul}
for f in sorted(OUT.glob('gg-*.woff2')): print(f.name, f.stat().st_size)
if missing:
    print('MISSING Hangul glyphs:', ' '.join(f'U+{ord(c):04X}' for c in sorted(missing))); sys.exit(1)
