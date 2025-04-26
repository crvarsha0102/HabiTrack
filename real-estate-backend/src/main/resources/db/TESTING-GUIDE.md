# Real Estate Project - Testing Guide

This document outlines the steps to test the various features of the real estate application, with a focus on the messaging system.

## Prerequisites

1. MySQL database is running
2. Backend application is running
3. Frontend application is running

## Loading Test Data

1. Make the script executable:
   ```bash
   chmod +x load-test-data.sh
   ```

2. Run the script:
   ```bash
   ./load-test-data.sh
   ```

This will load:
- 2 test users (John and Jane)
- 5 properties (3 from John, 2 from Jane) 
- 2 initial messages (one from each user to the other)

## Test Accounts

- **User 1**: John Smith
  - Email: john.smith@example.com
  - Password: password123
  - Properties: Modern Downtown Apartment, Spacious Family Home, Development Land Opportunity

- **User 2**: Jane Doe
  - Email: jane.doe@example.com
  - Password: password123
  - Properties: Luxury Waterfront Condo, Charming Cottage Retreat

## Testing Workflow

### 1. Login and Browse Properties

1. Login as Jane Doe
2. Navigate to the Properties page
3. Browse through all available properties
4. Verify that you can see John's properties
5. Click on "Modern Downtown Apartment" to view details

### 2. Send a Message from Property Detail Page

1. While viewing John's "Modern Downtown Apartment"
2. Scroll down to the Contact Agent form
3. The form should already have Jane's name and email populated
4. Enter a message: "I'm interested in renting this apartment. Is it still available?"
5. Click "Send Message"
6. Verify you receive a success confirmation

### 3. View Sent Messages

1. Navigate to the Messages page
2. Click on the "Sent" tab
3. Verify you can see the message you just sent
4. Verify you can also see the initial message from the test data
5. Verify the property image, title, and message content are displayed correctly

### 4. Login as Property Owner and Check Inbox

1. Log out from Jane's account
2. Login as John Smith
3. Navigate to the Messages page
4. Verify you can see at least 2 messages from Jane (one from test data, one you just sent)
5. Verify the messages appear as unread (should have visual indicator)
6. Click on any message to mark it as read
7. Verify the message is now marked as read (visual indicator should change)

### 5. Reply to a Message

1. In John's inbox, find the message from Jane about the apartment
2. Click the "Reply" button
3. Verify that the reply modal opens
4. Verify the subject is prefilled with "RE: [original subject]"
5. Verify the property information is displayed
6. Verify the original message is displayed
7. Enter a reply: "Yes, the apartment is still available! Would you like to schedule a viewing this weekend?"
8. Click "Send Reply"
9. Verify you receive a success confirmation
10. Verify the message appears in the "Sent" tab

### 6. Check Reply as the Original Sender

1. Log out from John's account
2. Login as Jane Doe again
3. Navigate to the Messages page
4. Verify you can see John's reply in your inbox
5. Read the message
6. Reply again: "That sounds great! How about Saturday at 2pm?"

### 7. Delete a Message

1. Go to the "Sent" tab
2. Find an older message
3. Click the delete (trash) button
4. Confirm the deletion
5. Verify the message is removed from the list

### 8. Test with Property Images

1. Navigate to Properties
2. Click on a property with multiple images
3. Test the image carousel/slider
4. Send a message about this property
5. Go to Messages
6. Verify the correct property image appears with the message

### 9. Test Message Read Status

1. Log out and login as the other user
2. Go to the Messages page
3. Verify new messages show as unread
4. Click on a message
5. Verify it gets marked as read
6. Refresh the page
7. Verify the read status persists (message still appears as read)

## Testing API Endpoints Directly

For developers, you can also test the API endpoints directly:

### Messaging Endpoints

1. **GET /messages/inbox** - Retrieve user's inbox messages
2. **GET /messages/sent** - Retrieve user's sent messages
3. **POST /messages/contact** - Send a contact message to a property owner
4. **POST /messages/send** - Send a direct message (like a reply)
5. **PUT /messages/{id}/read** - Mark a message as read
6. **DELETE /messages/{id}** - Delete a message

### Property Endpoints for Testing

1. **GET /listings/all** - Retrieve all listings
2. **GET /listings/get/{id}** - Get a specific listing by ID
3. **POST /favorites/add/{listingId}** - Add a listing to favorites
4. **GET /favorites/user/{userId}** - Get user's favorite listings
5. **DELETE /favorites/remove/{listingId}** - Remove a listing from favorites

## Troubleshooting

If you encounter any issues:

1. Check the database connection settings
2. Verify that both backend and frontend are running
3. Check browser console for JavaScript errors
4. Check server logs for backend errors

For database issues, you can reset the data:
```bash
./load-test-data.sh
```

This will clear existing test data and reload fresh test data.

Happy testing! 