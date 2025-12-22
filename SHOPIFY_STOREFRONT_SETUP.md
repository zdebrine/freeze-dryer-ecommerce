# Shopify Storefront API Setup Guide

To enable the ecommerce storefront, you need to configure the Shopify Storefront API access token.

## Step-by-Step Setup

### 1. Create a Custom App in Shopify

1. Log in to your Shopify Admin dashboard
2. Go to **Settings** → **Apps and sales channels**
3. Click **Develop apps** (you may need to enable custom app development)
4. Click **Create an app**
5. Enter a name like "mernin' Storefront" and click **Create app**

### 2. Configure Storefront API Scopes

1. Click **Configure** under **Storefront API**
2. Enable the following scopes:
   - `unauthenticated_read_product_listings` - Read product listings
   - `unauthenticated_read_product_inventory` - Read product inventory
   - `unauthenticated_read_product_tags` - Read product tags
   - `unauthenticated_read_collection_listings` - Read collections

3. Click **Save**

### 3. Install the App

1. Click the **API credentials** tab
2. Click **Install app** 
3. Confirm the installation

### 4. Get Your Storefront API Access Token

1. Under **Storefront API access token**, click **Reveal**
2. Copy the token (it will look like: `shpat_xxxxxxxxxxxxxxxxxxxxx`)

### 5. Add Environment Variables

You need to add **ONE** new environment variable to your Vercel project:

**New Variable:**
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - The Storefront API token you just copied

**Existing Variable (already configured):**
- `SHOPIFY_STORE_NAME` - Your store name (e.g., `zakuccinos-coffee`)

#### How to Add in Vercel (via v0):

1. Click on the in-chat sidebar
2. Go to the **Vars** section
3. Add:
   - Key: `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   - Value: Your copied token
4. Click Save

#### Or via Vercel Dashboard:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add `SHOPIFY_STOREFRONT_ACCESS_TOKEN` with your token value
4. Redeploy your application

### 6. Verify Setup

After adding the environment variable:
1. Redeploy your application
2. Visit your homepage
3. You should see your Shopify products displayed

## Troubleshooting

**401 Unauthorized Error:**
- Double-check the `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is correct
- Make sure you're using the Storefront API token, not the Admin API token
- Verify the token has the required scopes enabled

**No products showing:**
- Ensure your products are published to the "Online Store" sales channel
- Check that products have inventory available
- Verify products have images uploaded

**Store domain issues:**
- Confirm `SHOPIFY_STORE_NAME` matches your actual store name
- It should be just the subdomain (e.g., `zakuccinos-coffee` not `zakuccinos-coffee.myshopify.com`)

## Security Notes

The Storefront API token is designed to be used in client-side applications. However, for best security practices, we keep all API calls server-side in this implementation. This token has very limited permissions and cannot:
- Access customer data
- Modify orders
- Access admin functions
- View private/unpublished content

It can only read public product and collection data.
