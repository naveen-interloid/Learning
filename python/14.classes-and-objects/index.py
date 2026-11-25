class Person:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Hi, {self.name}"

person = Person("Maya")
print(person.greet())
