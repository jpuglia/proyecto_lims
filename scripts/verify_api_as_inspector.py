import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def test_sampling_api():
    # 1. Login
    login_data = {"username": "inspector", "password": "inspector123"}
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Obtener ID del inspector
    me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    inspector_id = me_resp.json()["usuario_id"]

    # 2. Test Ad-hoc sampling (Sampling Point)
    start = datetime.now()
    end = start + timedelta(hours=1)
    
    sampling_data = {
        "inspector_id": inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "sampling_point_id": 1, # Asumiendo que existe
        "destination": "Microbiología"
    }
    
    print("\nTesting Ad-hoc Sampling (Point)...")
    resp = requests.post(f"{BASE_URL}/inspection/samplings/", json=sampling_data, headers=headers)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 201:
        print(f"Success: {resp.json()['id']}")
    else:
        print(f"Error: {resp.text}")

    # 3. Test Product Sampling (Product + Quantity)
    sampling_product = {
        "inspector_id": inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "product_id": 1,
        "lot_id": 1,
        "extracted_quantity": 500.0,
        "destination": "Fisicoquímico"
    }
    print("\nTesting Product Sampling...")
    resp = requests.post(f"{BASE_URL}/inspection/samplings/", json=sampling_product, headers=headers)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 201:
        print(f"Success: {resp.json()['id']}")
    else:
        print(f"Error: {resp.text}")

    # 4. Test Validation Error (Product without Quantity)
    sampling_invalid = {
        "inspector_id": inspector_id,
        "start_datetime": start.isoformat(),
        "end_datetime": end.isoformat(),
        "product_id": 1,
        "destination": "Error"
    }
    print("\nTesting Validation (Product without Quantity)...")
    resp = requests.post(f"{BASE_URL}/inspection/samplings/", json=sampling_invalid, headers=headers)
    print(f"Status: {resp.status_code} (Expected 400)")
    print(f"Response: {resp.text}")

if __name__ == "__main__":
    # Asegúrate de que uvicorn esté corriendo en background si vas a probar contra el server real.
    # O usa TestClient de FastAPI en un script de pytest.
    # Para esta tarea, asumo que el server está levantado o usaré pytest.
    pass
