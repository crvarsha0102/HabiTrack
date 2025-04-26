#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Generate unique email addresses using timestamp
TIMESTAMP=$(date +%s)
EMAIL1="john${TIMESTAMP}@example.com"
EMAIL2="jane${TIMESTAMP}@example.com"
EMAIL3="bob${TIMESTAMP}@example.com"

echo "Starting multi-user test scenario..."
echo "Using email addresses: $EMAIL1, $EMAIL2, $EMAIL3"

# Function to make API calls
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -z "$token" ]; then
        response=$(curl -s -X $method "http://localhost:8081$endpoint" \
             -H "Content-Type: application/json" \
             -d "$data")
    else
        response=$(curl -s -X $method "http://localhost:8081$endpoint" \
             -H "Content-Type: application/json" \
             -H "Authorization: Bearer $token" \
             -d "$data")
    fi
    
    # Check if the response contains an error message
    if echo "$response" | grep -q '"success":false'; then
        echo -e "${RED}Error: $response${NC}"
        return 1
    fi
    
    echo "$response"
    return 0
}

# 1. Register and sign in three users
echo -e "\n${GREEN}1. Registering and signing in three users...${NC}"

# User 1
echo "Registering User 1..."
user1_register_response=$(call_api "POST" "/api/auth/register" "{
    \"firstName\": \"John\",
    \"lastName\": \"Doe\",
    \"email\": \"$EMAIL1\",
    \"password\": \"password123\",
    \"phone\": \"1234567890\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to register User 1${NC}"
    exit 1
fi

echo "Signing in User 1..."
user1_signin_response=$(call_api "POST" "/api/auth/signin" "{
    \"email\": \"$EMAIL1\",
    \"password\": \"password123\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to sign in User 1${NC}"
    exit 1
fi

user1_token=$(echo $user1_signin_response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$user1_token" ]; then
    echo -e "${RED}Failed to get token for User 1${NC}"
    exit 1
fi
echo "User 1 token: $user1_token"

# User 2
echo "Registering User 2..."
user2_register_response=$(call_api "POST" "/api/auth/register" "{
    \"firstName\": \"Jane\",
    \"lastName\": \"Smith\",
    \"email\": \"$EMAIL2\",
    \"password\": \"password123\",
    \"phone\": \"0987654321\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to register User 2${NC}"
    exit 1
fi

echo "Signing in User 2..."
user2_signin_response=$(call_api "POST" "/api/auth/signin" "{
    \"email\": \"$EMAIL2\",
    \"password\": \"password123\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to sign in User 2${NC}"
    exit 1
fi

user2_token=$(echo $user2_signin_response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$user2_token" ]; then
    echo -e "${RED}Failed to get token for User 2${NC}"
    exit 1
fi
echo "User 2 token: $user2_token"

# User 3
echo "Registering User 3..."
user3_register_response=$(call_api "POST" "/api/auth/register" "{
    \"firstName\": \"Bob\",
    \"lastName\": \"Johnson\",
    \"email\": \"$EMAIL3\",
    \"password\": \"password123\",
    \"phone\": \"5555555555\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to register User 3${NC}"
    exit 1
fi

echo "Signing in User 3..."
user3_signin_response=$(call_api "POST" "/api/auth/signin" "{
    \"email\": \"$EMAIL3\",
    \"password\": \"password123\"
}")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to sign in User 3${NC}"
    exit 1
fi

user3_token=$(echo $user3_signin_response | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$user3_token" ]; then
    echo -e "${RED}Failed to get token for User 3${NC}"
    exit 1
fi
echo "User 3 token: $user3_token"

sleep 2  # Wait for all registrations to complete

# 2. Create listings for each user
echo -e "\n${GREEN}2. Creating listings for each user...${NC}"

# User 1's listing
echo "Creating listing for User 1..."
listing1_response=$(call_api "POST" "/api/listings/create" "{
    \"name\": \"Modern Apartment\",
    \"description\": \"Beautiful modern apartment in the city center\",
    \"address\": \"123 Main St\",
    \"price\": 250000,
    \"bathrooms\": 2,
    \"bedrooms\": 3,
    \"furnished\": true,
    \"parking\": true,
    \"imageUrls\": [\"https://example.com/image1.jpg\"]
}" "$user1_token")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create listing for User 1${NC}"
    exit 1
fi

echo "Listing 1 Response: $listing1_response"
listing1_id=$(echo $listing1_response | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -z "$listing1_id" ]; then
    echo -e "${RED}Failed to get ID for User 1's listing${NC}"
    exit 1
fi
echo "User 1 created listing with ID: $listing1_id"

# User 2's listing
echo "Creating listing for User 2..."
listing2_response=$(call_api "POST" "/api/listings/create" "{
    \"name\": \"Cozy House\",
    \"description\": \"Cozy house in a quiet neighborhood\",
    \"address\": \"456 Oak Ave\",
    \"price\": 350000,
    \"bathrooms\": 3,
    \"bedrooms\": 4,
    \"furnished\": false,
    \"parking\": true,
    \"imageUrls\": [\"https://example.com/image2.jpg\"]
}" "$user2_token")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create listing for User 2${NC}"
    exit 1
fi

echo "Listing 2 Response: $listing2_response"
listing2_id=$(echo $listing2_response | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -z "$listing2_id" ]; then
    echo -e "${RED}Failed to get ID for User 2's listing${NC}"
    exit 1
fi
echo "User 2 created listing with ID: $listing2_id"

# User 3's listing
echo "Creating listing for User 3..."
listing3_response=$(call_api "POST" "/api/listings/create" "{
    \"name\": \"Luxury Villa\",
    \"description\": \"Luxury villa with ocean view\",
    \"address\": \"789 Beach Rd\",
    \"price\": 500000,
    \"bathrooms\": 4,
    \"bedrooms\": 5,
    \"furnished\": true,
    \"parking\": true,
    \"imageUrls\": [\"https://example.com/image3.jpg\"]
}" "$user3_token")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create listing for User 3${NC}"
    exit 1
fi

echo "Listing 3 Response: $listing3_response"
listing3_id=$(echo $listing3_response | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -z "$listing3_id" ]; then
    echo -e "${RED}Failed to get ID for User 3's listing${NC}"
    exit 1
fi
echo "User 3 created listing with ID: $listing3_id"

sleep 2  # Wait for all listings to be created

# 3. Verify each user can see all listings
echo -e "\n${GREEN}3. Verifying listing visibility...${NC}"

# User 1 viewing all listings
echo "User 1 viewing all listings:"
user1_listings=$(call_api "GET" "/api/listings/get" "" "$user1_token")
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get listings for User 1${NC}"
    exit 1
fi
echo "$user1_listings"

# User 2 viewing all listings
echo "User 2 viewing all listings:"
user2_listings=$(call_api "GET" "/api/listings/get" "" "$user2_token")
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get listings for User 2${NC}"
    exit 1
fi
echo "$user2_listings"

# User 3 viewing all listings
echo "User 3 viewing all listings:"
user3_listings=$(call_api "GET" "/api/listings/get" "" "$user3_token")
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to get listings for User 3${NC}"
    exit 1
fi
echo "$user3_listings"

# 4. Verify each user can only delete their own listings
echo -e "\n${GREEN}4. Testing listing deletion permissions...${NC}"

# User 1 trying to delete User 2's listing (should fail)
echo "User 1 trying to delete User 2's listing:"
delete_response1=$(call_api "DELETE" "/api/listings/delete/$listing2_id" "" "$user1_token")
echo "$delete_response1"

# User 2 deleting their own listing (should succeed)
echo "User 2 deleting their own listing:"
delete_response2=$(call_api "DELETE" "/api/listings/delete/$listing2_id" "" "$user2_token")
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to delete User 2's listing${NC}"
    exit 1
fi
echo "$delete_response2"

sleep 2  # Wait for deletion to complete

# 5. Verify the deleted listing is no longer visible
echo -e "\n${GREEN}5. Verifying deleted listing is not visible...${NC}"
echo "All users viewing listings after deletion:"
echo "User 1's view:"
call_api "GET" "/api/listings/get" "" "$user1_token"
echo "User 2's view:"
call_api "GET" "/api/listings/get" "" "$user2_token"
echo "User 3's view:"
call_api "GET" "/api/listings/get" "" "$user3_token"

echo -e "\n${GREEN}Multi-user test scenario completed!${NC}" 