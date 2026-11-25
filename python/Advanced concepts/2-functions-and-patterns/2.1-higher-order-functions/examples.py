def double(number):
    return number * 2

def apply_twice(action, value):
    return action(action(value))

print(apply_twice(double, 3))
