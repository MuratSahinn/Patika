# Önizleme kopyası üretir: index.html + sahte sunucu (demo.html). Repodaki index.html değişmez.
# Kullanım (repo kökünden): python3 arac/onizleme/build.py <çıktı.html>
# Sonra Claude çıktıyı "Patika · Önizleme" artifact'ine yayınlar.
import sys, os
kok = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
s = open(os.path.join(kok, 'index.html'), encoding='utf-8').read()
demo = open(os.path.join(kok, 'arac/onizleme/demo.html'), encoding='utf-8').read()
i = s.index('<script>\n/* ---- Depolama ----')
open(sys.argv[1], 'w', encoding='utf-8').write(s[:i] + demo + s[i:])
print('önizleme yazıldı:', sys.argv[1])
