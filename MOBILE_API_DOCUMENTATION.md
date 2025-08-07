# Velink Mobile API Documentation

This document describes the mobile API endpoints for Velink that work **WITHOUT AUTHENTICATION**. These endpoints are specifically designed for mobile applications and provide a simple, fast, and reliable way to interact with the Velink URL shortener.

## Base URL
```
http://your-domain.com/api/mobile/
```

## Key Features
- ✅ **No Authentication Required** - All endpoints work without any authentication
- ✅ **Mobile Optimized** - Responses are optimized for mobile applications
- ✅ **Higher Rate Limits** - More generous rate limits for mobile apps
- ✅ **Consistent JSON Responses** - All responses follow the same structure
- ✅ **Comprehensive Error Handling** - Clear error messages and codes

## Rate Limits
- **General API Rate Limit**: 10 requests per second per IP
- **Daily Link Creation Limit**: 1000 links per day per IP

## Response Format
All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

## Endpoints

### 1. Health Check
**GET** `/api/mobile/health`

Check if the mobile API is healthy and running.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-07T11:46:05.123Z",
    "version": "2.0.0",
    "uptime": 3600.5,
    "environment": "production"
  },
  "message": "Mobile API is healthy"
}
```

### 2. Shorten URL
**POST** `/api/mobile/shorten`

Create a short URL from a long URL.

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "expiresIn": "7d",  // Optional: "1d", "7d", "30d", "365d", "never"
  "customAlias": "my-link",  // Optional: 3-50 chars, alphanumeric, hyphens, underscores
  "description": "My example link",  // Optional
  "customOptions": {  // Optional
    "password": "secret123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortUrl": "http://your-domain.com/abc123",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "description": "My example link",
    "expiresAt": "2025-08-14T11:46:05.123Z",
    "createdAt": "2025-08-07T11:46:05.123Z",
    "qrCode": "http://your-domain.com/api/mobile/qr/abc123",
    "clicks": 0,
    "customOptions": { "password": "secret123" }
  },
  "message": "URL shortened successfully"
}
```

### 3. Get URL Info
**GET** `/api/mobile/info/:shortCode`

Get information about a shortened URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "description": "My example link",
    "clicks": 42,
    "createdAt": "2025-08-07T11:46:05.123Z",
    "expiresAt": "2025-08-14T11:46:05.123Z",
    "qrCode": "http://your-domain.com/api/mobile/qr/abc123",
    "isPasswordProtected": true,
    "customOptions": { ... }
  }
}
```

### 4. Get Basic Stats
**GET** `/api/mobile/stats`

Get basic statistics about the service.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLinks": 1250,
    "totalClicks": 5430,
    "todayClicks": 125,
    "linksToday": 23,
    "topLinks": [
      {
        "short_code": "abc123",
        "original_url": "https://example.com",
        "clicks": 250,
        "created_at": "2025-08-07T11:46:05.123Z"
      }
    ],
    "recentActivity": [...]
  }
}
```

### 5. Verify Password
**POST** `/api/mobile/verify-password/:shortCode`

Verify password for a password-protected link.

**Request Body:**
```json
{
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123",
    "originalUrl": "https://example.com/protected-content",
    "description": "Protected link",
    "verified": true
  },
  "message": "Password verified successfully"
}
```

### 6. Batch Shorten URLs
**POST** `/api/mobile/batch-shorten`

Shorten multiple URLs at once (max 10 URLs per request).

**Request Body:**
```json
{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ],
  "expiresIn": "30d",  // Optional, applies to all URLs
  "customOptions": {   // Optional, applies to all URLs
    "description": "Batch created links"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "shortUrl": "http://your-domain.com/xyz789",
        "shortCode": "xyz789",
        "originalUrl": "https://example.com/page1",
        "expiresAt": "2025-09-07T11:46:05.123Z",
        "createdAt": "2025-08-07T11:46:05.123Z",
        "qrCode": "http://your-domain.com/api/mobile/qr/xyz789",
        "clicks": 0
      }
    ],
    "errors": [],
    "total": 3,
    "successful": 3,
    "failed": 0
  },
  "message": "3/3 URLs shortened successfully"
}
```

