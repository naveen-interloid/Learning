from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as folder:
    path = Path(folder) / "note.txt"
    with open(path, "w", encoding="utf-8") as file:
        file.write("Hello, Python!")
    with open(path, "r", encoding="utf-8") as file:
        print(file.read())
