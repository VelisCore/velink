import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Server, 
  Clock, 
  Lock, 
  Check, 
  Settings,
  Shield,
  Database,
  BarChart3,
  Download,
  Eye,
  Trash2,
  Edit3,
  Globe,
  Copy,
  FileText,
  Users,
  Activity,
  Zap,
  ExternalLink,
  Code,
  Book,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  Terminal,
  Play,
  Star,
  HelpCircle,
  Cpu,
  Smartphone,
  Network,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Endpoint {
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  endpoint: string;
  description: string;
  longDescription?: string;
  requestBody?: any;
  response?: any;
  headers?: string[];
  limits?: string;
  authentication?: string;
  icon: React.ReactNode;
  category: string;
  examples?: { title: string; code: string; description?: string }[];
  errors?: { code: number; description: string }[];
  notes?: string[];
  complexity?: 'simple' | 'moderate' | 'complex';
  version?: string;
  deprecated?: boolean;
  tags?: string[];
}

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface QuickStartStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  icon: React.ReactNode;
}

const ApiDocumentation: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const baseUrl = window.location.origin;

  // Quick Start Steps
  const quickStartSteps: QuickStartStep[] = [
    {
      step: 1,
      title: 'Choose Your Integration Method',
      description: 'Select from REST API, JavaScript SDK, or direct HTTP requests based on your application needs.',
      icon: <Code className="h-6 w-6" />,
      code: `// Choose your preferred method:
// 1. REST API with cURL
// 2. JavaScript fetch API
// 3. Node.js with axios
// 4. Python with requests`
    },
    {
      step: 2,
      title: 'Make Your First Request',
      description: 'Start by creating a shortened URL using our public API endpoint.',
      icon: <Play className="h-6 w-6" />,
      code: `curl -X POST "${baseUrl}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`
    },
    {
      step: 3,
      title: 'Handle the Response',
      description: 'Process the JSON response containing your new short URL and metadata.',
      icon: <CheckCircle className="h-6 w-6" />,
      code: `{
  "shortUrl": "${baseUrl}/abc123",
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "clicks": 0,
  "createdAt": "2025-07-24T12:00:00.000Z"
}`
    },
    {
      step: 4,
      title: 'Monitor & Analyze',
      description: 'Use analytics endpoints to track performance and gather insights.',
      icon: <TrendingUp className="h-6 w-6" />,
      code: `curl -X GET "${baseUrl}/api/analytics/abc123"`
    }
  ];

  // Feature Cards
  const features: FeatureCard[] = [
    {
      title: 'RESTful API Design',
      description: 'Clean, intuitive endpoints following REST principles with consistent response formats.',
      icon: <Server className="h-8 w-8" />,
      highlight: true
    },
    {
      title: 'Real-time Analytics',
      description: 'Comprehensive click tracking, geographic data, and performance metrics.',
      icon: <BarChart3 className="h-8 w-8" />
    },
    {
      title: 'Advanced Security',
      description: 'Password protection, expiration dates, and admin authentication.',
      icon: <Shield className="h-8 w-8" />
    },
    {
      title: 'Rate Limiting',
      description: 'Built-in protection against abuse with configurable limits.',
      icon: <Timer className="h-8 w-8" />
    },
    {
      title: 'Custom Aliases',
      description: 'Create memorable short URLs with custom names and branding.',
      icon: <Edit3 className="h-8 w-8" />
    },
    {
      title: 'GDPR Compliant',
      description: 'Data access, export, and deletion endpoints for privacy compliance.',
      icon: <FileText className="h-8 w-8" />
    }
  ];

  const apiEndpoints: Endpoint[] = [
    // Public API Endpoints
    {
      name: 'Create Short URL',
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Transform any long URL into a short, shareable link with extensive customization options.',
      longDescription: 'This is the core endpoint of VeLink. It accepts a long URL and returns a shortened version with optional advanced features like password protection, custom aliases, expiration dates, and redirect delays. Perfect for social media sharing, email campaigns, and anywhere you need clean, trackable links.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['core', 'creation', 'public'],
      requestBody: {
        url: 'https://example.com/very-long-url-that-needs-shortening',
        expiresIn: '30d', // Optional: '1d', '7d', '30d', '365d', 'never' (default: 'never')
        customAlias: 'my-custom-link', // Optional: 3-50 chars, alphanumeric, hyphens, underscores
        customOptions: {
          password: 'secret123', // Optional: Password protection for the link
          isPrivate: false, // Optional: Hide from public statistics (default: false)
          redirectDelay: 0 // Optional: Delay before redirect in seconds (0-30, default: 0)
        }
      },
      response: {
        success: true,
        shortUrl: `${baseUrl}/abc123`,
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
        clicks: 0,
        createdAt: '2025-07-24T12:00:00.000Z',
        expiresAt: '2025-08-23T12:00:00.000Z',
        customOptions: {
          password: true, // Boolean indicating if password is set
          isPrivate: false,
          redirectDelay: 0
        },
        qrCode: `${baseUrl}/api/qr/abc123`, // QR code generation endpoint
        analytics: `${baseUrl}/api/analytics/abc123` // Direct analytics link
      },
      limits: 'Rate limited: 1 request per 0.5 seconds per IP, 500 links per day per IP address',
      icon: <Server className="h-5 w-5" />,
      examples: [
        {
          title: 'Basic URL Shortening',
          description: 'Simple URL shortening without any additional options',
          code: `curl -X POST "${baseUrl}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url-that-needs-shortening"
  }'`
        },
        {
          title: 'Advanced URL with Custom Options',
          description: 'Create a password-protected, private link with custom alias and expiration',
          code: `curl -X POST "${baseUrl}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/secure-document",
    "customAlias": "secure-doc-2025",
    "expiresIn": "7d",
    "customOptions": {
      "password": "SecurePass123!",
      "isPrivate": true,
      "redirectDelay": 5
    }
  }'`
        },
        {
          title: 'JavaScript/Node.js Example',
          description: 'Using fetch API in JavaScript applications',
          code: `const response = await fetch('${baseUrl}/api/shorten', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com/long-url',
    expiresIn: '30d'
  })
});

const data = await response.json();
console.log('Short URL:', data.shortUrl);`
        },
        {
          title: 'Python Example',
          description: 'Using Python requests library',
          code: `import requests

url = "${baseUrl}/api/shorten"
payload = {
    "url": "https://example.com/long-url",
    "customAlias": "python-example",
    "expiresIn": "30d"
}

response = requests.post(url, json=payload)
data = response.json()
print(f"Short URL: {data['shortUrl']}")`
        }
      ],
      errors: [
        { code: 400, description: 'Invalid URL format or missing required fields' },
        { code: 409, description: 'Custom alias already exists' },
        { code: 429, description: 'Rate limit exceeded' },
        { code: 413, description: 'URL too long (max 2048 characters)' }
      ],
      notes: [
        'URLs must be valid HTTP/HTTPS URLs',
        'Custom aliases must be unique across the entire system',
        'Password protection adds an extra layer before redirect',
        'Private links are excluded from public statistics',
        'Redirect delays can help with security and user awareness'
      ]
    },
    {
      name: 'Get URL Information',
      method: 'GET',
      endpoint: '/api/info/{shortCode}',
      description: 'Retrieve comprehensive metadata and settings for any shortened URL.',
      longDescription: 'Get detailed information about a shortened URL including its original URL, creation date, expiration status, click count, and all configured options. This endpoint is perfect for verification, debugging, and displaying link information in your applications.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['information', 'metadata', 'public'],
      response: {
        success: true,
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        clicks: 42,
        createdAt: '2025-07-24T12:00:00.000Z',
        expiresAt: '2025-08-23T12:00:00.000Z',
        isActive: true,
        isExpired: false,
        hasPassword: true,
        customOptions: {
          password: true, // Boolean only, actual password never exposed
          isPrivate: false,
          redirectDelay: 0
        },
        qrCodeUrl: `${baseUrl}/api/qr/abc123`,
        analyticsUrl: `${baseUrl}/api/analytics/abc123`,
        domain: 'example.com',
        protocol: 'https'
      },
      icon: <Info className="h-5 w-5" />,
      examples: [
        {
          title: 'Get URL Information',
          description: 'Retrieve all public information about a shortened URL',
          code: `curl -X GET "${baseUrl}/api/info/abc123"`
        },
        {
          title: 'JavaScript Example',
          description: 'Fetch URL information in a web application',
          code: `const response = await fetch('${baseUrl}/api/info/abc123');
const info = await response.json();

console.log('Original URL:', info.originalUrl);
console.log('Total Clicks:', info.clicks);
console.log('Is Active:', info.isActive);`
        },
        {
          title: 'Check Multiple URLs',
          description: 'Batch check multiple URLs (requires custom implementation)',
          code: `const shortCodes = ['abc123', 'def456', 'ghi789'];
const promises = shortCodes.map(code => 
  fetch(\`${baseUrl}/api/info/\${code}\`).then(r => r.json())
);

const results = await Promise.all(promises);
results.forEach(info => {
  console.log(\`\${info.shortCode}: \${info.clicks} clicks\`);
});`
        }
      ],
      errors: [
        { code: 404, description: 'Short code not found' },
        { code: 410, description: 'URL has expired and is no longer available' }
      ],
      notes: [
        'Password-protected URLs will not reveal the password',
        'Private URLs still return information but may be excluded from some analytics',
        'Expired URLs return 410 status with expiration information'
      ]
    },
    {
      name: 'Get URL Analytics',
      method: 'GET',
      endpoint: '/api/analytics/{shortCode}',
      description: 'Access detailed click analytics, geographic data, and performance metrics.',
      longDescription: 'Comprehensive analytics endpoint providing click statistics, referrer information, geographic distribution, device types, and time-based analytics. Essential for understanding link performance and audience behavior.',
      category: 'public',
      complexity: 'moderate',
      version: '1.0',
      tags: ['analytics', 'statistics', 'tracking', 'public'],
      response: {
        success: true,
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        totalClicks: 42,
        uniqueClicks: 35,
        createdAt: '2025-07-24T12:00:00.000Z',
        lastAccessed: '2025-07-24T14:30:00.000Z',
        averageClicksPerDay: 1.4,
        clicksByDate: [
          { date: '2025-07-24', clicks: 15, uniqueClicks: 12 },
          { date: '2025-07-23', clicks: 27, uniqueClicks: 23 }
        ],
        clicksByHour: [
          { hour: 14, clicks: 8 },
          { hour: 13, clicks: 12 },
          { hour: 12, clicks: 5 }
        ],
        topReferrers: [
          { referrer: 'google.com', clicks: 20, percentage: 47.6 },
          { referrer: 'direct', clicks: 15, percentage: 35.7 },
          { referrer: 'twitter.com', clicks: 7, percentage: 16.7 }
        ],
        topCountries: [
          { country: 'United States', clicks: 25, percentage: 59.5 },
          { country: 'Canada', clicks: 10, percentage: 23.8 },
          { country: 'United Kingdom', clicks: 7, percentage: 16.7 }
        ],
        deviceTypes: [
          { device: 'desktop', clicks: 28, percentage: 66.7 },
          { device: 'mobile', clicks: 12, percentage: 28.6 },
          { device: 'tablet', clicks: 2, percentage: 4.7 }
        ],
        browsers: [
          { browser: 'Chrome', clicks: 30, percentage: 71.4 },
          { browser: 'Firefox', clicks: 8, percentage: 19.0 },
          { browser: 'Safari', clicks: 4, percentage: 9.6 }
        ]
      },
      icon: <BarChart3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Complete Analytics',
          description: 'Retrieve all available analytics data for a shortened URL',
          code: `curl -X GET "${baseUrl}/api/analytics/abc123"`
        },
        {
          title: 'JavaScript Analytics Dashboard',
          description: 'Create a simple analytics dashboard',
          code: `async function createAnalyticsDashboard(shortCode) {
  const response = await fetch(\`${baseUrl}/api/analytics/\${shortCode}\`);
  const analytics = await response.json();
  
  console.log(\`Total Clicks: \${analytics.totalClicks}\`);
  console.log(\`Top Referrer: \${analytics.topReferrers[0]?.referrer}\`);
  
  // Display daily clicks chart
  analytics.clicksByDate.forEach(day => {
    console.log(\`\${day.date}: \${day.clicks} clicks\`);
  });
  
  return analytics;
}`
        },
        {
          title: 'Python Analytics Processing',
          description: 'Process analytics data with Python',
          code: `import requests
import pandas as pd

response = requests.get("${baseUrl}/api/analytics/abc123")
analytics = response.json()

# Create DataFrame from daily clicks
df = pd.DataFrame(analytics['clicksByDate'])
df['date'] = pd.to_datetime(df['date'])

print(f"Average daily clicks: {df['clicks'].mean():.2f}")
print(f"Peak day: {df.loc[df['clicks'].idxmax(), 'date']}")`
        }
      ],
      errors: [
        { code: 404, description: 'Short code not found' },
        { code: 403, description: 'Analytics not available for private URLs (admin access required)' }
      ],
      notes: [
        'Private URLs require admin authentication to view analytics',
        'Geographic data is based on IP geolocation and may not be 100% accurate',
        'Device and browser detection uses User-Agent parsing',
        'Unique clicks are tracked per IP address per day'
      ]
    },
    {
      name: 'Generate QR Code',
      method: 'GET',
      endpoint: '/api/qr/{shortCode}',
      description: 'Generate a QR code image for any shortened URL with customizable size and format.',
      longDescription: 'Creates a QR code that directly links to your shortened URL. Perfect for print materials, presentations, and mobile sharing. Supports multiple formats and sizes to fit your specific use case.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['qr-code', 'visual', 'mobile', 'public'],
      response: {
        contentType: 'image/png',
        description: 'Returns a PNG image of the QR code',
        size: 'Configurable via query parameters (default: 200x200px)',
        format: 'PNG, SVG, or JPEG'
      },
      icon: <Smartphone className="h-5 w-5" />,
      examples: [
        {
          title: 'Basic QR Code',
          description: 'Generate a standard 200x200px QR code',
          code: `curl -X GET "${baseUrl}/api/qr/abc123" \\
  -o qrcode.png`
        },
        {
          title: 'Custom Size QR Code',
          description: 'Generate a larger QR code for print materials',
          code: `curl -X GET "${baseUrl}/api/qr/abc123?size=400&format=png" \\
  -o large_qrcode.png`
        },
        {
          title: 'HTML Image Tag',
          description: 'Directly embed QR code in HTML',
          code: `<img src="${baseUrl}/api/qr/abc123?size=300" 
     alt="QR Code for shortened URL" 
     width="300" height="300" />`
        }
      ],
      errors: [
        { code: 404, description: 'Short code not found' },
        { code: 400, description: 'Invalid size parameter (must be 50-1000)' }
      ],
      notes: [
        'QR codes work with expired URLs but will redirect to error page',
        'Size parameter accepts values between 50 and 1000 pixels',
        'Format parameter accepts: png, svg, jpeg'
      ]
    },
    {
      name: 'Track Click Event',
      method: 'POST',
      endpoint: '/api/track/{shortCode}',
      description: 'Manually track a click event with optional metadata and user information.',
      longDescription: 'Record a click event for analytics purposes. This endpoint is typically used internally by the redirect system but can be called manually for custom tracking implementations or server-side analytics.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['tracking', 'analytics', 'events', 'public'],
      requestBody: {
        referrer: 'https://google.com', // Optional: Source referrer
        userAgent: 'Mozilla/5.0...', // Optional: User agent string
        ipAddress: '192.168.1.1', // Optional: User IP (auto-detected if not provided)
        metadata: { // Optional: Custom tracking data
          campaign: 'summer-2025',
          source: 'email',
          medium: 'newsletter'
        }
      },
      response: {
        success: true,
        shortCode: 'abc123',
        totalClicks: 43,
        newClick: true,
        timestamp: '2025-07-24T14:30:00.000Z',
        trackingId: 'track_abc123_1643024400'
      },
      icon: <Target className="h-5 w-5" />,
      examples: [
        {
          title: 'Simple Click Tracking',
          description: 'Track a basic click event',
          code: `curl -X POST "${baseUrl}/api/track/abc123"`
        },
        {
          title: 'Advanced Click Tracking',
          description: 'Track with custom metadata and referrer information',
          code: `curl -X POST "${baseUrl}/api/track/abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "referrer": "https://twitter.com/post/123",
    "metadata": {
      "campaign": "social-media-blast",
      "source": "twitter",
      "button": "cta-main"
    }
  }'`
        },
        {
          title: 'JavaScript Tracking',
          description: 'Track clicks in web applications',
          code: `// Track click before redirect
async function trackAndRedirect(shortCode, originalUrl) {
  await fetch(\`${baseUrl}/api/track/\${shortCode}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referrer: document.referrer,
      metadata: { source: 'web-app' }
    })
  });
  
  window.location.href = originalUrl;
}`
        }
      ],
      errors: [
        { code: 404, description: 'Short code not found' },
        { code: 429, description: 'Too many tracking requests from same IP' }
      ],
      notes: [
        'IP address is automatically detected if not provided',
        'Duplicate clicks from same IP within 1 hour are marked as non-unique',
        'Custom metadata is stored for advanced analytics'
      ]
    },
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/api/health',
      description: 'Monitor API server health, status, and performance metrics.',
      longDescription: 'Essential endpoint for monitoring and alerting systems. Provides real-time information about server health, database connectivity, response times, and system resources.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['monitoring', 'health', 'status', 'public'],
      response: {
        status: 'healthy',
        timestamp: '2025-07-24T12:00:00.000Z',
        uptime: 86400,
        version: '1.0.0',
        database: {
          status: 'connected',
          responseTime: 15,
          connections: 5
        },
        memory: {
          used: '45.2 MB',
          total: '512 MB',
          percentage: 8.8
        },
        performance: {
          averageResponseTime: 120,
          requestsPerMinute: 45,
          errorRate: 0.02
        }
      },
      icon: <Cpu className="h-5 w-5" />,
      examples: [
        {
          title: 'Basic Health Check',
          description: 'Simple server status check',
          code: `curl -X GET "${baseUrl}/api/health"`
        },
        {
          title: 'Monitoring Script',
          description: 'Automated health monitoring with alerts',
          code: `#!/bin/bash
response=$(curl -s "${baseUrl}/api/health")
status=$(echo $response | jq -r '.status')

if [ "$status" != "healthy" ]; then
    echo "ALERT: API server is not healthy!"
    echo "Response: $response"
    # Send alert notification
else
    echo "✓ API server is healthy"
fi`
        },
        {
          title: 'JavaScript Health Monitor',
          description: 'Monitor health in web applications',
          code: `class HealthMonitor {
  async checkHealth() {
    try {
      const response = await fetch('${baseUrl}/api/health');
      const health = await response.json();
      
      if (health.status !== 'healthy') {
        this.handleUnhealthy(health);
      }
      
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }
  
  handleUnhealthy(health) {
    console.warn('API health issue detected:', health);
    // Implement fallback logic
  }
}`
        }
      ],
      notes: [
        'Always returns 200 status code unless server is completely down',
        'Response times include database query performance',
        'Memory usage is for the Node.js process only'
      ]
    },
    {
      name: 'Global Statistics',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Access comprehensive global statistics and platform-wide metrics.',
      longDescription: 'Get an overview of the entire VeLink platform including total links created, click statistics, growth trends, and usage patterns. Perfect for dashboards, reports, and understanding platform adoption.',
      category: 'public',
      complexity: 'moderate',
      version: '1.0',
      tags: ['statistics', 'global', 'metrics', 'public'],
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        activeLinks: 950,
        expiredLinks: 50,
        linksToday: 25,
        clicksToday: 1200,
        avgClicksPerLink: 50,
        uniqueUsers: 750,
        topPerformingDomains: [
          { domain: 'example.com', links: 250, clicks: 12500 },
          { domain: 'github.com', links: 180, clicks: 9000 }
        ],
        growthMetrics: {
          linksGrowthWeekly: 15.5,
          clicksGrowthWeekly: 22.3,
          newUsersWeekly: 45
        },
        platformHealth: {
          uptime: 99.9,
          averageResponseTime: 150,
          successRate: 99.8
        }
      },
      icon: <Globe className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Platform Statistics',
          description: 'Retrieve all global platform metrics',
          code: `curl -X GET "${baseUrl}/api/stats"`
        },
        {
          title: 'Statistics Dashboard',
          description: 'Create a real-time statistics dashboard',
          code: `async function createStatsDashboard() {
  const stats = await fetch('${baseUrl}/api/stats')
    .then(r => r.json());
  
  document.getElementById('total-links').textContent = 
    stats.totalLinks.toLocaleString();
  document.getElementById('total-clicks').textContent = 
    stats.totalClicks.toLocaleString();
  document.getElementById('avg-clicks').textContent = 
    stats.avgClicksPerLink.toFixed(1);
    
  // Update charts with growth metrics
  updateGrowthChart(stats.growthMetrics);
}`
        },
        {
          title: 'Python Analytics Report',
          description: 'Generate weekly platform reports',
          code: `import requests
from datetime import datetime

def generate_weekly_report():
    stats = requests.get("${baseUrl}/api/stats").json()
    
    report = f"""
    VeLink Weekly Report - {datetime.now().strftime('%Y-%m-%d')}
    
    📊 Platform Overview:
    • Total Links: {stats['totalLinks']:,}
    • Total Clicks: {stats['totalClicks']:,}
    • Average Clicks per Link: {stats['avgClicksPerLink']:.1f}
    
    📈 Growth Metrics:
    • Links Growth: {stats['growthMetrics']['linksGrowthWeekly']:.1f}%
    • Clicks Growth: {stats['growthMetrics']['clicksGrowthWeekly']:.1f}%
    """
    
    return report`
        }
      ],
      notes: [
        'Statistics are updated in real-time',
        'Growth metrics are calculated weekly',
        'Top domains exclude private and password-protected links'
      ]
    },
    {
      name: 'Enhanced Statistics',
      method: 'GET',
      endpoint: '/api/v1/stats',
      description: 'Get comprehensive real-time statistics with detailed metrics, trends, and analytics.',
      longDescription: 'Advanced statistics endpoint providing deeper insights into platform performance, user behavior, and growth trends. Includes hourly breakdowns, domain analysis, and predictive metrics.',
      category: 'public',
      complexity: 'moderate',
      version: '1.1',
      tags: ['statistics', 'enhanced', 'analytics', 'trends', 'public'],
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        activeLinks: 950,
        linksToday: 25,
        clicksToday: 1200,
        avgClicksPerLink: 50,
        latestCreated: '2025-07-24T12:00:00.000Z',
        dailyAverage: 35,
        topDomains: [
          { domain: 'example.com', count: 250, total_clicks: 12500, avg_clicks: 50 },
          { domain: 'github.com', count: 180, total_clicks: 9000, avg_clicks: 50 }
        ],
        clicksByDay: [
          { date: '2025-07-24', links_created: 25, total_clicks: 1200, unique_visitors: 890 },
          { date: '2025-07-23', links_created: 32, total_clicks: 1100, unique_visitors: 820 }
        ],
        hourlyStats: [
          { hour: '14', links_created: 5, clicks: 120 },
          { hour: '13', links_created: 8, clicks: 95 }
        ],
        performanceMetrics: {
          averageResponseTime: 145,
          uptime: 99.95,
          errorRate: 0.01
        }
      },
      icon: <TrendingUp className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Enhanced Statistics',
          description: 'Retrieve comprehensive platform analytics',
          code: `curl -X GET "${baseUrl}/api/v1/stats"`
        },
        {
          title: 'Real-time Dashboard',
          description: 'Build a live statistics dashboard',
          code: `async function updateDashboard() {
  const stats = await fetch('${baseUrl}/api/v1/stats').then(r => r.json());
  
  // Update key metrics
  updateMetric('total-links', stats.totalLinks);
  updateMetric('total-clicks', stats.totalClicks);
  updateMetric('daily-average', stats.dailyAverage);
  
  // Update charts
  updateHourlyChart(stats.hourlyStats);
  updateDomainChart(stats.topDomains);
  
  // Schedule next update
  setTimeout(updateDashboard, 30000); // Update every 30 seconds
}`
        }
      ],
      notes: [
        'Updated in real-time with WebSocket support',
        'Includes predictive analytics and trend analysis',
        'Performance metrics help monitor system health'
      ]
    },
    {
      name: 'Password Verification',
      method: 'POST',
      endpoint: '/api/check-password',
      description: 'Verify passwords for admin access or password-protected links.',
      longDescription: 'Secure password verification endpoint supporting both admin authentication and password-protected link access. Uses bcrypt hashing for security.',
      category: 'public',
      complexity: 'simple',
      version: '1.0',
      tags: ['security', 'authentication', 'password', 'public'],
      requestBody: {
        password: 'user_provided_password',
        type: 'admin', // Optional: 'admin' or 'link'
        shortCode: 'abc123' // Required if type is 'link'
      },
      response: {
        valid: true,
        type: 'admin',
        expiresIn: 3600, // Session duration in seconds
        timestamp: '2025-07-24T12:00:00.000Z'
      },
      icon: <Lock className="h-5 w-5" />,
      examples: [
        {
          title: 'Admin Password Check',
          description: 'Verify admin credentials',
          code: `curl -X POST "${baseUrl}/api/check-password" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "admin_password", "type": "admin"}'`
        },
        {
          title: 'Link Password Check',
          description: 'Verify password for protected link',
          code: `curl -X POST "${baseUrl}/api/check-password" \\
  -H "Content-Type: application/json" \\
  -d '{
    "password": "link_password",
    "type": "link",
    "shortCode": "abc123"
  }'`
        }
      ],
      errors: [
        { code: 401, description: 'Invalid password' },
        { code: 404, description: 'Short code not found (for link passwords)' },
        { code: 429, description: 'Too many failed attempts' }
      ],
      notes: [
        'Passwords are never stored in plain text',
        'Failed attempts are rate-limited to prevent brute force',
        'Admin sessions expire after 1 hour of inactivity'
      ]
    },

    // Admin API Endpoints
    {
      name: 'Check Password',
      method: 'POST',
      endpoint: '/api/check-password',
      description: 'Verify if a provided password matches the stored admin password.',
      category: 'public',
      requestBody: {
        password: 'admin_password'
      },
      response: {
        valid: true
      },
      icon: <Lock className="h-5 w-5" />,
      examples: [
        {
          title: 'Check Password',
          code: `curl -X POST "${baseUrl}/api/check-password" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_password"}'`
        }
      ]
    },

    // Admin API Endpoints
    {
      name: 'Admin Authentication',
      method: 'POST',
      endpoint: '/api/admin/verify',
      description: 'Authenticate admin access and receive a session token for protected operations.',
      longDescription: 'Secure authentication endpoint that validates admin credentials and returns a JWT token for accessing protected admin endpoints. Implements session management and security best practices.',
      category: 'admin',
      complexity: 'simple',
      version: '1.0',
      tags: ['authentication', 'security', 'admin', 'jwt'],
      authentication: 'Admin password required in request body',
      requestBody: {
        password: 'your_admin_password',
        rememberMe: false, // Optional: extend session duration
        metadata: { // Optional: additional context
          source: 'web-admin',
          userAgent: 'Mozilla/5.0...'
        }
      },
      response: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTY0MzAyNDQwMCwiZXhwIjoxNjQzMDI4MDAwfQ.signature',
        expiresIn: 3600,
        expiresAt: '2025-07-24T13:00:00.000Z',
        permissions: ['read', 'write', 'delete', 'stats'],
        sessionId: 'sess_abc123',
        message: 'Authentication successful'
      },
      icon: <Shield className="h-5 w-5" />,
      examples: [
        {
          title: 'Basic Admin Login',
          description: 'Authenticate with admin password',
          code: `curl -X POST "${baseUrl}/api/admin/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_admin_password"}'`
        },
        {
          title: 'JavaScript Admin Login',
          description: 'Authenticate and store token for subsequent requests',
          code: `async function adminLogin(password) {
  const response = await fetch('${baseUrl}/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  
  const auth = await response.json();
  
  if (auth.success) {
    localStorage.setItem('adminToken', auth.token);
    localStorage.setItem('tokenExpiry', auth.expiresAt);
    return auth;
  } else {
    throw new Error('Authentication failed');
  }
}`
        },
        {
          title: 'Extended Session Login',
          description: 'Login with extended session duration',
          code: `curl -X POST "${baseUrl}/api/admin/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "password": "your_admin_password",
    "rememberMe": true,
    "metadata": {"source": "admin-dashboard"}
  }'`
        }
      ],
      errors: [
        { code: 401, description: 'Invalid admin password' },
        { code: 429, description: 'Too many failed authentication attempts' },
        { code: 423, description: 'Account temporarily locked due to failed attempts' }
      ],
      notes: [
        'Tokens expire after 1 hour (or 24 hours with rememberMe)',
        'Failed login attempts are tracked and rate-limited',
        'Sessions are automatically refreshed on activity',
        'Tokens include role-based permissions'
      ]
    },
    {
      name: 'Get All Links',
      method: 'GET',
      endpoint: '/api/admin/links',
      description: 'Retrieve all shortened URLs with full details, pagination, and filtering options.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        links: [
          {
            id: 1,
            short_code: 'abc123',
            original_url: 'https://example.com',
            clicks: 42,
            created_at: '2025-07-24T12:00:00.000Z',
            expires_at: '2025-08-23T12:00:00.000Z',
            is_active: true,
            custom_options: '{"password":true,"isPrivate":false}'
          }
        ],
        total: 1000,
        page: 1,
        limit: 50
      },
      icon: <Database className="h-5 w-5" />,
      examples: [
        {
          title: 'Get All Links',
          code: `curl -X GET "${baseUrl}/api/admin/links" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Admin Statistics',
      method: 'GET',
      endpoint: '/api/admin/stats',
      description: 'Get comprehensive admin-level statistics with enhanced metrics and system information.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        activeLinks: 950,
        expiredLinks: 50,
        privateLinks: 100,
        passwordProtectedLinks: 25,
        avgClicksPerLink: 50,
        linksToday: 25,
        clicksToday: 1200,
        topPerformers: [
          { short_code: 'abc123', clicks: 500 }
        ]
      },
      icon: <BarChart3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Admin Statistics',
          code: `curl -X GET "${baseUrl}/api/admin/stats" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Delete Link',
      method: 'DELETE',
      endpoint: '/api/admin/links/{id}',
      description: 'Permanently delete a shortened URL by its database ID.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        success: true,
        message: 'Link deleted successfully'
      },
      icon: <Trash2 className="h-5 w-5" />,
      examples: [
        {
          title: 'Delete a Link',
          code: `curl -X DELETE "${baseUrl}/api/admin/links/123" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Bulk Delete Links',
      method: 'DELETE',
      endpoint: '/api/admin/links/bulk',
      description: 'Delete multiple shortened URLs in a single operation.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      requestBody: {
        ids: [1, 2, 3, 4, 5]
      },
      response: {
        success: true,
        deletedCount: 5,
        message: '5 links deleted successfully'
      },
      icon: <Trash2 className="h-5 w-5" />,
      examples: [
        {
          title: 'Bulk Delete Links',
          code: `curl -X DELETE "${baseUrl}/api/admin/links/bulk" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"ids": [1, 2, 3, 4, 5]}'`
        }
      ]
    },
    {
      name: 'Toggle Link Status',
      method: 'PATCH',
      endpoint: '/api/admin/links/{id}/toggle',
      description: 'Enable or disable a shortened URL without deleting it.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        success: true,
        isActive: false,
        message: 'Link status updated'
      },
      icon: <Edit3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Toggle Link Status',
          code: `curl -X PATCH "${baseUrl}/api/admin/links/123/toggle" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Update Link',
      method: 'PATCH',
      endpoint: '/api/admin/links/{id}',
      description: 'Update properties of an existing shortened URL including URL, expiration, and options.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      requestBody: {
        original_url: 'https://newexample.com',
        expires_at: '2025-12-31T23:59:59.000Z',
        custom_options: {
          password: 'new_password',
          isPrivate: true,
          redirectDelay: 10
        }
      },
      response: {
        success: true,
        message: 'Link updated successfully',
        link: {
          id: 123,
          short_code: 'abc123',
          original_url: 'https://newexample.com',
          clicks: 42,
          updated_at: '2025-07-24T15:30:00.000Z'
        }
      },
      icon: <Edit3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Update Link',
          code: `curl -X PATCH "${baseUrl}/api/admin/links/123" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "original_url": "https://newexample.com",
    "custom_options": {
      "password": "new_password",
      "isPrivate": true
    }
  }'`
        }
      ]
    },
    {
      name: 'System Information',
      method: 'GET',
      endpoint: '/api/admin/system',
      description: 'Get detailed system information including server status, database info, and performance metrics.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        server: {
          uptime: 86400,
          nodeVersion: 'v18.17.0',
          platform: 'linux',
          memoryUsage: {
            rss: 45678912,
            heapTotal: 34567890,
            heapUsed: 23456789
          }
        },
        database: {
          size: '2.5 MB',
          tables: 3,
          totalRecords: 1050
        },
        performance: {
          avgResponseTime: 45,
          requestsPerMinute: 120
        }
      },
      icon: <Settings className="h-5 w-5" />,
      examples: [
        {
          title: 'Get System Info',
          code: `curl -X GET "${baseUrl}/api/admin/system" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Admin Analytics',
      method: 'GET',
      endpoint: '/api/admin/analytics',
      description: 'Get advanced analytics with detailed breakdowns, trends, and insights.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        overview: {
          totalLinks: 1000,
          totalClicks: 50000,
          averageClicksPerLink: 50,
          conversionRate: 0.85
        },
        trends: {
          dailyGrowth: 0.12,
          weeklyGrowth: 0.25,
          monthlyGrowth: 0.45
        },
        topPerformers: [
          {
            short_code: 'abc123',
            clicks: 500,
            original_url: 'https://example.com',
            ctr: 0.95
          }
        ],
        deviceBreakdown: {
          mobile: 0.65,
          desktop: 0.30,
          tablet: 0.05
        }
      },
      icon: <BarChart3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Admin Analytics',
          code: `curl -X GET "${baseUrl}/api/admin/analytics" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Export Data',
      method: 'GET',
      endpoint: '/api/admin/export/{type}',
      description: 'Export data in various formats (CSV, JSON) for backup or analysis purposes.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: 'File download with exported data in requested format',
      icon: <Download className="h-5 w-5" />,
      examples: [
        {
          title: 'Export Links as CSV',
          code: `curl -X GET "${baseUrl}/api/admin/export/links.csv" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o links_export.csv`
        },
        {
          title: 'Export Analytics as JSON',
          code: `curl -X GET "${baseUrl}/api/admin/export/analytics.json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o analytics_export.json`
        }
      ]
    },
    {
      name: 'Server Logs',
      method: 'GET',
      endpoint: '/api/admin/logs',
      description: 'Retrieve server logs with filtering and pagination for monitoring and debugging.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        logs: [
          {
            timestamp: '2025-07-24T12:00:00.000Z',
            level: 'INFO',
            message: 'GET /api/stats - 200 (5ms)',
            ip: '192.168.1.1'
          }
        ],
        total: 5000,
        page: 1,
        limit: 100
      },
      icon: <FileText className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Server Logs',
          code: `curl -X GET "${baseUrl}/api/admin/logs?page=1&limit=100" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Download Logs',
      method: 'GET',
      endpoint: '/api/admin/logs/download',
      description: 'Download complete server logs as a file for offline analysis.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: 'File download with complete log data',
      icon: <Download className="h-5 w-5" />,
      examples: [
        {
          title: 'Download Log File',
          code: `curl -X GET "${baseUrl}/api/admin/logs/download" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o server_logs.txt`
        }
      ]
    },
    {
      name: 'Privacy Settings',
      method: 'GET',
      endpoint: '/api/admin/privacy-settings',
      description: 'Get current privacy and GDPR compliance settings.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      response: {
        dataRetentionDays: 365,
        anonymizeAfterDays: 30,
        gdprCompliance: true,
        cookieConsent: true,
        dataProcessingBasis: 'legitimate_interest'
      },
      icon: <Shield className="h-5 w-5" />,
      examples: [
        {
          title: 'Get Privacy Settings',
          code: `curl -X GET "${baseUrl}/api/admin/privacy-settings" \\
  -H "Authorization: Bearer YOUR_TOKEN"`
        }
      ]
    },
    {
      name: 'Update Privacy Settings',
      method: 'POST',
      endpoint: '/api/admin/privacy-settings',
      description: 'Update privacy and GDPR compliance settings.',
      category: 'admin',
      authentication: 'Bearer token required',
      headers: ['Authorization: Bearer {token}'],
      requestBody: {
        dataRetentionDays: 365,
        anonymizeAfterDays: 30,
        gdprCompliance: true,
        cookieConsent: true
      },
      response: {
        success: true,
        message: 'Privacy settings updated successfully'
      },
      icon: <Shield className="h-5 w-5" />,
      examples: [
        {
          title: 'Update Privacy Settings',
          code: `curl -X POST "${baseUrl}/api/admin/privacy-settings" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataRetentionDays": 365,
    "anonymizeAfterDays": 30,
    "gdprCompliance": true
  }'`
        }
      ]
    },

    // GDPR API Endpoints
    {
      name: 'Request Personal Data',
      method: 'POST',
      endpoint: '/api/gdpr/my-data',
      description: 'Request all personal data associated with an IP address or identifier for GDPR compliance.',
      category: 'gdpr',
      limits: 'Rate limited: 1 request per hour per IP',
      requestBody: {
        identifier: '192.168.1.1', // IP address or user identifier
        email: 'user@example.com' // Optional: for verification
      },
      response: {
        success: true,
        message: 'Data request submitted. You will receive your data via email.',
        requestId: 'req_123456789'
      },
      icon: <Eye className="h-5 w-5" />,
      examples: [
        {
          title: 'Request Personal Data',
          code: `curl -X POST "${baseUrl}/api/gdpr/my-data" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "192.168.1.1",
    "email": "user@example.com"
  }'`
        }
      ]
    },
    {
      name: 'Delete Personal Data',
      method: 'DELETE',
      endpoint: '/api/gdpr/delete-my-data',
      description: 'Request deletion of all personal data for GDPR compliance.',
      category: 'gdpr',
      limits: 'Rate limited: 1 request per hour per IP',
      requestBody: {
        identifier: '192.168.1.1',
        email: 'user@example.com',
        confirmDeletion: true
      },
      response: {
        success: true,
        message: 'Data deletion request submitted and processed.',
        deletedRecords: 15
      },
      icon: <Trash2 className="h-5 w-5" />,
      examples: [
        {
          title: 'Delete Personal Data',
          code: `curl -X DELETE "${baseUrl}/api/gdpr/delete-my-data" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "192.168.1.1",
    "email": "user@example.com",
    "confirmDeletion": true
  }'`
        }
      ]
    },
    {
      name: 'Rectify Personal Data',
      method: 'PATCH',
      endpoint: '/api/gdpr/rectify-data',
      description: 'Request correction of personal data for GDPR compliance.',
      category: 'gdpr',
      limits: 'Rate limited: 1 request per hour per IP',
      requestBody: {
        identifier: '192.168.1.1',
        email: 'user@example.com',
        corrections: {
          newEmail: 'newemail@example.com'
        }
      },
      response: {
        success: true,
        message: 'Data rectification request submitted.',
        updatedRecords: 5
      },
      icon: <Edit3 className="h-5 w-5" />,
      examples: [
        {
          title: 'Rectify Personal Data',
          code: `curl -X PATCH "${baseUrl}/api/gdpr/rectify-data" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "192.168.1.1",
    "email": "user@example.com",
    "corrections": {
      "newEmail": "newemail@example.com"
    }
  }'`
        }
      ]
    },
    {
      name: 'Export Personal Data',
      method: 'POST',
      endpoint: '/api/gdpr/export-data',
      description: 'Export all personal data in a machine-readable format for data portability.',
      category: 'gdpr',
      limits: 'Rate limited: 1 request per hour per IP',
      requestBody: {
        identifier: '192.168.1.1',
        email: 'user@example.com',
        format: 'json' // or 'csv'
      },
      response: {
        success: true,
        message: 'Data export prepared. Download link sent to email.',
        exportId: 'exp_123456789'
      },
      icon: <Download className="h-5 w-5" />,
      examples: [
        {
          title: 'Export Personal Data',
          code: `curl -X POST "${baseUrl}/api/gdpr/export-data" \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "192.168.1.1",
    "email": "user@example.com",
    "format": "json"
  }'`
        }
      ]
    }
  ];

  const categories = [
    { id: 'overview', name: 'Overview', icon: <Book className="h-4 w-4" />, description: 'Getting started and features' },
    { id: 'public', name: 'Public API', icon: <Globe className="h-4 w-4" />, description: 'Publicly accessible endpoints' },
    { id: 'admin', name: 'Admin API', icon: <Shield className="h-4 w-4" />, description: 'Admin-only endpoints' }
  ];

  const filteredEndpoints = apiEndpoints.filter(endpoint => endpoint.category === selectedCategory);

  const CodeBlock: React.FC<{ code: string; language?: string; id: string }> = ({ code, language = 'bash', id }) => (
    <div className="relative bg-gray-900 rounded-lg p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copiedCode === id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copiedCode === id ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const JsonBlock: React.FC<{ data: any; title: string; id: string }> = ({ data, title, id }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <CodeBlock code={JSON.stringify(data, null, 2)} language="json" id={id} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary-100 p-3 rounded-xl">
              <Code className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-lg text-gray-600 mt-2">
                Complete reference for the Velink URL Shortener API
              </p>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Base URL</h3>
                  <p className="text-sm text-gray-600 font-mono">{baseUrl}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Book className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Version</h3>
                  <p className="text-sm text-gray-600">v1.0.0 (REST API)</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Authentication</h3>
                  <p className="text-sm text-gray-600">Bearer Token (Admin)</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Rate Limits</h3>
                  <p className="text-sm text-gray-600">500 req/day per IP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
                {selectedCategory === category.id && (
                  <div className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs">
                    {apiEndpoints.filter(e => e.category === category.id).length} endpoints
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                {categories.find(c => c.id === selectedCategory)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedCategory === 'overview' ? (
          <div className="space-y-12">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="bg-primary-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Server className="h-10 w-10 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to VeLink API</h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  VeLink provides a <strong>powerful, flexible, and secure</strong> URL shortening service with comprehensive analytics, 
                  advanced security features, and full GDPR compliance. Our RESTful API makes it incredibly easy to integrate 
                  URL shortening into any application, workflow, or automation system.
                </p>
              </div>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Production Ready</h3>
                  <p className="text-sm text-gray-600">Battle-tested API with 99.9% uptime and comprehensive error handling</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Developer Friendly</h3>
                  <p className="text-sm text-gray-600">Clear documentation, consistent responses, and multiple programming language examples</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Feature Rich</h3>
                  <p className="text-sm text-gray-600">Custom aliases, QR codes, analytics, password protection, and much more</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                    feature.highlight ? 'border-primary-200 bg-gradient-to-br from-primary-50 to-white' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className={`p-3 rounded-lg w-fit mb-4 ${
                    feature.highlight ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <div className={`${feature.highlight ? 'text-primary-600' : 'text-gray-600'}`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  {feature.highlight && (
                    <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Quick Start Guide</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get up and running with VeLink API in just a few minutes. Follow these simple steps to integrate URL shortening into your application.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {quickStartSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 h-full border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="bg-primary-100 p-2 rounded-lg">
                          {step.icon}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                      {step.code && (
                        <div className="mt-4">
                          <CodeBlock 
                            code={step.code} 
                            id={`quickstart-${step.step}`}
                          />
                        </div>
                      )}
                    </div>
                    {index < quickStartSteps.length - 1 && (
                      <div className="hidden xl:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <div className="w-6 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-primary-600 rounded-full"></div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Additional Help */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Need More Help?</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Check out our comprehensive examples section or browse the complete API reference for detailed information about each endpoint.
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedCategory('public')}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        View Public API
                      </button>
                      <button 
                        onClick={() => setSelectedCategory('admin')}
                        className="text-xs bg-white text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Admin Features
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Overview Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">API Overview</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Comprehensive API with {apiEndpoints.length} endpoints across {categories.length - 1} categories, 
                  designed to handle everything from simple URL shortening to enterprise-level analytics and administration.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center group hover:bg-blue-50 p-4 rounded-lg transition-colors">
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Server className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{apiEndpoints.filter(e => e.category === 'public').length}</div>
                  <div className="text-sm text-gray-600 font-medium">Public Endpoints</div>
                  <div className="text-xs text-gray-500 mt-1">No auth required</div>
                </div>
                <div className="text-center group hover:bg-amber-50 p-4 rounded-lg transition-colors">
                  <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Shield className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{apiEndpoints.filter(e => e.category === 'admin').length}</div>
                  <div className="text-sm text-gray-600 font-medium">Admin Endpoints</div>
                  <div className="text-xs text-gray-500 mt-1">Token required</div>
                </div>
                <div className="text-center group hover:bg-green-50 p-4 rounded-lg transition-colors">
                  <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{apiEndpoints.filter(e => e.category === 'gdpr').length}</div>
                  <div className="text-sm text-gray-600 font-medium">GDPR Endpoints</div>
                  <div className="text-xs text-gray-500 mt-1">Privacy compliant</div>
                </div>
                <div className="text-center group hover:bg-purple-50 p-4 rounded-lg transition-colors">
                  <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Code className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{apiEndpoints.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Endpoints</div>
                  <div className="text-xs text-gray-500 mt-1">All categories</div>
                </div>
              </div>
              
              {/* API Capabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-600" />
                    Core Capabilities
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      URL shortening with custom aliases
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Real-time click analytics & tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      QR code generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Password protection & expiration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bulk operations & management
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Enterprise Features
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced admin dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Comprehensive system monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Data export & backup
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      GDPR compliance tools
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Rate limiting & security
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Authentication Guide */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Guide</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  VeLink uses a two-tier authentication system: <strong>public endpoints</strong> for basic operations 
                  and <strong>JWT-based authentication</strong> for admin and sensitive operations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Public Endpoints
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Most VeLink features are available without authentication, making it perfect for quick integrations 
                    and public-facing applications. These endpoints include URL shortening, analytics, and basic information retrieval.
                  </p>
                  <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">✅ What you get:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• No authentication required</li>
                      <li>• Rate limited by IP address (500 req/day)</li>
                      <li>• CORS enabled for web applications</li>
                      <li>• Immediate access to core features</li>
                      <li>• Perfect for prototypes and public apps</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 p-3 rounded text-xs font-mono">
                    curl -X POST {baseUrl}/api/shorten \\<br/>
                    &nbsp;&nbsp;-H "Content-Type: application/json" \\<br/>
                    &nbsp;&nbsp;-d '&#123;"url": "https://example.com"&#125;'
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    Admin Endpoints
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Admin features require JWT authentication for security. First authenticate with your admin password 
                    to receive a token, then include it in subsequent requests for full platform access.
                  </p>
                  <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">🔒 Advanced features:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Bearer token authentication (JWT)</li>
                      <li>• Tokens expire after 1 hour by default</li>
                      <li>• Auto-refresh on activity</li>
                      <li>• Full CRUD operations</li>
                      <li>• System monitoring and logs</li>
                    </ul>
                  </div>
                  <div className="bg-amber-100 p-3 rounded text-xs font-mono">
                    curl -X GET {baseUrl}/api/admin/links \\<br/>
                    &nbsp;&nbsp;-H "Authorization: Bearer YOUR_JWT_TOKEN"
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-blue-600" />
                  Complete Authentication Flow Example
                </h4>
                <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-green-400 mb-2"># Step 1: Login to get authentication token</div>
                      <CodeBlock 
                        code={`curl -X POST "${baseUrl}/api/admin/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"password": "your_admin_password"}'

# Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "expiresAt": "2025-07-24T13:00:00.000Z"
}`}
                        id="auth-step-1"
                      />
                    </div>
                    <div>
                      <div className="text-green-400 mb-2"># Step 2: Use token for authenticated requests</div>
                      <CodeBlock 
                        code={`# Export token for convenience
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Now you can access admin endpoints
curl -X GET "${baseUrl}/api/admin/links" \\
  -H "Authorization: Bearer $TOKEN"

curl -X DELETE "${baseUrl}/api/admin/links/123" \\
  -H "Authorization: Bearer $TOKEN"`}
                        id="auth-step-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Best Practices */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Best Practices
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h5 className="font-medium mb-2">🔐 Token Management</h5>
                    <ul className="space-y-1">
                      <li>• Store tokens securely (never in localStorage for production)</li>
                      <li>• Implement automatic token refresh</li>
                      <li>• Handle token expiration gracefully</li>
                      <li>• Use HTTPS in production environments</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">⚡ Rate Limiting</h5>
                    <ul className="space-y-1">
                      <li>• Public endpoints: 500 requests/day per IP</li>
                      <li>• Admin endpoints: Higher limits with authentication</li>
                      <li>• Implement exponential backoff for failed requests</li>
                      <li>• Monitor rate limit headers in responses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Limiting & Best Practices */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Rate Limiting & Best Practices</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  VeLink implements intelligent rate limiting to ensure fair usage and optimal performance for all users. 
                  Follow these guidelines to build robust and efficient integrations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Current Rate Limits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div>
                        <span className="text-sm font-medium text-blue-900">URL Creation</span>
                        <div className="text-xs text-blue-600">POST /api/shorten</div>
                      </div>
                      <span className="text-sm text-blue-700 font-mono bg-white px-2 py-1 rounded">1 req/0.5s per IP</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div>
                        <span className="text-sm font-medium text-green-900">Daily Limit</span>
                        <div className="text-xs text-green-600">All public endpoints</div>
                      </div>
                      <span className="text-sm text-green-700 font-mono bg-white px-2 py-1 rounded">500 links per IP</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div>
                        <span className="text-sm font-medium text-purple-900">Analytics</span>
                        <div className="text-xs text-purple-600">GET /api/analytics/*</div>
                      </div>
                      <span className="text-sm text-purple-700 font-mono bg-white px-2 py-1 rounded">100 req/min per IP</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                      <div>
                        <span className="text-sm font-medium text-amber-900">Admin Operations</span>
                        <div className="text-xs text-amber-600">All admin endpoints</div>
                      </div>
                      <span className="text-sm text-amber-700 font-mono bg-white px-2 py-1 rounded">1000 req/hour</span>
                    </div>
                  </div>
                  
                  {/* Rate Limit Headers */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Response Headers</h4>
                    <div className="text-xs font-mono text-gray-700 space-y-1">
                      <div>X-RateLimit-Limit: 500</div>
                      <div>X-RateLimit-Remaining: 487</div>
                      <div>X-RateLimit-Reset: 1643097600</div>
                      <div>X-RateLimit-Window: 86400</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Best Practices
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                      <h4 className="font-medium text-green-900 mb-2">✅ Recommended Approaches</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Implement exponential backoff for failed requests
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Cache responses when appropriate (especially analytics)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Use batch operations for multiple URLs when possible
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Monitor rate limit headers in responses
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          Consider webhooks for real-time updates
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <h4 className="font-medium text-red-900 mb-2">❌ Common Mistakes</h4>
                      <ul className="space-y-2 text-sm text-red-800">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          Polling analytics endpoints too frequently
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          Not handling 429 (Too Many Requests) responses
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          Making individual requests for bulk operations
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          Ignoring rate limit headers in responses
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SDK and Integration Examples */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Integration Examples</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Ready-to-use examples for popular programming languages and frameworks to help you get started quickly.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    React/Next.js Integration
                  </h3>
                  <CodeBlock 
                    code={`import { useState, useCallback } from 'react';

export function useVeLink() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const shortenUrl = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('${baseUrl}/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, ...options })
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { shortenUrl, loading, error };
}

// Usage in component:
function UrlShortener() {
  const { shortenUrl, loading, error } = useVeLink();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await shortenUrl(url, {
        customAlias: 'my-link',
        expiresIn: '30d'
      });
      setResult(data);
    } catch (error) {
      console.error('Failed to shorten URL:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to shorten"
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
      {error && <p className="error">{error}</p>}
      {result && (
        <div>
          <p>Short URL: <a href={result.shortUrl}>{result.shortUrl}</a></p>
          <p>Clicks: {result.clicks}</p>
        </div>
      )}
    </form>
  );
}`}
                    id="react-integration"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-600" />
                    Node.js/Express Integration
                  </h3>
                  <CodeBlock 
                    code={`const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

class VeLinkService {
  constructor() {
    this.baseUrl = '${baseUrl}';
    this.adminToken = null;
  }
  
  async authenticate(password) {
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/admin/verify\`, {
        password
      });
      this.adminToken = response.data.token;
      return response.data;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }
  
  async shortenUrl(url, options = {}) {
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/shorten\`, {
        url,
        ...options
      });
      return response.data;
    } catch (error) {
      throw new Error(\`Failed to shorten URL: \${error.message}\`);
    }
  }
  
  async getAnalytics(shortCode) {
    try {
      const response = await axios.get(
        \`\${this.baseUrl}/api/analytics/\${shortCode}\`
      );
      return response.data;
    } catch (error) {
      throw new Error(\`Failed to get analytics: \${error.message}\`);
    }
  }
  
  async getAllLinks() {
    if (!this.adminToken) {
      throw new Error('Admin authentication required');
    }
    
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/links\`, {
        headers: { Authorization: \`Bearer \${this.adminToken}\` }
      });
      return response.data;
    } catch (error) {
      throw new Error(\`Failed to get links: \${error.message}\`);
    }
  }
}

const velink = new VeLinkService();

// Routes
app.post('/shorten', async (req, res) => {
  try {
    const { url, ...options } = req.body;
    const result = await velink.shortenUrl(url, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const analytics = await velink.getAnalytics(shortCode);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
                    id="node-integration"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // API Endpoints for other categories
          <div className="space-y-8">
            {filteredEndpoints.map((endpoint, index) => (
              <motion.div
                key={`${endpoint.method}-${endpoint.endpoint}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {endpoint.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{endpoint.name}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          endpoint.method === 'PATCH' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {endpoint.method}
                        </span>
                        {endpoint.complexity && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            endpoint.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                            endpoint.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {endpoint.complexity}
                          </span>
                        )}
                        {endpoint.version && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            v{endpoint.version}
                          </span>
                        )}
                      </div>
                      <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded text-gray-800">
                        {endpoint.endpoint}
                      </code>
                      <p className="text-gray-600 mt-3">{endpoint.description}</p>
                      {endpoint.longDescription && (
                        <p className="text-gray-500 text-sm mt-2">{endpoint.longDescription}</p>
                      )}
                      
                      {endpoint.authentication && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                          <Lock className="h-4 w-4" />
                          {endpoint.authentication}
                        </div>
                      )}
                      
                      {endpoint.limits && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                          <Clock className="h-4 w-4" />
                          {endpoint.limits}
                        </div>
                      )}

                      {endpoint.tags && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {endpoint.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {endpoint.headers && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Required Headers</h4>
                      <div className="space-y-1">
                        {endpoint.headers.map((header, idx) => (
                          <code key={idx} className="block text-sm bg-gray-100 px-3 py-1 rounded text-gray-800">
                            {header}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {endpoint.requestBody && (
                      <JsonBlock 
                        data={endpoint.requestBody} 
                        title="Request Body" 
                        id={`${endpoint.method}-${endpoint.endpoint}-request`} 
                      />
                    )}
                    
                    {endpoint.response && (
                      <JsonBlock 
                        data={endpoint.response} 
                        title="Response" 
                        id={`${endpoint.method}-${endpoint.endpoint}-response`} 
                      />
                    )}
                  </div>

                  {endpoint.examples && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Examples</h4>
                      <div className="space-y-4">
                        {endpoint.examples.map((example, idx) => (
                          <div key={idx}>
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-sm font-medium text-gray-600">{example.title}</h5>
                              {example.description && (
                                <span className="text-xs text-gray-500">- {example.description}</span>
                              )}
                            </div>
                            <CodeBlock 
                              code={example.code} 
                              id={`${endpoint.method}-${endpoint.endpoint}-example-${idx}`} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {endpoint.errors && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Error Codes</h4>
                      <div className="space-y-2">
                        {endpoint.errors.map((error, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <span className="px-2 py-1 text-xs font-mono bg-red-100 text-red-800 rounded">
                              {error.code}
                            </span>
                            <span className="text-sm text-red-700">{error.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {endpoint.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Important Notes</h4>
                      <ul className="space-y-1">
                        {endpoint.notes.map((note, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              This documentation covers all available API endpoints. For additional support or questions, 
              please check our GitHub repository or contact the development team.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/Velyzo/velink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub Repository
              </a>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
