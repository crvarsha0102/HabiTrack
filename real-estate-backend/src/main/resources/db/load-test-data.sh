#!/bin/bash

# Set database connection variables
DB_USER="springstudent"
DB_PASS="springstudent"
DB_NAME="real_estate_DB"

# Check if mysql client is installed
if ! command -v mysql &> /dev/null; then
    echo "MySQL client is not installed. Please install it before running this script."
    exit 1
fi

# Load the test data
echo "Loading test data into $DB_NAME database..."
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$(dirname "$0")/test-data.sql"

# Check if the operation was successful
if [ $? -eq 0 ]; then
    echo "Test data loaded successfully!"
else
    echo "Failed to load test data. Please check your database connection and credentials."
    exit 1
fi

echo "You can now test the application with the following users:"
echo "1. John Smith - Email: john.smith@example.com - Password: password123"
echo "2. Jane Doe - Email: jane.doe@example.com - Password: password123"
echo ""
echo "John has 3 properties listed (Apartment, House, Land)"
echo "Jane has 2 properties listed (Condo, Cottage)"
echo ""
echo "There are also 2 initial messages already in the system for testing replies."
echo "Enjoy testing!" 