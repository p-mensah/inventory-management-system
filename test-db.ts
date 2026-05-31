// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwnjplekisazzfizacsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmpwbGVraXNhenpmaXphY3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzY0ODcsImV4cCI6MjA4MTcxMjQ4N30.ozZs3NO3q9wg6lV7wgZCT57BOXLivz1LXq1OZbGLMPI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔄 Testing Supabase connection...\n');

    try {
        // Test 1: Check profiles table
        console.log('1️⃣ Checking profiles table...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(5);

        if (profilesError) {
            console.log('   ❌ Profiles table error:', profilesError.message);
        } else {
            console.log(`   ✅ Profiles table exists - ${profiles?.length || 0} records found`);
            if (profiles && profiles.length > 0) {
                console.log('   Sample columns:', Object.keys(profiles[0]).join(', '));
            }
        }

        // Test 2: Check products table
        console.log('\n2️⃣ Checking products table...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(5);

        if (productsError) {
            console.log('   ❌ Products table error:', productsError.message);
        } else {
            console.log(`   ✅ Products table exists - ${products?.length || 0} records found`);
            if (products && products.length > 0) {
                console.log('   Sample product:', products[0].name);
            }
        }

        // Test 3: Check transactions table
        console.log('\n3️⃣ Checking transactions table...');
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .limit(5);

        if (transactionsError) {
            console.log('   ❌ Transactions table error:', transactionsError.message);
        } else {
            console.log(`   ✅ Transactions table exists - ${transactions?.length || 0} records found`);
        }

        // Test 4: Check suppliers table
        console.log('\n4️⃣ Checking suppliers table...');
        const { data: suppliers, error: suppliersError } = await supabase
            .from('suppliers')
            .select('*')
            .limit(5);

        if (suppliersError) {
            console.log('   ❌ Suppliers table error:', suppliersError.message);
        } else {
            console.log(`   ✅ Suppliers table exists - ${suppliers?.length || 0} records found`);
        }

        // Test 5: Check audit_logs table
        console.log('\n5️⃣ Checking audit_logs table...');
        const { data: auditLogs, error: auditLogsError } = await supabase
            .from('audit_logs')
            .select('*')
            .limit(5);

        if (auditLogsError) {
            console.log('   ❌ Audit logs table error:', auditLogsError.message);
        } else {
            console.log(`   ✅ Audit logs table exists - ${auditLogs?.length || 0} records found`);
        }

        // Test 6: Check purchase_orders table
        console.log('\n6️⃣ Checking purchase_orders table...');
        const { data: purchaseOrders, error: poError } = await supabase
            .from('purchase_orders')
            .select('*')
            .limit(5);

        if (poError) {
            console.log('   ❌ Purchase orders table error:', poError.message);
        } else {
            console.log(`   ✅ Purchase orders table exists - ${purchaseOrders?.length || 0} records found`);
        }

        console.log('\n✅ Connection test complete!');

    } catch (error) {
        console.error('❌ Connection failed:', error);
    }
}

testConnection();
