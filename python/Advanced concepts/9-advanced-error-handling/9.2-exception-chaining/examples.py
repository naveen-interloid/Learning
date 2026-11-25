def read_age(text):
    try:
        return int(text)
    except ValueError as error:
        raise ValueError("Age must be a number") from error


try:
    read_age("hello")
except ValueError as error:
    print(error)
    print(type(error.__cause__).__name__)
