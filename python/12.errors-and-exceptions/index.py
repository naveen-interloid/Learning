text = "hello"
try:
    number = int(text)
    print(number)
except ValueError:
    print("Enter a whole number")
