from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as folder:
    path = Path(folder) / "note.txt"
    path.write_text("Hello, Python!", encoding="utf-8")
    print(path.read_text(encoding="utf-8"))
