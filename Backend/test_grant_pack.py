import requests

def test_grant_pack():
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    login_data = {"email": "admin@example.com", "password": "password", "captcha_token": ""}
    # Just mocking a request to the exact endpoint
    auth_response = requests.post(url, json=login_data)
    if auth_response.status_code != 200:
        print(f"Login failed: {auth_response.text}")
        return
        
    token = auth_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    grant_url = "http://127.0.0.1:8000/api/v1/admin/users/579abbdc-81fc-4d07-a261-e3f2c1c90be0/grant-pack/3ee8a59d-dbd9-4a9e-8bde-2a806d629ded"
    response = requests.post(grant_url, headers=headers, json={"pack_id": "3ee8a59d-dbd9-4a9e-8bde-2a806d629ded"})
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")

if __name__ == "__main__":
    test_grant_pack()
