
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoint(endpoint):
    print(f"Testing {endpoint}...")
    try:
        # We need a token for these
        # Let's try to get one if possible, but for now just see if it's 401 or 404/500
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint("/dashboard/stats")
    test_endpoint("/packs/")
    test_endpoint("/visualize_packs/")
