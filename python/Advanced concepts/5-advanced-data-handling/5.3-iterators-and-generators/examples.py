def small_numbers():
    yield 1
    yield 2

numbers = small_numbers()
print(next(numbers))
print(next(numbers))
print(list(numbers))
