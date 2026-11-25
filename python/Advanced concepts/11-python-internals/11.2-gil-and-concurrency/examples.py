from concurrent.futures import ThreadPoolExecutor


def square(number):
    return number * number


with ThreadPoolExecutor(max_workers=2) as pool:
    print(list(pool.map(square, [1, 2, 3])))
