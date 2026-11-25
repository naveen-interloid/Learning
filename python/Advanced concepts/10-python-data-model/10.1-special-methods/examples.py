class Basket:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)


basket = Basket(["apple", "pear"])
print(len(basket))
