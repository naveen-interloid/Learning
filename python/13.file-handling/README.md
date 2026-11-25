# 13. File handling

[Back to Python topics](../README.md)

A file stores data outside a running program. `open()` returns a file object;
`read()` gets its contents and `write()` stores text. A `with` block closes the
file when the block finishes, including when an exception occurs.

## Example: write and read a small file

This example uses a temporary folder so it cleans up after itself. In a real
project, `path` could point to a file you want to keep.

```python
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as folder:
    path = Path(folder) / "note.txt"
    with open(path, "w", encoding="utf-8") as file:
        file.write("Hello, Python!")
    with open(path, "r", encoding="utf-8") as file:
        print(file.read())
```

Output:

```text
Hello, Python!
```

Run `index.py` in this folder to try this example.

## Flow diagram

```mermaid
flowchart LR
    A[Create temporary folder] --> B[Open note.txt for writing]
    B --> C[Write text and close file]
    C --> D[Open note.txt for reading]
    D --> E[Read text and close file]
    E --> F[Remove temporary folder]
```

## Common modes

| Mode | Meaning |
| --- | --- |
| `"r"` | Read an existing text file; this is the default |
| `"w"` | Write text; creates a file or erases its old contents |
| `"a"` | Append text to the end; creates the file if needed |
| `"rb"` | Read bytes, such as image data |

**Common mistake:** using `"w"` when you want to add to an existing file. Use
`"a"` to append. Specify `encoding="utf-8"` for these text examples; do not pass
an encoding in binary mode.

## Extended lesson

**Learning goals:** Choose file modes, process lines, and distinguish text from bytes.

A file object has a current position. Reading advances that position, so a second read may return an empty string unless you seek back. Iterating over a text file reads line by line, which avoids loading the whole file into one string. Lines can retain their newline characters.

Specify an encoding for text so the intended representation is clear. Binary mode returns bytes and accepts no text encoding. Relative paths are resolved against the process's current working directory, which is not necessarily the folder containing your source file. Use context managers so resources are released on both successful and exceptional paths.

### Read lines without an extra blank line

StringIO lets you practise the text-file interface without creating a disk file.

```python
from io import StringIO
with StringIO("apple\npear\n") as file:
    for line in file:
        print(line.rstrip("\n"))
```

Output:

```text
apple
pear
```

### Rewind a stream

seek(0) moves the position back to the start.

```python
from io import StringIO
with StringIO("abc") as file:
    print(file.read(1))
    print(file.read())
    file.seek(0)
    print(file.read())
```

Output:

```text
a
bc
abc
```

### Parse CSV with the standard library

CSV quoting rules make split(',') unreliable for general CSV files.

```python
import csv
from io import StringIO
rows = csv.DictReader(StringIO("name,score\nMaya,8\n"))
for row in rows:
    print(row["name"], int(row["score"]))
```

Output:

```text
Maya 8
```

## Practice and worked answer

1. Explain when append mode is more appropriate than write mode.
2. Count nonempty lines in an in-memory file.

Try these before reading the answer.

<details>
<summary>Show the explanation and one solution</summary>

Append preserves old contents and adds to the end. Write mode truncates an existing file.

### One solution

This example runs independently.

```python
from io import StringIO
with StringIO("red\n\nblue\n") as file:
    print(sum(1 for line in file if line.strip()))
```

Output:

```text
2
```

</details>
