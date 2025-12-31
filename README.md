# Freeze Dryer E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, Shopify Storefront API, Sanity CMS, and Supabase for managing freeze-dryer products and custom order workflows.

## Features

- **E-Commerce Storefront**: Product catalog, collections, shopping cart, and checkout powered by Shopify
- **Content Management**: Customizable landing pages, testimonials, and marketing content via Sanity CMS
- **Custom Order Management**: Admin dashboard for managing freeze-drying orders and client relationships
- **Authentication**: Supabase Auth with role-based access control (Admin/Client)
- **Performance Optimized**: ISR (Incremental Static Regeneration) for fast page loads with fresh data
- **Mobile Responsive**: Optimized for all screen sizes with touch-friendly interfaces
- **Accessibility**: WCAG 2.1 compliant with proper heading hierarchy and ARIA landmarks

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **E-Commerce**: Shopify Storefront API
- **CMS**: Sanity Studio
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Deployment**: Vercel
- **Analytics**: Next.js Web Vitals

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Shopify store with Storefront API access
- Sanity account
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freeze-dryer-ecommerce
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:

   ```bash
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

   # Postgres (from Supabase)
   POSTGRES_URL=your_postgres_url
   POSTGRES_PRISMA_URL=your_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
   POSTGRES_USER=postgres
   POSTGRES_HOST=your_postgres_host
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=postgres

   # Shopify Storefront
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

   # Shopify Admin (optional, for admin features)
   SHOPIFY_STORE_NAME=your-store
   SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
   SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

   # Resend (for emails)
   RESEND_API_KEY=your_resend_api_key

   # Vercel Blob (for file uploads)
   BLOB_READ_WRITE_TOKEN=your_blob_token

   # App URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the SQL scripts in the `scripts/` folder in order:
   ```bash
   # Execute each script in your Supabase SQL editor
   # Or use the Supabase CLI
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the storefront.

6. **Access Sanity Studio**
   
   Navigate to [http://localhost:3000/studio](http://localhost:3000/studio) to manage content.

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard routes
│   ├── client/              # Client portal routes
│   ├── products/            # Product detail pages
│   ├── shop/                # Shop collection & all products pages
│   ├── studio/              # Sanity Studio route
│   └── page.tsx             # Homepage
├── cms/                      # Sanity CMS configuration
│   ├── schemaTypes/         # Sanity schemas
│   └── lib/                 # Sanity queries and client
├── components/              # React components
│   ├── admin/               # Admin-specific components
│   ├── cart/                # Shopping cart components
│   ├── shop/                # Storefront components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility functions
│   ├── shopify/             # Shopify API helpers
│   ├── supabase/            # Supabase client utilities
│   └── email/               # Email templates
├── scripts/                 # Database migration scripts
└── public/                  # Static assets
```

## Key Routes

### Public Routes
- `/` - Homepage with hero, collections, testimonials
- `/shop` - All products page with filtering
- `/shop/collection/[handle]` - Collection pages
- `/products/[handle]` - Product detail pages
- `/instant-processing` - Custom freeze-drying info page
- `/cart` - Shopping cart page

### Authenticated Routes
- `/admin` - Admin dashboard (requires admin role)
- `/admin/orders` - Order management
- `/admin/clients` - Client management
- `/admin/machines` - Machine tracking
- `/client` - Client portal (requires client role)
- `/client/orders` - View and request orders

### CMS
- `/studio` - Sanity Studio for content management

## Integration Guides

### Shopify Setup

See [SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md) and [SHOPIFY_STOREFRONT_SETUP.md](./SHOPIFY_STOREFRONT_SETUP.md) for detailed Shopify configuration instructions.

### Sanity CMS

1. Create a new Sanity project at [sanity.io](https://sanity.io)
2. Add your project ID to environment variables
3. Deploy the Sanity Studio: `pnpm sanity deploy`
4. Access the studio at `https://your-domain.com/studio`

### Supabase Database

1. Create a new Supabase project
2. Run the SQL scripts in `scripts/` folder in numerical order
3. Enable Row Level Security (RLS) policies
4. Configure authentication settings

## Performance Optimizations

- **ISR (Incremental Static Regeneration)**: 60-second revalidation on product pages
- **Parallel Data Fetching**: Server-side parallel queries to Shopify and Sanity
- **Client-Side Filtering**: Instant product filtering without server round-trips
- **Memoized Computations**: React useMemo for expensive calculations
- **Debounced Search**: 300ms debounce on search inputs
- **Image Optimization**: Next.js Image component with Shopify CDN

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add all environment variables
4. Deploy

The app will automatically redeploy on every push to your main branch.

### Post-Deployment

1. Configure your custom domain
2. Set up Shopify webhooks pointing to your domain
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Test all integrations (Shopify, Sanity, Supabase, email)

## Development Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Accessibility

The application follows WCAG 2.1 Level AA standards:
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic HTML with landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`)
- ARIA labels and roles where appropriate
- Keyboard navigation support
- Screen reader friendly

## Troubleshooting

### Products not loading
- Verify Shopify Storefront API token is valid
- Check `SHOPIFY_STORE_DOMAIN` environment variable
- Ensure products are published to your sales channel

### Sanity Studio not accessible
- Verify Sanity project ID is correct
- Check CORS settings in Sanity project
- Ensure you're authenticated with Sanity

### Database connection issues
- Verify Supabase URL and keys
- Check RLS policies are properly configured
- Ensure database tables exist

### Authentication issues
- Verify Supabase Auth is enabled
- Check redirect URLs in Supabase dashboard
- Ensure `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set for local development

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open a GitHub issue or contact the development team.
