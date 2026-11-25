import asyncio

async def greet(name):
    await asyncio.sleep(0)
    return f"Hi, {name}"

async def main():
    first = asyncio.create_task(greet("Mia"))
    second = asyncio.create_task(greet("Leo"))
    print(await asyncio.gather(first, second))

asyncio.run(main())
