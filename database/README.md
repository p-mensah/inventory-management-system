# Database Setup Instructions

## Supabase Configuration

This project uses Supabase as the backend database. Follow these steps to set up the database:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Schema SQL

1. Open `database/schema.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run**

This will create all the necessary tables:
- `profiles` - User profiles (extends auth.users)
- `products` - Inventory products
- `suppliers` - Supplier information  
- `transactions` - Sales, purchases, and adjustments
- `audit_logs` - System audit trail
- `purchase_orders` - Purchase order management

### Step 3: Run the Seed Data (Optional)

To populate the database with sample data for testing:

1. Open `database/seed.sql`
2. Copy the entire contents
3. Paste into a new Supabase SQL Editor query
4. Click **Run**

This adds:
- 5 sample suppliers
- 21 sample products across various categories
- Sample transactions from the past week
- Sample audit logs
- Sample purchase orders

### Step 4: Create an Admin User

1. Go to **Authentication** in Supabase
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@jubel.com`
   - Password: Your choice (min 6 characters)
4. After creating, run this SQL to make them admin:

```sql
UPDATE public.profiles 
SET role = 'Admin', full_name = 'Admin User' 
WHERE email = 'admin@jubel.com';
```

### Environment Variables

Make sure your `.env` file has:

```
VITE_SUPABASE_URL=https://hwnjplekisazzfizacsy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Row Level Security (RLS)

The schema includes RLS policies that:
- Allow authenticated users to read all data
- Allow staff to create transactions and manage products
- Protect user profiles so users can only edit their own

### Troubleshooting

**"permission denied" errors**: Make sure RLS is enabled and policies are created correctly.

**"relation does not exist" errors**: Run the schema.sql first before seed.sql.

**Empty data after running seed**: Check the Supabase logs for any SQL errors.
