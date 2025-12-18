# Database Migration Required

## Important: Shipping and Tracking Features

The shipping address and order tracking features require running database migration script `012_add_shipping_and_tracking_fields.sql`.

### To Enable These Features:

1. Navigate to the **scripts** folder in your code
2. Run the migration script: `scripts/012_add_shipping_and_tracking_fields.sql`
3. This will add the following columns to your database:
   - **profiles table**: shipping address fields (line1, line2, city, state, postal_code, country)
   - **orders table**: tracking fields (tracking_number, package_received, shopify integration fields, order_stage)

### Running the Script in v0:

The script can be executed directly in the v0 interface. Look for the "Run" button when viewing the SQL file.

### Current Status (Temporary Workaround):

**The application will continue to work without the migration, but with limited functionality:**

- **Shopify Checkout Creation**: Uses fallback/placeholder shipping addresses until migration is run
- **Client Profile Updates**: Only updates name, phone, and company fields
- **Order Tracking**: Limited tracking capabilities

### Features Enabled After Migration:

- ✅ Full client shipping address management
- ✅ Order tracking number submission
- ✅ Package received confirmation  
- ✅ Complete Shopify checkout integration with real shipping addresses
- ✅ Detailed order stage tracking (freezing, drying, finishing, etc.)
- ✅ Email notifications at each processing stage

**Recommendation**: Run the migration as soon as possible to enable all features and ensure accurate shipping information is captured for Shopify orders.
