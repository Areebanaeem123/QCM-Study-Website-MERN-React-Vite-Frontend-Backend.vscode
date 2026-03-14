
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_slider_creation():
    # 1. Login
    print("Logging in...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123456"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Create Slider
    print("Creating slider...")
    slider_data = {
        "title": "Test Slider",
        "subtitle": "Test Subtitle",
        "image_url": "https://example.com/image.jpg",
        "button_text": "Click Me",
        "button_link": "/test"
    }
    response = requests.post(f"{BASE_URL}/slider/", json=slider_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

    if response.status_code == 201 or response.status_code == 200:
        print("✅ Slider created successfully!")
    else:
        print("❌ Failed to create slider.")

if __name__ == "__main__":
    test_slider_creation()
