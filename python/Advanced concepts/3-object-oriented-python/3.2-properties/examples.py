class Square:
    def __init__(self, side):
        self.side = side

    @property
    def area(self):
        return self.side ** 2

square = Square(3)
print(square.area)
