from dataclasses import dataclass

@dataclass
class Book:
    title: str
    pages: int

book = Book("Python Basics", 80)
print(book)
