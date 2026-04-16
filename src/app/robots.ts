import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout/success', '/admin'],
    },
    sitemap: 'https://satrshop-8ad70.web.app/sitemap.xml',
  }
}
