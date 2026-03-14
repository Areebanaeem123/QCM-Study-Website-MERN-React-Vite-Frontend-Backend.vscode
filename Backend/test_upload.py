
import requests
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_image_upload():
    # 1. Login
    print("Logging in...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123456"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code}")
        return

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Create a dummy image file
    with open("test_image.png", "wb") as f:
        f.write(os.urandom(1024)) # 1KB of random data

    # 3. Upload Image
    print("Uploading image...")
    with open("test_image.png", "rb") as f:
        files = {"file": ("test_image.png", f, "image/png")}
        response = requests.post(f"{BASE_URL}/upload/image", files=files, headers=headers)
    
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")

    if response.status_code == 201:
        print("Image uploaded successfully!")
        url = response.json()["url"]
        print(f"URL: {url}")
    else:
        print("Failed to upload image.")

    # Cleanup
    if os.path.exists("test_image.png"):
        os.remove("test_image.png")

if __name__ == "__main__":
    test_image_upload()