### 7. Generate QR Code
**GET** `/api/mobile/qr/:shortCode?size=200&format=png`

Get QR code data for a shortened URL.

**Query Parameters:**
- `size`: QR code size (50-500, default: 200)
- `format`: Output format ("png", "svg", "jpeg", default: "png")
- `download`: Set to "true" for download URL

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": {
      "url": "http://your-domain.com/abc123",
      "size": 200,
      "format": "png",
      "text": "http://your-domain.com/abc123"
    },
    "shortUrl": "http://your-domain.com/abc123",
    "originalUrl": "https://example.com",
    "downloadUrl": "http://your-domain.com/api/mobile/qr/abc123?download=true&size=200&format=png"
  }
}
```

### 8. Get Link Analytics
**GET** `/api/mobile/analytics/:shortCode`

Get detailed analytics for a specific link.

**Response:**
```json
{
  "success": true,
  "data": {
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "totalClicks": 150,
    "createdAt": "2025-08-07T11:46:05.123Z",
    "expiresAt": null,
    "analytics": {
      "clicksByDay": [
        { "date": "2025-08-07", "clicks": 25 }
      ],
      "clicksByCountry": [
        { "country": "United States", "clicks": 75 },
        { "country": "Germany", "clicks": 35 }
      ],
      "clicksByDevice": [
        { "device_type": "Mobile", "clicks": 90 },
        { "device_type": "Desktop", "clicks": 60 }
      ],
      "clicksByBrowser": [
        { "browser": "Chrome", "clicks": 80 },
        { "browser": "Safari", "clicks": 40 }
      ],
      "clicksByOS": [
        { "os": "Android", "clicks": 50 },
        { "os": "iOS", "clicks": 40 }
      ],
      "recentClicks": [...]
    }
  }
}
```

### 9. Search Links (Limited)
**GET** `/api/mobile/search?q=example&limit=20`

Search for links (basic functionality).

**Query Parameters:**
- `q`: Search query (min 2 characters)
- `limit`: Max results (1-50, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "example",
    "results": [],
    "total": 0,
    "limit": 20
  },
  "message": "Search completed (feature in development)"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Link not found |
| `EXPIRED` | Link has expired |
| `ALIAS_EXISTS` | Custom alias already exists |
| `NOT_PASSWORD_PROTECTED` | Link is not password protected |
| `INVALID_PASSWORD` | Invalid password provided |
| `INVALID_QUERY` | Search query is invalid |
| `INTERNAL_ERROR` | Internal server error |

## Usage Examples

### cURL Examples

```bash
# Health check
curl http://your-domain.com/api/mobile/health

# Shorten URL
curl -X POST http://your-domain.com/api/mobile/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get URL info
curl http://your-domain.com/api/mobile/info/abc123

# Get stats
curl http://your-domain.com/api/mobile/stats

# Batch shorten
curl -X POST http://your-domain.com/api/mobile/batch-shorten \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://google.com", "https://github.com"]}'
```

### JavaScript/Fetch Examples

```javascript
// Shorten URL
const response = await fetch('/api/mobile/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});
const result = await response.json();

// Get URL info
const info = await fetch('/api/mobile/info/abc123');
const urlInfo = await info.json();

// Get stats
const stats = await fetch('/api/mobile/stats');
const statistics = await stats.json();
```

## Security Notes

1. **No Authentication Required**: These endpoints don't require authentication for easy integration
2. **Rate Limited**: Reasonable rate limits are in place to prevent abuse
3. **IP-based Tracking**: Some tracking is done by IP for rate limiting and basic analytics
4. **Public Data Only**: Analytics and stats only include public, non-private links
5. **Password Protection**: Links can still be password-protected; use the verify-password endpoint

## Integration Tips

1. **Always check success field** in responses before processing data
2. **Handle rate limits gracefully** - respect the rate limit headers
3. **Use batch endpoints** when shortening multiple URLs
4. **Cache responses** when appropriate to reduce API calls
5. **Implement retry logic** for failed requests
6. **Validate URLs** on your side before sending to the API

## Support

For support or questions about the Mobile API, please check the main Velink documentation or create an issue in the repository.

---

**Version**: 2.0.0  
**Last Updated**: August 7, 2025
