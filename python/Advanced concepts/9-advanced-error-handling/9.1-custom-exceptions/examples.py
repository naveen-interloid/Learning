class InvalidAgeError(ValueError):
    pass


try:
    age = -1
    if age < 0:
        raise InvalidAgeError("Age cannot be negative")
except InvalidAgeError as error:
    print(error)
