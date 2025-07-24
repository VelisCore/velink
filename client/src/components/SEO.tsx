import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: any;
}

const SEO: React.FC<SEOProps> = ({
  title = "Velink - Professional URL Shortener | Free Link Shortening Service",
  description = "Transform long URLs into powerful, trackable short links with Velink. Advanced analytics, QR codes, custom aliases, bulk operations, and enterprise-grade security. Free forever!",
  keywords = "url shortener, link shortener, short links, analytics, QR code generator, link management, click tracking, custom links, branded links, free url shortener, link analytics, bulk url shortener, enterprise link management, secure links, link expiration",
  image = "/og-image-optimized.png",
  url,
  type = "website",
  author = "Velink Team",
  publishedTime,
  modifiedTime,
  canonicalUrl,
  noIndex = false,
  structuredData
}) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const canonical = canonicalUrl || currentUrl;
  
  // Generate enhanced structured data
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${currentUrl}#webapp`,
        "name": "Velink",
        "description": "Professional URL shortening service with advanced analytics and security features",
        "url": currentUrl,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "URL Shortening",
          "Link Analytics", 
          "QR Code Generation",
          "Custom Aliases",
          "Bulk Operations",
          "Link Expiration",
          "Password Protection",
          "Geographic Analytics",
          "Device Analytics",
          "Referrer Tracking"
        ]
      },
      {
        "@type": "Organization",
        "@id": `${currentUrl}#organization`,
        "name": "Velink",
        "url": currentUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${currentUrl}/logo512.png`
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@velink.app",
          "contactType": "customer service"
        },
        "sameAs": [
          "https://github.com/velyzo/velink"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${currentUrl}#website`,
        "url": currentUrl,
        "name": "Velink",
        "description": description,
        "publisher": {
          "@id": `${currentUrl}#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${currentUrl}/analytics/{search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "Velink URL Shortener",
        "operatingSystem": "Any",
        "applicationCategory": "UtilitiesApplication",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1250"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      }
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={`${currentUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content="Velink" />
      <meta property="og:locale" content="en_US" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${currentUrl}${image}`} />
      <meta name="twitter:creator" content="@velink" />
      <meta name="twitter:site" content="@velink" />
      
      {/* Additional Meta Tags for Performance */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Performance Optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Additional Meta for Link Shortener SEO */}
      <meta name="application-name" content="Velink" />
      <meta name="msapplication-tooltip" content="Professional URL Shortener" />
      <meta name="msapplication-starturl" content="/" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Velink" />
      
      {/* Geo Meta */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Copyright */}
      <meta name="copyright" content="Velink Team" />
      
      {/* Cache Control */}
      <meta httpEquiv="cache-control" content="public, max-age=31536000" />
      
      {/* Additional Link Relations */}
      <link rel="alternate" type="application/rss+xml" title="Velink Updates" href="/feed.xml" />
      <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    </Helmet>
  );
};

export default SEO;
