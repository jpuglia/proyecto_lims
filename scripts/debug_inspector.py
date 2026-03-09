import httpx
from datetime import datetime, timedelta
import asyncio

BASE_URL = "http://localhost:8000/api"

async def debug():
    async with httpx.AsyncClient() as client:
        # 1. Login
        print("Logging in...")
        resp = await client.post(f"{BASE_URL}/auth/login", data={"username": "inspector", "password": "inspector123"})
        if resp.status_code != 200:
            print(f"Login FAILED: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login SUCCESS.")

        # 2. List samplings
        print("\nListing samplings...")
        resp = await client.get(f"{BASE_URL}/inspection/samplings/", headers=headers)
        print(f"LIST Status: {resp.status_code}")
        print(f"LIST Body: {resp.text}")

        # 3. Create one
        print("\nCreating sampling...")
        payload = {
            "inspector_id": 3,
            "start_datetime": datetime.now().isoformat(),
            "end_datetime": (datetime.now() + timedelta(hours=1)).isoformat(),
            "sampling_point_id": 1,
            "destination": "DEBUG"
        }
        resp = await client.post(f"{BASE_URL}/inspection/samplings/", json=payload, headers=headers)
        print(f"CREATE Status: {resp.status_code}")
        print(f"CREATE Body: {resp.text}")

if __name__ == "__main__":
    asyncio.run(debug())
