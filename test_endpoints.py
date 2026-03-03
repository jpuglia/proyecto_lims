import httpx
import asyncio

async def test_endpoint(url):
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url)
            print(f"URL: {url} | Status: {r.status_code}")
            if r.status_code == 200:
                print(f"Data: {r.json()[:2]}") # First 2 items
    except Exception as e:
        print(f"Error calling {url}: {e}")

async def main():
    await test_endpoint("http://127.0.0.1:8000/api/productos/")
    await test_endpoint("http://127.0.0.1:8000/api/auth/operarios")

if __name__ == "__main__":
    asyncio.run(main())
