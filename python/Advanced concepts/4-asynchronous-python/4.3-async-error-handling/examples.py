import asyncio

async def load_data():
    await asyncio.sleep(0)
    raise ValueError("No data")

async def main():
    try:
        await load_data()
    except ValueError as error:
        print(f"Handled: {error}")

asyncio.run(main())
