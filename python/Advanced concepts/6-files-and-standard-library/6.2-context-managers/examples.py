from io import StringIO

with StringIO("Hello!") as stream:
    print(stream.read())

print(stream.closed)
