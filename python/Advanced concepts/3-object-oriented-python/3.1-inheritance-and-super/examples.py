class Animal:
    def speak(self):
        return "Hello"

class Dog(Animal):
    def speak(self):
        return super().speak() + ", woof!"

print(Dog().speak())
