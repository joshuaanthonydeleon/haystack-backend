# Vendor API Documentation

## CSV Upload Endpoint

### POST /vendor/upload-csv

Upload and process a CSV file containing vendor data.

**Authentication Required:** Yes (JWT Token)
**Authorization Required:** Admin role only

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `file` field containing the CSV file

**CSV Format:**
The CSV should contain the following columns (matching the provided CSV structure):
- Company
- Official Website
- Summary
- Detailed Description
- Categories
- Target Customers
- Search Hints/Keywords
- Compliance/Certifications
- Integrations/Core Support
- Digital Banking Partners
- Notable Customers (Public)
- Pricing Notes
- Source Used (URL)
- Confidence (0-1)
- Last Verified (UTC)
- Notes

**Response:**
```json
{
  "message": "CSV processed successfully",
  "success": 10,
  "errors": [],
  "totalProcessed": 10
}
```

**Error Responses:**
- 400 Bad Request: No file uploaded, invalid file type, or processing errors
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Insufficient permissions (not admin)

## Get All Vendors

### GET /vendor

Retrieve all vendors with their profiles.

**Authentication Required:** Yes (JWT Token)
**Authorization Required:** Admin or Vendor role

**Response:**
```json
[
  {
    "id": 1,
    "companyName": "Finastra",
    "website": "https://www.finastra.com",
    "isActive": true,
    "profile": {
      "id": 1,
      "summary": "Finastra provides technology for core, lending & digital banking...",
      "category": "Core, Lending & Digital Banking",
      "targetCustomers": ["Community banks", "Credit unions", "Regional banks"],
      // ... other profile fields
    },
    "createdAt": "2025-01-13T05:00:00.000Z",
    "updatedAt": "2025-01-13T05:00:00.000Z"
  }
]
```

## Get Vendor by ID

### GET /vendor/:id

Retrieve a specific vendor by ID.

**Authentication Required:** Yes (JWT Token)
**Authorization Required:** Admin or Vendor role

**Response:**
```json
{
  "id": 1,
  "companyName": "Finastra",
  "website": "https://www.finastra.com",
  "isActive": true,
  "profile": {
    // ... profile data
  },
  "createdAt": "2025-01-13T05:00:00.000Z",
  "updatedAt": "2025-01-13T05:00:00.000Z"
}
```

## Usage Example

### Using curl:
```bash
# Upload CSV file
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@vendors.csv" \
  http://localhost:3001/vendor/upload-csv

# Get all vendors
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/vendor

# Get specific vendor
curl -X GET \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/vendor/1
```

### Using JavaScript/Fetch:
```javascript
// Upload CSV
const formData = new FormData();
formData.append('file', csvFile);

const response = await fetch('/vendor/upload-csv', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result);
```

## Data Processing Notes

1. **Duplicate Prevention:** The system checks for existing vendors by company name or website before creating new ones.

2. **Category Mapping:** Categories are mapped to enum values. Unknown categories are set to "Other".

3. **JSON Fields:** Fields like "Target Customers" and "Search Hints/Keywords" are parsed from semicolon-separated strings into JSON arrays.

4. **Date Parsing:** "Last Verified" dates are parsed from the CSV format into proper Date objects.

5. **Confidence Values:** Confidence values are parsed as decimal numbers (0-1 range).

6. **Error Handling:** Individual row processing errors are collected and returned in the response, allowing partial success.
