from src.backend.api.app import app

def list_routes():
    for route in app.routes:
        print(f"Path: {route.path}, Name: {route.name}, Methods: {route.methods}")

if __name__ == "__main__":
    list_routes()
