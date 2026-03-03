import httpx
import asyncio

async def test_login():
    url = "http://127.0.0.1:8000/api/auth/login"
    # FastAPI OAuth2PasswordRequestForm expects form-data
    payload = {"username": "admin", "password": "admin123"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, data=payload) # data= for form-urlencoded
            print(f"Status: {r.status_code}")
            print(f"Body: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
