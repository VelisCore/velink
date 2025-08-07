import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Server, 
  Shield, 
  Globe,
  Copy,
  Check,
  AlertCircle,
  Info,
  Play,
  ExternalLink,
  Code,
  Book,
  Zap,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  endpoint: string;
  description: string;
  requestBody?: any;
  responseExample?: any;
  headers?: string[];
  authentication?: string;
  category: string;
}

interface TabContent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:80' : 'https://velink.me';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const tabs: TabContent[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: <Book className="h-5 w-5" />,
      description: 'Getting started with Velink API'
    },
    {
      id: 'public',
      name: 'Public API',
      icon: <Globe className="h-5 w-5" />,
      description: 'Public endpoints that require no authentication'
    },
    {
      id: 'admin',
      name: 'Admin API',
      icon: <Shield className="h-5 w-5" />,
      description: 'Admin endpoints that require authentication'
    },
    {
      id: 'system',
      name: 'System',
      icon: <Server className="h-5 w-5" />,
      description: 'System endpoints for health checks, redirects, and static files'
    },
    {
      id: 'mobile',
      name: 'Mobile API',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Third-party mobile app development endpoints - Velink provides these routes for developers to create mobile applications'
    },
    {
      id: 'examples',
      name: 'Code Examples',
      icon: <Code className="h-5 w-5" />,
      description: 'Integration examples and SDKs'
    }
  ];

  const apiEndpoints: ApiEndpoint[] = [
    // =============== PUBLIC API ENDPOINTS ===============
    {
      id: 'shorten-url',
      name: 'Shorten URL',
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Create a new shortened URL from a long URL. This is the core functionality of Velink. Accepts any valid HTTP/HTTPS URL and returns a short code that can be used to redirect users. Optional expiration time can be set (e.g., "30d" for 30 days, "1h" for 1 hour). Rate limited to prevent abuse.',
      category: 'public',
      requestBody: {
        url: 'https://example.com/very-long-url-to-shorten',
        expiresIn: '30d'
      },
      responseExample: {
        success: true,
        shortCode: 'abc123',
        shortUrl: 'https://velink.me/abc123',
        originalUrl: 'https://example.com/very-long-url-to-shorten',
        qrCode: 'https://velink.me/qr/abc123'
      }
    },
    {
      id: 'batch-shorten',
      name: 'Batch Shorten URLs',
      method: 'POST',
      endpoint: '/api/batch-shorten',
      description: 'Create multiple shortened URLs at once for bulk operations. Accepts an array of URLs and processes them in a single request. Each URL is validated and shortened individually. Failed URLs are reported in the response. Rate limited with daily limits per IP address to prevent abuse. Perfect for content creators or marketers who need to shorten many links.',
      category: 'public',
      requestBody: {
        urls: [
          'https://example.com/page1',
          'https://example.com/page2',
          'https://github.com/your-repo'
        ],
        expiresIn: '30d'
      },
      responseExample: {
        success: true,
        results: [
          {
            originalUrl: 'https://example.com/page1',
            shortCode: 'abc123',
            shortUrl: 'https://velink.me/abc123'
          }
        ]
      }
    },
    {
      id: 'verify-password',
      name: 'Verify Link Password',
      method: 'POST',
      endpoint: '/api/verify-password/:shortCode',
      description: 'Verify the password for a password-protected shortened link. When a link is created with password protection, users must provide the correct password before being redirected. This endpoint validates the password and returns verification status. Used by the frontend when users encounter password-protected links.',
      category: 'public',
      requestBody: {
        password: 'link-password'
      },
      responseExample: {
        success: true,
        message: 'Password verified',
        shortCode: 'abc123'
      }
    },
    {
      id: 'check-password',
      name: 'Check Password Required',
      method: 'POST',
      endpoint: '/api/check-password',
      description: 'Check if a shortened URL requires a password before access. This endpoint allows you to determine whether a link has password protection enabled without attempting to access it. Returns a boolean indicating if a password is required. Useful for frontend applications to show appropriate UI elements.',
      category: 'public',
      requestBody: {
        shortCode: 'abc123'
      },
      responseExample: {
        requiresPassword: true,
        shortCode: 'abc123'
      }
    },
    {
      id: 'get-link-info',
      name: 'Get Link Information',
      method: 'GET',
      endpoint: '/api/info/:shortCode',
      description: 'Retrieve detailed information about a specific shortened URL including original URL, creation date, click count, and metadata. Does not increment the click counter - this is purely informational. Useful for link previews, analytics dashboards, or verifying link details before sharing.',
      category: 'public',
      responseExample: {
        success: true,
        shortCode: 'abc123',
        originalUrl: 'https://example.com/page',
        clicks: 42,
        createdAt: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'get-stats',
      name: 'Get Global Statistics',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Retrieve global platform statistics including total number of links created, total clicks across all links, daily counts, and other aggregate metrics. This is public data that showcases platform usage and can be used for marketing or informational purposes. Updated in real-time.',
      category: 'public',
      responseExample: {
        totalLinks: 1250,
        totalClicks: 8765,
        linksToday: 42,
        clicksToday: 156
      }
    },
    {
      id: 'get-detailed-stats',
      name: 'Get Detailed Statistics',
      method: 'GET',
      endpoint: '/api/stats/detailed',
      description: 'Get comprehensive platform statistics with additional metrics including monthly trends, geographic distribution, browser statistics, referrer data, and recent activity logs. More detailed than the basic stats endpoint, providing insights for analytics and business intelligence.',
      category: 'public',
      responseExample: {
        totalLinks: 1250,
        totalClicks: 8765,
        clicksThisMonth: 5432,
        topCountries: [],
        browserStats: {},
        recentActivity: []
      }
    },
    {
      id: 'track-click',
      name: 'Track Link Click',
      method: 'POST',
      endpoint: '/api/track/:shortCode',
      description: 'Track analytics data for a link click. This endpoint records visitor information including user agent, referrer, and geographical data for analytics purposes. Used internally when users click on shortened links.',
      category: 'public',
      requestBody: {
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://google.com',
        country: 'US'
      },
      responseExample: {
        success: true,
        tracked: true
      }
    },

    // =============== SYSTEM & HEALTH ENDPOINTS ===============
    {
      id: 'health-check',
      name: 'System Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Basic system health check endpoint',
      category: 'system',
      responseExample: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 86400
      }
    },
    {
      id: 'robots-txt',
      name: 'Robots.txt',
      method: 'GET',
      endpoint: '/robots.txt',
      description: 'Provides the robots.txt file for web crawler guidance and search engine optimization. This endpoint serves standardized directives for web crawlers including allowed and disallowed paths, crawl delays, and sitemap references. Essential for SEO management, crawler control, and search engine visibility while protecting sensitive admin areas from indexing.',
      category: 'system',
      responseExample: 'User-agent: *\nDisallow: /admin/'
    },
    {
      id: 'sitemap-xml',
      name: 'XML Sitemap',
      method: 'GET',
      endpoint: '/sitemap.xml',
      description: 'Provides the XML sitemap for search engine indexing and SEO optimization. This endpoint generates a comprehensive sitemap containing all publicly accessible pages and shortened URLs for search engine crawlers. Essential for search engine visibility, content discovery, and maintaining optimal SEO performance with automatic updates and proper XML formatting.',
      category: 'system',
      responseExample: '<?xml version="1.0" encoding="UTF-8"?>...'
    },
    {
      id: 'qr-code',
      name: 'QR Code Generator',
      method: 'GET',
      endpoint: '/qr/:shortCode',
      description: 'Generates QR codes for shortened URLs enabling easy mobile sharing and offline-to-online bridge functionality. This endpoint creates high-quality QR code images that encode the short URL for convenient scanning with mobile devices. Essential for mobile marketing, offline promotions, and seamless link sharing with customizable size and error correction levels.',
      category: 'system',
      responseExample: 'PNG image data'
    },

    // =============== ADMIN AUTHENTICATION ===============
    {
      id: 'admin-verify',
      name: 'Verify Admin Token',
      method: 'POST',
      endpoint: '/api/admin/verify',
      description: 'Verify the validity of an admin authentication token. This endpoint checks if the provided token is valid and grants admin privileges. Required for all admin operations. Tokens can expire and need to be refreshed. Essential for maintaining secure admin sessions.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        token: 'your-admin-token'
      },
      responseExample: {
        success: true,
        message: 'Token verified'
      }
    },

    // =============== ADMIN LINK MANAGEMENT ===============
    {
      id: 'admin-get-links',
      name: 'Get All Links',
      method: 'GET',
      endpoint: '/api/admin/links',
      description: 'Retrieve all shortened links in the system with comprehensive details including click counts, creation dates, expiration times, and activity status. Supports pagination for large datasets. Essential for link management and analytics. Provides complete overview of platform usage.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        links: [
          {
            id: 1,
            shortCode: 'abc123',
            originalUrl: 'https://example.com',
            clicks: 42,
            createdAt: '2024-01-15T10:30:00Z',
            isActive: true
          }
        ],
        totalCount: 1250,
        currentPage: 1
      }
    },
    {
      id: 'admin-delete-link',
      name: 'Delete Link by ID',
      method: 'DELETE',
      endpoint: '/api/admin/links/:id',
      description: 'Permanently delete a specific shortened link using its database ID. This action is irreversible and will break any existing references to the link. Useful for removing spam, inappropriate content, or expired promotional links. Includes audit logging for security.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        message: 'Link deleted successfully'
      }
    },
    {
      id: 'admin-bulk-delete',
      name: 'Bulk Delete Links',
      method: 'DELETE',
      endpoint: '/api/admin/links/bulk',
      description: 'Delete multiple shortened links simultaneously using their database IDs. Efficient for content moderation, cleanup operations, or removing batches of expired links. Includes transaction support to ensure data consistency. Returns detailed results for each deletion attempt.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        linkIds: [1, 2, 3, 4, 5]
      },
      responseExample: {
        success: true,
        deleted: 5,
        message: '5 links deleted successfully'
      }
    },
    {
      id: 'admin-toggle-link',
      name: 'Toggle Link Status',
      method: 'PATCH',
      endpoint: '/api/admin/links/:id/toggle',
      description: 'Toggle a link between active and inactive status without permanently deleting it. Inactive links will return a 404 error when accessed but remain in the database for potential reactivation. Useful for temporarily disabling problematic links or conducting maintenance.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        newStatus: 'inactive',
        message: 'Link status updated'
      }
    },
    {
      id: 'admin-update-link',
      name: 'Update Link Details',
      method: 'PATCH',
      endpoint: '/api/admin/links/:id',
      description: 'Update link details such as original URL or expiration',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        originalUrl: 'https://new-example.com',
        expiresAt: '2024-12-31T23:59:59Z'
      },
      responseExample: {
        success: true,
        message: 'Link updated successfully',
        link: {
          id: 1,
          shortCode: 'abc123',
          originalUrl: 'https://new-example.com'
        }
      }
    },

    // =============== ADMIN STATISTICS & ANALYTICS ===============
    {
      id: 'admin-stats',
      name: 'Get Admin Statistics',
      method: 'GET',
      endpoint: '/api/admin/stats',
      description: 'Get detailed admin statistics and analytics',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        totalLinks: 1250,
        totalClicks: 8765,
        activeLinks: 1200,
        topLinks: [],
        recentActivity: [],
        clicksByDay: {},
        browserStats: {},
        countryStats: {}
      }
    },
    {
      id: 'admin-link-analytics',
      name: 'Get Link Analytics',
      method: 'GET',
      endpoint: '/api/admin/analytics/:shortCode',
      description: 'Get detailed analytics for a specific link',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        shortCode: 'abc123',
        totalClicks: 156,
        uniqueClicks: 98,
        clicksByDate: {},
        referrers: {},
        countries: {},
        browsers: {},
        operatingSystems: {}
      }
    },

    // =============== ADMIN SYSTEM MANAGEMENT ===============
    {
      id: 'admin-system-info',
      name: 'Get System Information',
      method: 'GET',
      endpoint: '/api/admin/system/info',
      description: 'Retrieves comprehensive system information including version details, resource usage metrics, and operational statistics. This endpoint provides administrators with essential data for monitoring system performance, tracking resource consumption, and planning capacity. The response includes current memory usage, disk space allocation, database size, Node.js version, and system uptime for complete operational visibility.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        version: '1.2.3',
        uptime: '5 days, 12 hours',
        memoryUsage: {
          used: '256MB',
          total: '512MB',
          percentage: 50
        },
        diskSpace: {
          used: '2.5GB',
          free: '15GB',
          total: '17.5GB'
        },
        databaseSize: '45MB',
        nodeVersion: 'v18.17.0'
      }
    },
    {
      id: 'admin-system-health',
      name: 'Get System Health',
      method: 'GET',
      endpoint: '/api/admin/system/health',
      description: 'Provides real-time system health monitoring with comprehensive status checks across all critical services and components. This endpoint evaluates database connectivity, web server status, file system health, and overall system performance metrics. Essential for automated monitoring, alerting systems, and ensuring service reliability. Returns detailed performance metrics including response times, error rates, and throughput statistics for proactive system management.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        status: 'healthy',
        uptime: '5 days, 12 hours',
        services: {
          database: 'healthy',
          webServer: 'healthy',
          fileSystem: 'healthy'
        },
        metrics: {
          responseTime: '45ms',
          errorRate: '0.01%',
          throughput: '150 req/min'
        }
      }
    },
    {
      id: 'admin-maintenance',
      name: 'Toggle Maintenance Mode',
      method: 'POST',
      endpoint: '/api/admin/maintenance',
      description: 'Controls system-wide maintenance mode to temporarily disable public access during updates, maintenance, or emergency situations. When enabled, all public endpoints return maintenance notices while admin functions remain accessible. Supports custom maintenance messages for user communication and ensures graceful service interruption with proper status codes and user-friendly error pages.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        enabled: true,
        message: 'System maintenance in progress'
      },
      responseExample: {
        success: true,
        maintenanceMode: true,
        message: 'Maintenance mode enabled'
      }
    },

    // =============== ADMIN UPDATE SYSTEM ===============
    {
      id: 'admin-update-check',
      name: 'Check for Updates',
      method: 'GET',
      endpoint: '/api/admin/update/check',
      description: 'Checks for available system updates by comparing the current version against the latest release version. This endpoint connects to update repositories, validates version compatibility, and retrieves release information including change logs and update notes. Essential for maintaining system security and accessing new features. Provides detailed version comparison and update availability status for informed upgrade decisions.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        updateAvailable: true,
        currentVersion: '1.2.3',
        latestVersion: '1.3.0',
        releaseNotes: 'Bug fixes and performance improvements',
        lastCheck: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'admin-update-status',
      name: 'Get Update Status',
      method: 'GET',
      endpoint: '/api/admin/update/status',
      description: 'Provides real-time monitoring of ongoing update processes with detailed progress tracking and status information. This endpoint returns current update step, completion percentage, estimated time remaining, and any encountered issues. Critical for monitoring long-running update operations and providing administrators with visibility into update progress. Supports automated monitoring and progress reporting during system upgrades.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        isUpdating: true,
        progress: 45,
        currentStep: 'Installing dependencies',
        totalSteps: 7,
        stepProgress: {
          step: 3,
          name: 'Installing dependencies',
          status: 'running',
          progress: 65
        },
        estimatedTimeRemaining: 120
      }
    },
    {
      id: 'admin-update-perform',
      name: 'Start System Update',
      method: 'POST',
      endpoint: '/api/admin/update/perform',
      description: 'Initiates a comprehensive system update process with configurable options for backup creation, service management, and dependency handling. This endpoint orchestrates the entire update workflow including automatic backup creation, dependency installation, database migrations, and service restarts. Supports selective update branches, maintenance mode activation, and rollback preparation for safe system upgrades.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        createBackup: true,
        restartServices: true,
        skipDependencyCheck: false,
        updateBranch: 'main',
        maintenanceMode: true
      },
      responseExample: {
        success: true,
        message: 'Update process initiated',
        updateId: 'upd_1234567890',
        estimatedDuration: 300,
        maintenanceModeEnabled: true
      }
    },
    {
      id: 'admin-update-cancel',
      name: 'Cancel Update Process',
      method: 'POST',
      endpoint: '/api/admin/update/cancel',
      description: 'Safely cancels an ongoing update process and optionally restores the system from the most recent backup. This endpoint handles graceful termination of update operations, rollback procedures, and system state restoration. Includes automatic service restoration, maintenance mode disabling, and data integrity verification to ensure stable system operation after cancellation.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        reason: 'User cancelled',
        restoreFromBackup: true
      },
      responseExample: {
        success: true,
        message: 'Update process cancelled successfully',
        restoredFromBackup: true,
        maintenanceModeDisabled: true
      }
    },
    {
      id: 'admin-update-backup',
      name: 'Create System Backup',
      method: 'POST',
      endpoint: '/api/admin/update/backup',
      description: 'Creates a comprehensive manual backup of the current system state including database, configuration files, and optionally log files. This endpoint generates compressed backup archives with metadata for easy identification and restoration. Supports selective backup components, custom naming, and automatic size optimization for efficient storage management and quick recovery operations.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        name: 'manual-backup-2024-01-15',
        includeDatabase: true,
        includeLogs: false,
        description: 'Manual backup before major changes'
      },
      responseExample: {
        success: true,
        backupId: 'backup_1234567890',
        backupPath: '/backups/manual-backup-2024-01-15.tar.gz',
        size: '45.2MB',
        created: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'admin-update-restore',
      name: 'Restore from Backup',
      method: 'POST',
      endpoint: '/api/admin/update/restore',
      description: 'Restores the system to a previous state using a specified backup archive with configurable restoration options. This endpoint handles complete system rollback including database restoration, configuration file replacement, and service management. Supports selective restoration components, automatic service restart, and maintenance mode coordination for safe system recovery operations.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        backupId: 'backup_1234567890',
        restoreDatabase: true,
        restartServices: true,
        maintenanceMode: true
      },
      responseExample: {
        success: true,
        message: 'System restored successfully from backup',
        restoredVersion: '1.2.3',
        restoredAt: '2024-01-15T10:30:00Z',
        servicesRestarted: true
      }
    },
    {
      id: 'admin-update-backups',
      name: 'List Available Backups',
      method: 'GET',
      endpoint: '/api/admin/update/backups',
      description: 'Retrieves a comprehensive list of all available system backups with detailed metadata including creation dates, sizes, versions, and backup types. This endpoint provides administrators with complete backup inventory for restoration planning, storage management, and backup retention policies. Includes automatic and manual backup classifications for efficient backup lifecycle management.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        backups: [
          {
            id: 'backup_1234567890',
            name: 'manual-backup-2024-01-15',
            version: '1.2.3',
            size: '45.2MB',
            created: '2024-01-15T10:30:00Z',
            type: 'manual',
            description: 'Manual backup before major changes'
          },
          {
            id: 'backup_0987654321',
            name: 'auto-backup-2024-01-14',
            version: '1.2.2',
            size: '44.8MB',
            created: '2024-01-14T02:00:00Z',
            type: 'automatic',
            description: 'Automatic daily backup'
          }
        ],
        totalBackups: 2,
        totalSize: '90.0MB'
      }
    },
    {
      id: 'admin-maintenance-mode',
      name: 'Toggle Maintenance Mode',
      method: 'POST',
      endpoint: '/api/admin/maintenance',
      description: 'Enable or disable maintenance mode for system updates',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        enabled: true,
        message: 'System maintenance in progress. Please try again later.',
        estimatedDuration: 600,
        allowAdminAccess: true
      },
      responseExample: {
        success: true,
        maintenanceMode: true,
        message: 'Maintenance mode enabled successfully',
        enabledAt: '2024-01-15T10:30:00Z',
        estimatedCompletion: '2024-01-15T10:40:00Z'
      }
    },
    {
      id: 'admin-system-health',
      name: 'Get System Health',
      method: 'GET',
      endpoint: '/api/admin/system/health',
      description: 'Get comprehensive system health and performance metrics',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        status: 'healthy',
        uptime: '5 days, 12 hours, 34 minutes',
        version: '1.2.3',
        environment: 'production',
        system: {
          os: 'Ubuntu 22.04 LTS',
          node: '18.17.0',
          memory: {
            used: '256MB',
            total: '2GB',
            percentage: 12.5
          },
          cpu: {
            usage: 15.2,
            cores: 4
          },
          disk: {
            used: '5.2GB',
            total: '20GB',
            available: '14.8GB',
            percentage: 26
          }
        },
        services: {
          database: 'running',
          webServer: 'running',
          scheduler: 'running'
        },
        lastUpdate: '2024-01-10T08:00:00Z',
        nextScheduledMaintenance: '2024-01-20T02:00:00Z'
      }
    },

    // =============== ADMIN DATABASE MANAGEMENT ===============
    {
      id: 'admin-databases-list',
      name: 'List Database Backups',
      method: 'GET',
      endpoint: '/api/admin/databases',
      description: 'Retrieves a comprehensive inventory of all database backup files with detailed metadata including creation timestamps, file sizes, backup types, and storage locations. This endpoint provides administrators with complete backup visibility for database recovery planning, storage optimization, and backup retention management. Essential for database disaster recovery and data protection strategies.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        backups: [
          {
            id: 'db_backup_001',
            name: 'daily-backup-2024-01-15',
            size: '25MB',
            createdAt: '2024-01-15T03:00:00Z',
            type: 'automatic'
          }
        ],
        totalBackups: 15,
        totalSize: '375MB'
      }
    },
    {
      id: 'admin-db-backup',
      name: 'Create Database Backup',
      method: 'POST',
      endpoint: '/api/admin/databases/backup',
      description: 'Creates a comprehensive database backup with configurable options for compression, data inclusion, and backup naming. This endpoint generates complete database snapshots including link data, analytics information, user settings, and system configurations. Supports automatic compression for storage efficiency and selective data inclusion for customized backup strategies.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        name: 'manual-backup',
        compress: true,
        includeAnalytics: true
      },
      responseExample: {
        success: true,
        backupId: 'db_backup_002',
        backupPath: '/backups/db/manual-backup.db',
        size: '28MB',
        duration: '15s'
      }
    },
    {
      id: 'admin-db-restore',
      name: 'Restore Database',
      method: 'POST',
      endpoint: '/api/admin/databases/restore/:backupId',
      description: 'Restores the database from a specified backup file with comprehensive data recovery and validation. This endpoint handles complete database restoration including all link records, analytics data, user configurations, and system settings. Includes automatic data integrity verification, foreign key constraint validation, and rollback capabilities for safe database recovery operations.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        confirmRestore: true
      },
      responseExample: {
        success: true,
        message: 'Database restored successfully',
        restoredFrom: 'db_backup_001',
        restoreTime: '45s'
      }
    },
    {
      id: 'admin-db-delete',
      name: 'Delete Database Backup',
      method: 'DELETE',
      endpoint: '/api/admin/databases/:backupId',
      description: 'Permanently removes a specific database backup file from storage with confirmation requirements and safety checks. This endpoint includes validation to prevent deletion of critical backups, confirmation mechanisms to avoid accidental deletion, and automatic storage space reclamation. Essential for backup retention management and storage optimization while maintaining data protection policies.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        message: 'Database backup deleted',
        deletedBackupId: 'db_backup_001'
      }
    },
    {
      id: 'admin-db-download',
      name: 'Download Database Backup',
      method: 'GET',
      endpoint: '/api/admin/databases/:backupId/download',
      description: 'Provides secure download access to database backup files for external storage, analysis, or offline backup management. This endpoint serves database backup files as binary downloads with proper content-type headers, filename preservation, and download progress support. Essential for creating off-site backup copies, compliance requirements, and external database analysis workflows.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: 'Binary file download'
    },

    // =============== ADMIN LOG MANAGEMENT ===============
    {
      id: 'admin-logs-list',
      name: 'List Log Files',
      method: 'GET',
      endpoint: '/api/admin/logs',
      description: 'Retrieves a comprehensive inventory of all system log files with detailed metadata including file sizes, modification dates, line counts, and storage information. This endpoint provides administrators with complete log file visibility for debugging, audit trail management, and system monitoring. Essential for troubleshooting, performance analysis, and compliance reporting with organized log file categorization.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        logs: [
          {
            filename: '2024-01-15.log',
            size: '2.5MB',
            lastModified: '2024-01-15T23:59:59Z',
            lines: 15678
          }
        ],
        totalFiles: 30,
        totalSize: '125MB'
      }
    },
    {
      id: 'admin-logs-view',
      name: 'View Log File',
      method: 'GET',
      endpoint: '/api/admin/logs/:filename',
      description: 'Provides secure access to view the complete contents of specific log files with formatted display and metadata information. This endpoint renders log files in a readable format with proper line numbering, timestamp parsing, and content organization. Essential for real-time debugging, error investigation, and system monitoring with support for large log file handling and content filtering.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        filename: '2024-01-15.log',
        content: 'Log file contents...',
        lines: 15678,
        size: '2.5MB'
      }
    },
    {
      id: 'admin-logs-download',
      name: 'Download Log File',
      method: 'GET',
      endpoint: '/api/admin/logs/:filename/download',
      description: 'Provides secure download access to log files for offline analysis, external processing, or compliance archiving. This endpoint serves log files as text downloads with proper content-type headers, filename preservation, and support for large file streaming. Essential for detailed log analysis, audit compliance, and external monitoring tool integration with comprehensive download management.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: 'Text file download'
    },
    {
      id: 'admin-logs-delete',
      name: 'Delete Log File',
      method: 'DELETE',
      endpoint: '/api/admin/logs/:filename',
      description: 'Permanently removes a specific log file from storage with confirmation requirements and safety validation. This endpoint includes checks to prevent deletion of active or critical log files, confirmation mechanisms for accidental deletion prevention, and automatic storage space reclamation. Essential for log retention management and storage optimization while maintaining audit trail requirements.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        message: 'Log file deleted',
        deletedFile: '2024-01-15.log'
      }
    },
    {
      id: 'admin-logs-clear',
      name: 'Clear All Logs',
      method: 'DELETE',
      endpoint: '/api/admin/logs/clear',
      description: 'Performs bulk deletion of all log files with comprehensive safety checks and storage space recovery reporting. This endpoint includes confirmation requirements, selective preservation options for critical logs, and detailed reporting of freed storage space. Essential for major cleanup operations, storage management, and log rotation policies with proper audit trail maintenance.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        message: 'All log files deleted',
        deletedFiles: 25,
        freedSpace: '98MB'
      }
    },

    // =============== ADMIN PRIVACY & SETTINGS ===============
    {
      id: 'admin-privacy-settings',
      name: 'Update Privacy Settings',
      method: 'POST',
      endpoint: '/api/admin/privacy-settings',
      description: 'Configures comprehensive privacy and GDPR compliance settings including data retention policies, anonymization rules, and analytics preferences. This endpoint manages system-wide privacy controls, automatic data lifecycle management, and compliance with international privacy regulations. Essential for legal compliance, user privacy protection, and automated data governance with configurable retention periods.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        gdprCompliance: true,
        dataRetentionDays: 365,
        anonymizeAfterDays: 90,
        allowAnalytics: true
      },
      responseExample: {
        success: true,
        message: 'Privacy settings updated',
        settings: {
          gdprCompliance: true,
          dataRetentionDays: 365,
          anonymizeAfterDays: 90
        }
      }
    },

    // =============== BUG REPORTING SYSTEM ===============
    {
      id: 'submit-bug-report',
      name: 'Submit Bug Report',
      method: 'POST',
      endpoint: '/api/bug-reports',
      description: 'Submit bug reports or feature requests to the Velink development team. Includes automatic collection of browser information, current URL, and user-provided description. Helps improve the platform by allowing users to report issues directly from the interface. All reports are reviewed by the development team.',
      category: 'public',
      requestBody: {
        title: 'Bug title',
        description: 'Detailed bug description',
        severity: 'medium',
        userAgent: 'Mozilla/5.0...',
        currentUrl: 'https://velink.me/admin'
      },
      responseExample: {
        success: true,
        reportId: 'bug_report_001',
        message: 'Bug report submitted successfully'
      }
    },
    {
      id: 'admin-bug-reports-list',
      name: 'List Bug Reports',
      method: 'GET',
      endpoint: '/api/admin/bug-reports',
      description: 'Retrieves a comprehensive list of all submitted bug reports with detailed metadata including severity levels, status tracking, submission timestamps, and resolution progress. This endpoint provides administrators with complete bug report visibility for issue management, priority assessment, and development planning. Essential for quality assurance, user feedback analysis, and systematic issue resolution.',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        reports: [
          {
            id: 'bug_report_001',
            title: 'Bug title',
            severity: 'medium',
            status: 'open',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          }
        ],
        totalReports: 15,
        openReports: 8
      }
    },
    {
      id: 'admin-bug-report-update',
      name: 'Update Bug Report',
      method: 'PATCH',
      endpoint: '/api/admin/bug-reports/:id',
      description: 'Updates the status, priority, and resolution details of specific bug reports with comprehensive tracking and notification capabilities. This endpoint manages the complete bug lifecycle including status transitions, priority adjustments, assignment tracking, and resolution documentation. Essential for issue management workflows, developer coordination, and user feedback communication.',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        status: 'resolved',
        resolution: 'Fixed in version 1.2.4',
        assignedTo: 'dev-team'
      },
      responseExample: {
        success: true,
        message: 'Bug report updated',
        report: {
          id: 'bug_report_001',
          status: 'resolved',
          updatedAt: '2024-01-15T15:30:00Z'
        }
      }
    },

    // =============== SYSTEM & HEALTH ENDPOINTS ===============
    {
      id: 'health-check',
      name: 'System Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Basic system health check endpoint',
      category: 'system',
      responseExample: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: 86400
      }
    },
    {
      id: 'favicon',
      name: 'Favicon',
      method: 'GET',
      endpoint: '/favicon.ico',
      description: 'Serves the website favicon icon file for browser tab display, bookmark representation, and browser integration. This endpoint provides the standard 16x16 pixel ICO format favicon used by web browsers for visual identification of the website. Essential for brand recognition, professional appearance, and consistent user experience across different browsers and platforms.',
      category: 'system',
      responseExample: 'ICO image file'
    },
    {
      id: 'app-manifest',
      name: 'App Manifest',
      method: 'GET',
      endpoint: '/manifest.json',
      description: 'Provides the Progressive Web App (PWA) manifest file containing application metadata, display preferences, and installation configuration. This endpoint enables web app installation, defines app appearance, and configures standalone app behavior. Essential for PWA functionality, mobile app-like experience, and home screen installation on compatible devices.',
      category: 'system',
      responseExample: {
        name: 'Velink',
        short_name: 'Velink',
        description: 'URL Shortener with Analytics',
        start_url: '/',
        display: 'standalone'
      }
    },

    // =============== REDIRECTS & LINK RESOLUTION ===============
    {
      id: 'redirect-link',
      name: 'Redirect Short Link',
      method: 'GET',
      endpoint: '/:shortCode',
      description: 'Performs URL redirection from a short code to its original destination URL with comprehensive tracking and analytics collection. This is the core functionality that resolves shortened links, records click analytics, handles link expiration, and manages access controls. Includes automatic click tracking, geographic data collection, referrer analysis, and user agent parsing for comprehensive link analytics.',
      category: 'system',
      responseExample: 'HTTP 302 redirect to original URL'
    },

    // =============== MOBILE APP API ===============
    {
      id: 'mobile-app-info',
      name: 'Mobile App Information',
      method: 'GET',
      endpoint: '/api/mobile/app-info',
      description: 'Provides comprehensive mobile application information including current app version, download links, feature compatibility, and update notifications. This endpoint serves mobile app metadata for in-app updates, feature discovery, and cross-platform synchronization. Essential for mobile app management and user experience optimization.',
      category: 'mobile',
      responseExample: {
        version: '1.0.0',
        buildNumber: 42,
        downloadUrls: {
          ios: 'https://apps.apple.com/app/velink',
          android: 'https://play.google.com/store/apps/details?id=com.velink.app'
        },
        features: ['url_shortening', 'analytics', 'qr_codes', 'offline_sync'],
        minimumOsVersions: {
          ios: '13.0',
          android: '7.0'
        }
      }
    },
    {
      id: 'mobile-sync-data',
      name: 'Sync Mobile Data',
      method: 'POST',
      endpoint: '/api/mobile/sync',
      description: 'Synchronizes mobile app data with the web platform including user preferences, recently created links, analytics data, and offline actions. This endpoint handles bidirectional data sync, conflict resolution, and incremental updates for seamless cross-platform experience. Essential for maintaining data consistency between mobile and web interfaces.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        lastSyncTimestamp: '2024-01-15T10:30:00Z',
        pendingActions: [
          {
            type: 'create_link',
            url: 'https://example.com',
            timestamp: '2024-01-15T10:35:00Z'
          }
        ],
        deviceInfo: {
          platform: 'ios',
          version: '17.2',
          deviceId: 'mobile_device_123'
        }
      },
      responseExample: {
        success: true,
        syncTimestamp: '2024-01-15T10:40:00Z',
        updatedLinks: [],
        conflictResolutions: [],
        pendingUploads: 0
      }
    },
    {
      id: 'mobile-offline-actions',
      name: 'Process Offline Actions',
      method: 'POST',
      endpoint: '/api/mobile/offline-actions',
      description: 'Processes actions that were performed offline in the mobile app and queued for server synchronization. This endpoint handles bulk processing of offline link creation, analytics events, and user interactions. Includes conflict detection, duplicate prevention, and error recovery for reliable offline-to-online data migration.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        actions: [
          {
            id: 'offline_action_001',
            type: 'create_link',
            data: {
              url: 'https://example.com/offline-created',
              customCode: 'offline123'
            },
            timestamp: '2024-01-15T08:30:00Z'
          }
        ]
      },
      responseExample: {
        success: true,
        processedActions: 1,
        failedActions: 0,
        results: [
          {
            actionId: 'offline_action_001',
            status: 'success',
            shortCode: 'abc123',
            shortUrl: 'https://velink.me/abc123'
          }
        ]
      }
    },
    {
      id: 'mobile-push-notifications',
      name: 'Configure Push Notifications',
      method: 'POST',
      endpoint: '/api/mobile/push-notifications',
      description: 'Configures push notification settings for mobile devices including notification preferences, token registration, and targeted messaging. This endpoint manages mobile notification delivery, user preferences, and cross-platform messaging coordination. Essential for user engagement, update notifications, and real-time analytics alerts.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        deviceToken: 'push_token_123456789',
        platform: 'ios',
        preferences: {
          linkClicks: true,
          weeklyReports: true,
          systemUpdates: false,
          securityAlerts: true
        }
      },
      responseExample: {
        success: true,
        deviceRegistered: true,
        notificationId: 'notification_settings_001'
      }
    },
    {
      id: 'mobile-analytics-events',
      name: 'Track Mobile Analytics',
      method: 'POST',
      endpoint: '/api/mobile/analytics',
      description: 'Tracks mobile-specific analytics events including app usage patterns, feature interactions, performance metrics, and user behavior data. This endpoint collects mobile app analytics separately from web analytics, enabling platform-specific insights and mobile user experience optimization.',
      category: 'mobile',
      requestBody: {
        events: [
          {
            type: 'link_created_mobile',
            timestamp: '2024-01-15T10:30:00Z',
            metadata: {
              feature_used: 'quick_share',
              app_version: '1.0.0'
            }
          }
        ],
        sessionInfo: {
          sessionId: 'mobile_session_123',
          platform: 'ios',
          appVersion: '1.0.0'
        }
      },
      responseExample: {
        success: true,
        eventsTracked: 1,
        sessionUpdated: true
      }
    },
    {
      id: 'mobile-qr-scan',
      name: 'Process QR Code Scan',
      method: 'POST',
      endpoint: '/api/mobile/qr-scan',
      description: 'Processes QR code scans from mobile devices including link validation, security checks, and analytics tracking. This endpoint handles mobile QR code interactions, validates scanned links, and provides enhanced mobile scanning experience with security warnings and link previews.',
      category: 'mobile',
      requestBody: {
        scannedData: 'https://velink.me/abc123',
        scanTimestamp: '2024-01-15T10:30:00Z',
        deviceInfo: {
          platform: 'android',
          location: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        }
      },
      responseExample: {
        success: true,
        linkValid: true,
        linkInfo: {
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          requiresPassword: false,
          isExpired: false
        },
        securityWarning: null
      }
    },
    {
      id: 'mobile-widget-data',
      name: 'Get Widget Data',
      method: 'GET',
      endpoint: '/api/mobile/widget-data',
      description: 'Provides data for mobile app widgets including quick stats, recent links, and trending analytics. This endpoint delivers optimized data for mobile home screen widgets, notification center summaries, and quick-access interfaces. Essential for mobile user engagement and at-a-glance information display.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        widgetData: {
          totalLinks: 156,
          todayClicks: 42,
          recentLinks: [
            {
              shortCode: 'abc123',
              clicks: 15,
              createdAt: '2024-01-15T09:30:00Z'
            }
          ],
          trendingLink: {
            shortCode: 'trending1',
            clicks: 89,
            growth: '+25%'
          }
        }
      }
    },

    // =============== ENHANCED MOBILE STATISTICS & ANALYTICS ===============
    {
      id: 'mobile-user-stats',
      name: 'Get User Statistics',
      method: 'GET',
      endpoint: '/api/mobile/stats/user',
      description: 'Comprehensive user statistics for mobile dashboard including total links created, clicks received, top performing links, and time-based analytics. Provides detailed insights for mobile app users to track their link performance and engagement metrics.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        stats: {
          totalLinks: 247,
          totalClicks: 15847,
          averageClicksPerLink: 64.2,
          topPerformingLink: {
            shortCode: 'viral123',
            clicks: 2891,
            originalUrl: 'https://example.com/popular-content'
          },
          recentPerformance: {
            last7Days: { links: 12, clicks: 892 },
            last30Days: { links: 45, clicks: 3247 }
          },
          clicksByDay: {
            '2024-01-15': 156,
            '2024-01-14': 203,
            '2024-01-13': 178
          }
        }
      }
    },
    {
      id: 'mobile-link-stats',
      name: 'Get Link Statistics',
      method: 'GET',
      endpoint: '/api/mobile/stats/link/:shortCode',
      description: 'Detailed analytics for a specific link including click history, geographic distribution, device breakdown, referrer sources, and time-based performance. Essential for mobile users to analyze individual link performance and optimize their sharing strategy.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        link: {
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          totalClicks: 456,
          uniqueClicks: 287,
          createdAt: '2024-01-10T14:30:00Z',
          analytics: {
            clicksByCountry: {
              'United States': 145,
              'Germany': 89,
              'United Kingdom': 67
            },
            clicksByDevice: {
              'Mobile': 298,
              'Desktop': 124,
              'Tablet': 34
            },
            clicksByReferrer: {
              'Direct': 156,
              'Twitter': 123,
              'Facebook': 89,
              'LinkedIn': 45
            },
            hourlyDistribution: {
              '00': 12, '01': 8, '02': 5, '03': 3,
              '09': 45, '10': 52, '11': 48, '12': 39
            }
          }
        }
      }
    },
    {
      id: 'mobile-trending-stats',
      name: 'Get Trending Statistics',
      method: 'GET',
      endpoint: '/api/mobile/stats/trending',
      description: 'Real-time trending analytics including most clicked links, fastest growing links, recent viral content, and platform-wide statistics. Helps mobile users discover trending content and understand platform usage patterns.',
      category: 'mobile',
      responseExample: {
        success: true,
        trending: {
          mostClickedToday: [
            { shortCode: 'viral1', clicks: 1247, growth: '+89%' },
            { shortCode: 'trend2', clicks: 892, growth: '+67%' },
            { shortCode: 'hot3', clicks: 634, growth: '+45%' }
          ],
          fastestGrowing: [
            { shortCode: 'rocket1', clicksPerHour: 156, growth: '+234%' },
            { shortCode: 'boom2', clicksPerHour: 89, growth: '+178%' }
          ],
          platformStats: {
            totalLinksToday: 1247,
            totalClicksToday: 45892,
            activeUsers: 2847,
            peakHour: '14:00'
          }
        }
      }
    },

    // =============== MOBILE LINK MANAGEMENT ===============
    {
      id: 'mobile-create-link',
      name: 'Create Short Link',
      method: 'POST',
      endpoint: '/api/mobile/links/create',
      description: 'Create shortened links from mobile apps with enhanced mobile-specific features including custom expiration, mobile-optimized redirects, app deep linking support, and offline queuing capability.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        url: 'https://example.com/very-long-url',
        customAlias: 'my-link',
        password: 'optional-password',
        expiresAt: '2024-12-31T23:59:59Z',
        mobileOptimized: true,
        deepLinkSupport: {
          ios: 'myapp://content/123',
          android: 'intent://content/123#Intent;package=com.myapp;end'
        },
        tags: ['mobile', 'campaign', 'social']
      },
      responseExample: {
        success: true,
        link: {
          shortCode: 'mob123',
          shortUrl: 'https://velink.com/mob123',
          originalUrl: 'https://example.com/very-long-url',
          qrCode: 'https://velink.com/api/qr/mob123',
          createdAt: '2024-01-15T10:30:00Z',
          expiresAt: '2024-12-31T23:59:59Z',
          isPasswordProtected: true,
          mobileOptimized: true
        }
      }
    },
    {
      id: 'mobile-edit-link',
      name: 'Edit Short Link',
      method: 'PUT',
      endpoint: '/api/mobile/links/:shortCode/edit',
      description: 'Edit existing short links from mobile apps including changing destination URL, updating expiration, modifying passwords, and updating mobile-specific settings. Supports batch editing for mobile efficiency.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        originalUrl: 'https://updated-example.com',
        password: 'new-password',
        expiresAt: '2025-06-30T23:59:59Z',
        tags: ['updated', 'mobile'],
        mobileOptimized: true
      },
      responseExample: {
        success: true,
        message: 'Link updated successfully',
        link: {
          shortCode: 'mob123',
          originalUrl: 'https://updated-example.com',
          updatedAt: '2024-01-15T11:45:00Z'
        }
      }
    },
    {
      id: 'mobile-delete-link',
      name: 'Delete Short Link',
      method: 'DELETE',
      endpoint: '/api/mobile/links/:shortCode/delete',
      description: 'Delete short links from mobile apps with confirmation and bulk delete support. Includes safety checks to prevent accidental deletion of high-traffic links.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        confirmDeletion: true,
        reason: 'No longer needed'
      },
      responseExample: {
        success: true,
        message: 'Link deleted successfully',
        deletedLink: {
          shortCode: 'mob123',
          finalStats: {
            totalClicks: 1247,
            lifetime: '45 days'
          }
        }
      }
    },
    {
      id: 'mobile-bulk-operations',
      name: 'Bulk Link Operations',
      method: 'POST',
      endpoint: '/api/mobile/links/bulk',
      description: 'Perform bulk operations on multiple links including creation, editing, deletion, and status changes. Optimized for mobile apps with batch processing and progress tracking.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        operation: 'create',
        links: [
          {
            url: 'https://example.com/page1',
            customAlias: 'page1',
            tags: ['bulk', 'mobile']
          },
          {
            url: 'https://example.com/page2',
            customAlias: 'page2',
            tags: ['bulk', 'mobile']
          }
        ]
      },
      responseExample: {
        success: true,
        results: {
          successful: 2,
          failed: 0,
          links: [
            { shortCode: 'page1', status: 'created' },
            { shortCode: 'page2', status: 'created' }
          ]
        }
      }
    },

    // =============== MOBILE USER MANAGEMENT ===============
    {
      id: 'mobile-user-profile',
      name: 'Get User Profile',
      method: 'GET',
      endpoint: '/api/mobile/user/profile',
      description: 'Retrieve comprehensive user profile information for mobile apps including account details, preferences, usage statistics, and mobile-specific settings.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        profile: {
          userId: 'user_123',
          username: 'mobile_user',
          email: 'user@example.com',
          accountCreated: '2024-01-01T00:00:00Z',
          subscription: {
            plan: 'pro',
            expiresAt: '2024-12-31T23:59:59Z',
            features: ['custom_domains', 'analytics', 'api_access']
          },
          usage: {
            linksCreated: 247,
            totalClicks: 15847,
            apiCallsThisMonth: 1247
          },
          preferences: {
            defaultExpiration: '30d',
            mobileNotifications: true,
            analyticsLevel: 'detailed'
          }
        }
      }
    },
    {
      id: 'mobile-update-preferences',
      name: 'Update User Preferences',
      method: 'PUT',
      endpoint: '/api/mobile/user/preferences',
      description: 'Update user preferences specific to mobile app usage including notification settings, default link options, sync preferences, and privacy settings.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        mobileNotifications: true,
        defaultExpiration: '7d',
        autoSync: true,
        privacyLevel: 'standard',
        themePref: 'dark'
      },
      responseExample: {
        success: true,
        message: 'Preferences updated successfully',
        preferences: {
          mobileNotifications: true,
          defaultExpiration: '7d',
          autoSync: true,
          privacyLevel: 'standard',
          themePref: 'dark'
        }
      }
    },

    // =============== MOBILE QR CODE & SHARING ===============
    {
      id: 'mobile-generate-qr',
      name: 'Generate QR Code',
      method: 'POST',
      endpoint: '/api/mobile/qr/generate',
      description: 'Generate customizable QR codes optimized for mobile sharing with various formats, sizes, and styling options. Includes batch generation for multiple links.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        shortCodes: ['abc123', 'def456'],
        format: 'png',
        size: 512,
        style: {
          foregroundColor: '#000000',
          backgroundColor: '#ffffff',
          logoUrl: 'https://example.com/logo.png'
        },
        mobileOptimized: true
      },
      responseExample: {
        success: true,
        qrCodes: [
          {
            shortCode: 'abc123',
            qrCodeUrl: 'https://velink.com/api/qr/abc123.png',
            downloadUrl: 'https://velink.com/api/qr/abc123/download'
          }
        ]
      }
    },
    {
      id: 'mobile-share-link',
      name: 'Share Link',
      method: 'POST',
      endpoint: '/api/mobile/share',
      description: 'Advanced sharing functionality for mobile apps including platform-specific optimization, tracking share events, and generating shareable content with previews.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        shortCode: 'abc123',
        platform: 'whatsapp',
        includePreview: true,
        customMessage: 'Check this out!',
        trackingEnabled: true
      },
      responseExample: {
        success: true,
        shareData: {
          optimizedUrl: 'https://velink.com/abc123?utm_source=whatsapp&utm_medium=mobile',
          previewImage: 'https://velink.com/api/preview/abc123.png',
          suggestedText: 'Check this out! https://velink.com/abc123',
          deepLink: 'whatsapp://send?text=Check%20this%20out!%20https://velink.com/abc123'
        }
      }
    },

    // =============== MOBILE ANALYTICS & INSIGHTS ===============
    {
      id: 'mobile-realtime-analytics',
      name: 'Real-time Analytics',
      method: 'GET',
      endpoint: '/api/mobile/analytics/realtime',
      description: 'Real-time analytics feed for mobile apps showing live click events, active users, trending links, and instant performance metrics. Perfect for mobile dashboards and live monitoring.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        realtime: {
          activeUsers: 847,
          clicksLastMinute: 23,
          clicksLastHour: 1247,
          liveEvents: [
            {
              timestamp: '2024-01-15T10:30:45Z',
              event: 'click',
              shortCode: 'abc123',
              country: 'US',
              device: 'mobile'
            }
          ],
          trendingNow: [
            { shortCode: 'hot1', clicksPerMinute: 12 },
            { shortCode: 'viral2', clicksPerMinute: 8 }
          ]
        }
      }
    },
    {
      id: 'mobile-export-data',
      name: 'Export Analytics Data',
      method: 'POST',
      endpoint: '/api/mobile/analytics/export',
      description: 'Export comprehensive analytics data in various formats (CSV, JSON, PDF) optimized for mobile download and sharing. Includes customizable date ranges and data filtering.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        format: 'csv',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        includeFields: ['clicks', 'countries', 'devices', 'referrers'],
        links: ['abc123', 'def456']
      },
      responseExample: {
        success: true,
        export: {
          downloadUrl: 'https://velink.com/api/exports/analytics_jan2024.csv',
          expiresAt: '2024-01-16T10:30:00Z',
          fileSize: '2.4MB',
          recordCount: 15847
        }
      }
    },

    // =============== MOBILE NOTIFICATIONS & ALERTS ===============
    {
      id: 'mobile-notification-settings',
      name: 'Notification Settings',
      method: 'GET',
      endpoint: '/api/mobile/notifications/settings',
      description: 'Retrieve and manage push notification settings for mobile apps including alert preferences, frequency settings, and notification categories.',
      category: 'mobile',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        settings: {
          pushEnabled: true,
          categories: {
            linkClicks: { enabled: true, threshold: 100 },
            dailyReports: { enabled: true, time: '09:00' },
            weeklyReports: { enabled: false },
            securityAlerts: { enabled: true, immediate: true }
          },
          devices: [
            {
              deviceId: 'device_123',
              platform: 'ios',
              token: 'apns_token_here',
              lastSeen: '2024-01-15T10:30:00Z'
            }
          ]
        }
      }
    },
    {
      id: 'mobile-send-notification',
      name: 'Send Notification',
      method: 'POST',
      endpoint: '/api/mobile/notifications/send',
      description: 'Send custom push notifications to mobile devices with rich content, action buttons, and deep linking capabilities. Supports targeted delivery and scheduling.',
      category: 'mobile',
      authentication: 'Bearer Token',
      requestBody: {
        title: 'Link Performance Alert',
        body: 'Your link abc123 just hit 1000 clicks!',
        data: {
          shortCode: 'abc123',
          action: 'view_analytics'
        },
        actionButtons: [
          { title: 'View Stats', action: 'view_stats' },
          { title: 'Share', action: 'share_link' }
        ],
        scheduleFor: '2024-01-15T15:00:00Z'
      },
      responseExample: {
        success: true,
        notification: {
          notificationId: 'notif_123',
          status: 'scheduled',
          scheduledFor: '2024-01-15T15:00:00Z',
          targetDevices: 3
        }
      }
    }
  ];

  const filteredEndpoints = apiEndpoints.filter(endpoint => endpoint.category === activeTab);

  const CodeBlock: React.FC<{ code: string; language?: string; id: string }> = ({ 
    code, 
    language = 'javascript', 
    id 
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          {copiedCode === id ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="text-sm">Copy</span>
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  const ApiPlayground: React.FC<{ endpoint: ApiEndpoint }> = ({ endpoint }) => {
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [requestBody, setRequestBody] = useState(
      endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : ''
    );

    const executeRequest = async () => {
      setLoading(true);
      setResponse(null);

      try {
        let config: any = {
          method: endpoint.method,
          url: `${baseUrl}${endpoint.endpoint.replace(':shortCode', 'abc123')}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (endpoint.authentication) {
          config.headers['Authorization'] = 'Bearer your-admin-token';
        }

        if (endpoint.method !== 'GET' && requestBody) {
          config.data = JSON.parse(requestBody);
        }

        const result = await axios(config);
        setResponse({
          status: result.status,
          data: result.data,
        });
      } catch (error: any) {
        setResponse({
          status: error.response?.status || 500,
          data: error.response?.data || null,
          error: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-gray-700">{endpoint.endpoint}</code>
            </div>
            {endpoint.authentication && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Auth Required
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{endpoint.description}</p>
        </div>

        <div className="p-6">
          {endpoint.method !== 'GET' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                placeholder="Enter JSON request body..."
              />
            </div>
          )}

          <button
            onClick={executeRequest}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            <Play className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing...' : 'Try it out'}</span>
          </button>

          {endpoint.responseExample && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example Response:</h4>
              <pre className="bg-slate-800 text-green-400 border border-slate-600 rounded-md p-4 text-sm overflow-x-auto">
                {JSON.stringify(endpoint.responseExample, null, 2)}
              </pre>
            </div>
          )}

          {response && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Live Response:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  response.status >= 200 && response.status < 300 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {response.status}
                </span>
              </div>
              <pre className="bg-slate-800 text-cyan-300 border border-slate-600 rounded-md p-4 text-sm overflow-x-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
              {response.error && (
                <div className="mt-2 text-red-600 text-sm">
                  Error: {response.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-50 via-white to-blue-50 rounded-2xl border border-gray-200 p-12">
              <div className="text-center mb-10">
                <div className="bg-gradient-to-r from-primary-500 to-blue-500 p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Server className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
                  Velink API Documentation
                </h1>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                  Build powerful applications with our comprehensive RESTful API. Get lightning-fast URL shortening, 
                  real-time analytics, enterprise security, and seamless integration capabilities.
                </p>
                
                {/* Feature highlights */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="h-4 w-4 mr-2" />
                    RESTful Design
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Zap className="h-4 w-4 mr-2" />
                    Lightning Fast
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <Shield className="h-4 w-4 mr-2" />
                    Enterprise Security
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    <Play className="h-4 w-4 mr-2" />
                    Interactive Testing
                  </span>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setActiveTab('public')}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Start with Public API
                  </button>
                  <button 
                    onClick={() => setActiveTab('examples')}
                    className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Code className="h-5 w-5 mr-2" />
                    View Code Examples
                  </button>
                </div>
              </div>
            </div>

            {/* API Stats Dashboard */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">API Endpoints Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 cursor-pointer"
                  onClick={() => setActiveTab('public')}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900 mb-1">{apiEndpoints.filter(e => e.category === 'public').length}</div>
                  <div className="text-sm font-medium text-blue-700 mb-2">Public Endpoints</div>
                  <div className="text-xs text-blue-600">No authentication required</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 cursor-pointer"
                  onClick={() => setActiveTab('admin')}
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900 mb-1">{apiEndpoints.filter(e => e.category === 'admin').length}</div>
                  <div className="text-sm font-medium text-purple-700 mb-2">Admin Endpoints</div>
                  <div className="text-xs text-purple-600">Secure admin operations</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 cursor-pointer"
                  onClick={() => setActiveTab('mobile')}
                >
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-900 mb-1">{apiEndpoints.filter(e => e.category === 'mobile').length}</div>
                  <div className="text-sm font-medium text-green-700 mb-2">Mobile API</div>
                  <div className="text-xs text-green-600">Third-party app development</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 cursor-pointer"
                  onClick={() => setActiveTab('system')}
                >
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Server className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mb-1">{apiEndpoints.filter(e => e.category === 'system').length}</div>
                  <div className="text-sm font-medium text-orange-700 mb-2">System Endpoints</div>
                  <div className="text-xs text-orange-600">Health & infrastructure</div>
                </motion.div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Start Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Choose Your API</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Start with our <strong>Public API</strong> for basic URL shortening, or use the <strong>Admin API</strong> 
                    for advanced features like analytics, bulk operations, and system management.
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Test Interactively</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Use our <strong>interactive playground</strong> to test endpoints in real-time. See request/response 
                    examples, try different parameters, and understand the API behavior.
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Integrate & Deploy</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Copy our <strong>code examples</strong> in multiple languages, follow best practices, 
                    and integrate Velink seamlessly into your applications.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Developers Love Velink API</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="bg-blue-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h4>
                  <p className="text-gray-600 text-sm">Sub-100ms response times with optimized caching and CDN integration</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="bg-green-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h4>
                  <p className="text-gray-600 text-sm">Rate limiting, authentication, and comprehensive security headers</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <div className="bg-purple-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <Book className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Developer-Friendly</h4>
                  <p className="text-gray-600 text-sm">Clear documentation, code examples, and interactive testing tools</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="bg-orange-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
                  <p className="text-gray-600 text-sm">Real-time tracking, geographic data, and detailed performance metrics</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
                  <div className="bg-pink-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile-First</h4>
                  <p className="text-gray-600 text-sm">Dedicated mobile API with 20+ endpoints for app development</p>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                  <div className="bg-indigo-500 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">99.9% Uptime</h4>
                  <p className="text-gray-600 text-sm">Reliable infrastructure with health monitoring and automatic failover</p>
                </div>
              </div>
            </div>

            {/* Rate Limits & Base URL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rate Limits */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-3" />
                  Rate Limits
                </h3>
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-medium text-gray-900">Public API</span>
                      <span className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">1 req/0.5s</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-medium text-gray-900">Daily Limit</span>
                      <span className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">500 links/day</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                      <span className="font-medium text-gray-900">Admin API</span>
                      <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">Higher limits</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Base URL */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Globe className="h-6 w-6 text-blue-500 mr-3" />
                  Base URL
                </h3>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
                      <code className="font-mono text-lg text-gray-800 break-all">
                        {baseUrl}
                      </code>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      All API endpoints are relative to this base URL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'public':
      case 'admin':
      case 'system':
      case 'mobile':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab === 'public' ? 'Public API Endpoints' : 
                 activeTab === 'admin' ? 'Admin API Endpoints' : 
                 activeTab === 'mobile' ? 'Mobile API Endpoints' :
                 'System Endpoints'}
              </h2>
              <p className="text-gray-600 mb-6">
                {activeTab === 'public' 
                  ? 'These endpoints are publicly accessible and do not require authentication.'
                  : activeTab === 'admin' 
                  ? 'These endpoints require admin authentication using a Bearer token.'
                  : activeTab === 'mobile'
                  ? 'Comprehensive mobile development API with 20+ endpoints covering link management, real-time analytics, user profiles, notifications, and advanced features. Velink provides these production-ready routes for third-party developers to build powerful mobile applications with full platform capabilities.'
                  : 'System endpoints for health checks, redirects, static files, and infrastructure.'}
              </p>
              
              {activeTab === 'mobile' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Smartphone className="h-6 w-6 text-blue-600 mt-1" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">Comprehensive Third-Party Mobile Development API</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        Velink provides a complete mobile development ecosystem with 20+ specialized endpoints. Build powerful mobile applications with full feature parity to our web platform:
                      </p>
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-blue-700">
                        <div>• Advanced Link Management</div>
                        <div>• Real-time Analytics & Stats</div>
                        <div>• User Profile Management</div>
                        <div>• QR Code Generation & Sharing</div>
                        <div>• Push Notifications & Alerts</div>
                        <div>• Data Export & Reporting</div>
                        <div>• Bulk Operations</div>
                        <div>• Widget Data for Home Screens</div>
                        <div>• Live Performance Monitoring</div>
                        <div>• Cross-platform Data Sync</div>
                        <div>• Custom App Integration</div>
                        <div>• Trending Content Discovery</div>
                      </div>
                      <p className="text-blue-600 text-xs mt-3 italic">
                        <strong>Production-Ready:</strong> All endpoints include comprehensive request/response examples, authentication details, and real-world usage scenarios. Perfect for iOS, Android, and cross-platform development.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {filteredEndpoints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No endpoints available for this category.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredEndpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ApiPlayground endpoint={endpoint} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
              
              <div className="space-y-8">
                {/* JavaScript Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">JavaScript/Fetch</h3>
                  <CodeBlock 
                    id="js-fetch"
                    code={`// Basic URL shortening
async function shortenUrl(url) {
  try {
    const response = await fetch('${baseUrl}/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        expiresIn: '30d'
      })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Shortened URL:', data.shortUrl);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`}
                  />
                </div>

                {/* cURL Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">cURL</h3>
                  <CodeBlock 
                    id="curl-example"
                    language="bash"
                    code={`# Shorten a URL
curl -X POST "${baseUrl}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "expiresIn": "30d"
  }'

# Get link statistics
curl -X GET "${baseUrl}/api/info/abc123"

# Admin: Get all links (requires auth)
curl -X GET "${baseUrl}/api/admin/links" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"`}
                  />
                </div>

                {/* Python Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Python</h3>
                  <CodeBlock 
                    id="python-example"
                    language="python"
                    code={`import requests
import json

class VelinkAPI:
    def __init__(self, base_url="${baseUrl}"):
        self.base_url = base_url
        
    def shorten_url(self, url, expires_in="30d"):
        """Shorten a URL using Velink API"""
        endpoint = f"{self.base_url}/api/shorten"
        payload = {
            "url": url,
            "expiresIn": expires_in
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None
    
    def get_link_info(self, short_code):
        """Get information about a shortened URL"""
        endpoint = f"{self.base_url}/api/info/{short_code}"
        
        try:
            response = requests.get(endpoint)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None

# Usage
api = VelinkAPI()
result = api.shorten_url("https://example.com/long-url")
if result:
    print(f"Short URL: {result['shortUrl']}")
    print(f"QR Code: {result['qrCode']}")`}
                  />
                </div>

                {/* Node.js Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Node.js</h3>
                  <CodeBlock 
                    id="nodejs-example"
                    language="javascript"
                    code={`const axios = require('axios');

class VelinkAPI {
  constructor(baseUrl = '${baseUrl}', adminToken = null) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  async shortenUrl(url, expiresIn = '30d') {
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/shorten\`, {
        url,
        expiresIn
      });
      return response.data;
    } catch (error) {
      console.error('Error shortening URL:', error.response?.data || error.message);
      throw error;
    }
  }

  async getLinkInfo(shortCode) {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/info/\${shortCode}\`);
      return response.data;
    } catch (error) {
      console.error('Error getting link info:', error.response?.data || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/stats\`);
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin methods requiring authentication
  getAuthHeaders() {
    if (!this.adminToken) {
      throw new Error('Admin token required for this operation');
    }
    return {
      'Authorization': \`Bearer \${this.adminToken}\`,
      'Content-Type': 'application/json'
    };
  }

  async checkForUpdates() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/update/check\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking for updates:', error.response?.data || error.message);
      throw error;
    }
  }

  async startUpdate(options = {}) {
    const defaultOptions = {
      createBackup: true,
      restartServices: true,
      maintenanceMode: true
    };
    
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/admin/update/perform\`, {
        ...defaultOptions,
        ...options
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error starting update:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUpdateStatus() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/update/status\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting update status:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/system/health\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting system health:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage Examples
const api = new VelinkAPI('${baseUrl || 'https://velink.me'}', 'your-admin-token');

async function basicExample() {
  try {
    // Public API - Shorten a URL
    const result = await api.shortenUrl('https://example.com/very-long-url');
    console.log('Shortened URL:', result.shortUrl);
    
    // Get link information
    const info = await api.getLinkInfo(result.shortCode);
    console.log('Link clicks:', info.clicks);
    
    // Get global statistics
    const stats = await api.getStats();
    console.log('Total links:', stats.totalLinks);
  } catch (error) {
    console.error('Basic example failed:', error);
  }
}

async function adminExample() {
  try {
    // Admin API - Check system health
    const health = await api.getSystemHealth();
    console.log('System status:', health.status);
    console.log('Uptime:', health.uptime);
    
    // Check for updates
    const updateCheck = await api.checkForUpdates();
    if (updateCheck.updateAvailable) {
      console.log(\`Update available: \${updateCheck.latestVersion}\`);
      
      // Start update process
      const updateResult = await api.startUpdate({
        createBackup: true,
        maintenanceMode: true
      });
      console.log('Update started:', updateResult.updateId);
      
      // Monitor update progress
      const checkProgress = async () => {
        const status = await api.getUpdateStatus();
        console.log(\`Progress: \${status.progress}% - \${status.currentStep}\`);
        
        if (status.isUpdating) {
          setTimeout(checkProgress, 5000); // Check every 5 seconds
        } else {
          console.log('Update completed!');
        }
      };
      
      checkProgress();
    }
  } catch (error) {
    console.error('Admin example failed:', error);
  }
}

// Run examples
basicExample();
// adminExample(); // Uncomment when you have admin token`}
                  />
                </div>

                {/* Update System Management Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update System Management</h3>
                  <CodeBlock 
                    id="update-system-example"
                    language="javascript"
                    code={`// Complete Update System Management Example
class VelinkUpdateManager {
  constructor(baseUrl, adminToken) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  async performFullSystemUpdate() {
    try {
      // 1. Check system health before update
      console.log('🔍 Checking system health...');
      const health = await this.getSystemHealth();
      if (health.status !== 'healthy') {
        throw new Error(\`System not healthy: \${health.status}\`);
      }

      // 2. Check for available updates
      console.log('🔄 Checking for updates...');
      const updateCheck = await this.checkForUpdates();
      if (!updateCheck.updateAvailable) {
        console.log('✅ System is already up to date');
        return;
      }

      console.log(\`📦 Update available: v\${updateCheck.latestVersion}\`);

      // 3. Create backup before update
      console.log('💾 Creating backup...');
      const backup = await this.createBackup({
        name: \`pre-update-\${new Date().toISOString().split('T')[0]}\`,
        includeDatabase: true,
        description: \`Backup before updating to v\${updateCheck.latestVersion}\`
      });
      console.log(\`✅ Backup created: \${backup.backupId}\`);

      // 4. Start update process
      console.log('🚀 Starting update process...');
      const updateResult = await this.startUpdate({
        createBackup: false, // Already created manual backup
        restartServices: true,
        maintenanceMode: true,
        updateBranch: 'main'
      });

      console.log(\`🔄 Update initiated: \${updateResult.updateId}\`);
      console.log(\`⏱️  Estimated duration: \${updateResult.estimatedDuration}s\`);

      // 5. Monitor update progress
      await this.monitorUpdateProgress();

      console.log('🎉 Update completed successfully!');

    } catch (error) {
      console.error('❌ Update failed:', error.message);
      
      // Attempt to restore from backup if update failed
      try {
        console.log('🔄 Attempting to restore from backup...');
        await this.restoreFromBackup(backup.backupId);
        console.log('✅ System restored from backup');
      } catch (restoreError) {
        console.error('❌ Restore failed:', restoreError.message);
      }
    }
  }

  async monitorUpdateProgress() {
    return new Promise((resolve, reject) => {
      const checkProgress = async () => {
        try {
          const status = await this.getUpdateStatus();
          
          console.log(\`📊 Progress: \${status.progress}% (\${status.currentStep})\`);
          
          if (status.stepProgress) {
            console.log(\`   Step \${status.stepProgress.step}: \${status.stepProgress.name} - \${status.stepProgress.progress}%\`);
          }

          if (!status.isUpdating) {
            resolve();
          } else {
            setTimeout(checkProgress, 3000); // Check every 3 seconds
          }
        } catch (error) {
          reject(error);
        }
      };

      checkProgress();
    });
  }

  // Additional helper methods...
  async getSystemHealth() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/system/health\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async checkForUpdates() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/check\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async startUpdate(options) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/perform\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async getUpdateStatus() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/status\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async createBackup(options) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/backup\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async restoreFromBackup(backupId) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/restore\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ backupId, restartServices: true })
    });
    return response.json();
  }
}

// Usage
const updateManager = new VelinkUpdateManager('${baseUrl || 'https://velink.me'}', 'your-admin-token');

// Perform full automated update
updateManager.performFullSystemUpdate()
  .then(() => console.log('Update process completed'))
  .catch(error => console.error('Update failed:', error));`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="transition-all duration-300 group-hover:scale-105">
                <img src="/logo512.png" alt="Velink Logo" className="h-10 w-10" />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Velink
                </h1>
                <span className="text-gray-500">API</span>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Description */}
          <div className="mt-4 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <div className="flex items-center gap-2 justify-center">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              If you have questions or need support, we're here to help!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/bug-report"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Report an Issue
              </Link>
              <a
                href="mailto:mail@velyzo.de"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <a
                href="https://github.com/velyzo/velink"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;

