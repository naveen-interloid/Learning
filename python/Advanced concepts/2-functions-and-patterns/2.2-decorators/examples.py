from functools import wraps

def announce(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        print("Starting")
        return function(*args, **kwargs)
    return wrapper

@announce
def greet(name):
    return f"Hello, {name}"

print(greet("Mia"))
