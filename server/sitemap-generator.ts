import { storage } from './storage';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://your-domain.replit.app') {
    this.baseUrl = baseUrl;
  }

  private formatUrl(path: string, lastmod?: Date, changefreq?: string, priority?: string): SitemapUrl {
    return {
      loc: `${this.baseUrl}${path}`,
      lastmod: lastmod ? lastmod.toISOString().split('T')[0] : undefined,
      changefreq: changefreq as any,
      priority
    };
  }

  private generateUrlsXml(urls: SitemapUrl[]): string {
    const urlsXml = urls.map(url => `
    <url>
      <loc>${url.loc}</loc>
      ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
      ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
      ${url.priority ? `<priority>${url.priority}</priority>` : ''}
    </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
</urlset>`;
  }

  async generateMainSitemap(): Promise<string> {
    const urls: SitemapUrl[] = [
      this.formatUrl('/', new Date(), 'daily', '1.0'),
      this.formatUrl('/spots', new Date(), 'daily', '0.9'),
      this.formatUrl('/forecast', new Date(), 'hourly', '0.9'),
      this.formatUrl('/pricing', new Date(), 'monthly', '0.7'),
      this.formatUrl('/feedback', new Date(), 'monthly', '0.5')
    ];

    return this.generateUrlsXml(urls);
  }

  async generateSpotsSitemap(): Promise<string> {
    try {
      const spots = await storage.getSurfSpots();
      const urls: SitemapUrl[] = spots.map((spot: any) => 
        this.formatUrl(`/spot/${spot.id}`, new Date(), 'hourly', '0.8')
      );

      // Add beach detail pages
      const beachUrls: SitemapUrl[] = spots.map((spot: any) => 
        this.formatUrl(`/beach/${spot.id}`, new Date(), 'daily', '0.7')
      );

      return this.generateUrlsXml([...urls, ...beachUrls]);
    } catch (error) {
      console.error('Error generating spots sitemap:', error);
      return this.generateUrlsXml([]);
    }
  }

  async generateForecastSitemap(): Promise<string> {
    try {
      const spots = await storage.getSurfSpots();
      const urls: SitemapUrl[] = [];

      spots.forEach((spot: any) => {
        // Add forecast pages for each spot
        urls.push(this.formatUrl(`/forecast?spot=${spot.id}`, new Date(), 'hourly', '0.8'));
        
        // Add 7-day forecast
        urls.push(this.formatUrl(`/forecast?spot=${spot.id}&days=7`, new Date(), 'hourly', '0.7'));
        
        // Add 14-day forecast
        urls.push(this.formatUrl(`/forecast?spot=${spot.id}&days=14`, new Date(), 'daily', '0.6'));
      });

      return this.generateUrlsXml(urls);
    } catch (error) {
      console.error('Error generating forecast sitemap:', error);
      return this.generateUrlsXml([]);
    }
  }

  generateSitemapIndex(): string {
    const sitemaps = [
      `${this.baseUrl}/sitemap-main.xml`,
      `${this.baseUrl}/sitemap-spots.xml`, 
      `${this.baseUrl}/sitemap-forecasts.xml`
    ];

    const sitemapsXml = sitemaps.map(sitemap => `
    <sitemap>
      <loc>${sitemap}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </sitemap>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapsXml}
</sitemapindex>`;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Allow: /spots
Allow: /spot/*
Allow: /beach/*
Allow: /forecast
Allow: /pricing

Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /payment-success
Disallow: /profile
Disallow: /favorites

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-main.xml
Sitemap: ${this.baseUrl}/sitemap-spots.xml
Sitemap: ${this.baseUrl}/sitemap-forecasts.xml

# Crawl-delay for responsible crawling
Crawl-delay: 1`;
  }
}

export const sitemapGenerator = new SitemapGenerator();