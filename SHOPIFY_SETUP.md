# Shopify Integration Setup Guide

This guide will help you set up the Shopify integration for the Coffee Freeze-Drying Order Management App.

## Prerequisites

- A Shopify store (any plan)
- Admin access to your Shopify store

## Step 1: Create a Custom App

1. Log in to your Shopify admin panel
2. Go to **Settings** → **Apps and sales channels**
3. Click **Develop apps** → **Create an app**
4. Name your app (e.g., "Freeze Dryer Order System")
5. Click **Create app**

## Step 2: Configure API Scopes

1. Click **Configure Admin API scopes**
2. Select the following scopes:
   - `write_draft_orders` - Create draft orders
   - `read_draft_orders` - Read draft order details
   - `write_orders` - Create and update orders
   - `read_orders` - Read order details
   - `read_customers` - Read customer information
   - `write_customers` - Create customers

3. Click **Save**

## Step 3: Install the App

1. Click **Install app**
2. Confirm the installation

## Step 4: Get API Credentials

1. After installation, you'll see the **API credentials** tab
2. Copy the **Admin API access token** - this is your `SHOPIFY_ADMIN_ACCESS_TOKEN`
3. Your store name is the subdomain of your store URL (e.g., if your store is `my-coffee-shop.myshopify.com`, then `SHOPIFY_STORE_NAME=my-coffee-shop`)

## Step 5: Set Up Webhooks

1. In your custom app, go to **API credentials**
2. Scroll down to **Webhooks**
3. Click **Create webhook**

### Webhook 1: Orders Paid
- **Event**: `orders/paid`
- **URL**: `https://your-domain.com/api/shopify/webhook`
- **Format**: JSON
- **API version**: 2024-01

### Webhook 2: Orders Fulfilled
- **Event**: `orders/fulfilled`
- **URL**: `https://your-domain.com/api/shopify/webhook`
- **Format**: JSON
- **API version**: 2024-01

4. After creating the webhooks, copy the **Webhook signing secret** - this is your `SHOPIFY_WEBHOOK_SECRET`

## Step 6: Add Environment Variables

Add these environment variables to your Vercel project or `.env` file:

\`\`\`env
SHOPIFY_STORE_NAME=your-store-name
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
\`\`\`

## Step 7: Configure Shopify Products (Optional)

If you want to use specific Shopify products instead of dynamic pricing:

1. Create a product in Shopify for "Freeze-Dried Coffee"
2. Create variants for different quantities (1kg, 2kg, etc.)
3. Note the variant IDs
4. Update the `createShopifyDraftOrder` function in `lib/shopify/client.ts` to use variant IDs

## Testing

1. Create a test order in your app
2. Complete the order processing
3. Click "Create Shopify Checkout" from the admin panel
4. Verify the draft order is created in Shopify
5. Complete the checkout (use Shopify test mode)
6. Verify the webhook updates the order status

## Troubleshooting

### "Shopify configuration missing" error
- Verify environment variables are set correctly
- Restart your application after adding env vars

### Draft order creation fails
- Check API scopes are configured correctly
- Verify the access token is valid
- Ensure client shipping address is complete

### Webhooks not working
- Verify webhook URL is publicly accessible
- Check webhook signature is being validated correctly
- Review webhook logs in Shopify admin

## Production Checklist

- [ ] Custom app installed and configured
- [ ] API credentials added to environment variables
- [ ] Webhooks configured and tested
- [ ] Product catalog set up in Shopify
- [ ] Test orders completed successfully
- [ ] Email notifications working
- [ ] SSL certificate active on webhook endpoint
\`\`\`
