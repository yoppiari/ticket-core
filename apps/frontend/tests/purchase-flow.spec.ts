import { test, expect } from '@playwright/test';

test.describe('Ticket Purchase Flow', () => {

    test('User can purchase a ticket successfully', async ({ page }) => {
        // 1. Mock API Responses to ensure deterministic testing

        // Mock Event Details
        await page.route('**/api/public/events/demo-event', async route => {
            const json = {
                event: {
                    name: 'Ticketing Demo 2026',
                    start_date: new Date().toISOString(),
                    venue_name: 'Test Venue',
                    ticket_types: [{
                        id: 'ticket-1',
                        name: 'General Admission',
                        price: 150000,
                        stock: 100,
                        sale_start_date: new Date().toISOString(),
                    }]
                },
                tenant: {
                    name: 'Demo Organizer',
                    branding: { primary_color: '#3b82f6' }
                },
                isQueued: false
            };
            await route.fulfill({ json });
        });

        // Mock Seats
        await page.route('**/api/public/events/demo-event/seats', async route => {
            const json = {
                seats: [
                    { id: 'seat-1', label: 'A1', status: 'available', row: 0, column: 0 },
                    { id: 'seat-2', label: 'A2', status: 'reserved', row: 0, column: 1 },
                ]
            };
            await route.fulfill({ json });
        });

        // Mock Reservation
        await page.route('**/api/public/events/demo-event/reservations', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    expires_at: new Date(Date.now() + 10 * 60000).toISOString()
                }
            });
        });

        // Mock Checkout Initiation
        await page.route('**/api/public/events/demo-event/checkout', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    order_id: 'order-123'
                }
            });
        });

        // Mock Order Details (Checkout Page)
        await page.route('**/api/public/events/demo-event/checkout/order-123', async route => {
            await route.fulfill({
                json: {
                    id: 'order-123',
                    status: 'pending',
                    total_amount: 150000,
                    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
                    items: [
                        { id: 'item-1', item_type: 'seat', unit_price: 150000, details: { label: 'A1', ticket_type: { name: 'General Admission' } } }
                    ]
                }
            });
        });

        // Mock Payment
        await page.route('**/api/public/events/demo-event/checkout/order-123/pay', async route => {
            await route.fulfill({
                json: {
                    success: true,
                    redirect_url: '/dummy-payment-gateway' // In real app, this goes to Midtrans
                }
            });
        });


        // 2. Start Test Journey
        await page.goto('/demo/e/demo-event');

        // Assert Event Page Loaded
        await expect(page.getByText('Ticketing Demo 2026')).toBeVisible();
        await expect(page.getByText('Demo Organizer').first()).toBeVisible();

        // 3. Select Seat
        // We now use the accessibility buttons injected into Shadow DOM
        const seatBtn = page.getByTestId('seat-A1');
        await seatBtn.waitFor();
        await seatBtn.evaluate((node: HTMLElement) => node.click());

        // 4. Reserve
        await page.getByRole('button', { name: 'Reserve Now' }).click();

        // 5. Proceed
        await expect(page.getByText('Reserved Seat')).toBeVisible();
        await page.getByRole('button', { name: 'Proceed to Add-ons' }).click();
        await page.getByRole('button', { name: 'Proceed to Checkout' }).click();

        // 6. Verify Checkout Page
        await expect(page).toHaveURL(/\/checkout\/order-123/);
        await expect(page.getByText('Order Summary')).toBeVisible();
        await expect(page.getByText('A1')).toBeVisible();
        await expect(page.getByText('General Admission')).toBeVisible();
        await expect(page.getByText('Rp', { exact: false }).first()).toBeVisible();
        await expect(page.getByText('Transaction ID: order')).toBeVisible();

        // 7. Pay
        const payButton = page.getByRole('button', { name: 'Pay Now' });
        await payButton.click();

        // 8. Verify Payment Redirect
        await expect(page).toHaveURL(/\/dummy-payment-gateway/);

        // 9. Simulate User Returning from Payment Gateway
        // In a real flow, Midtrans or the user redirects back to the order page.
        await page.goto('/demo/e/demo-event/checkout/order-123');

        // 10. Simulate Successful Payment Callback (via polling update)
        // Note: The mock route is already active (Stay active for all requests)
        // But we need to make sure the order status is 'paid' for future requests.
        await page.route('**/api/public/events/demo-event/checkout/order-123', async route => {
            await route.fulfill({
                json: {
                    id: 'order-123',
                    status: 'paid', // STATUS UPDATED TO PAID
                    total_amount: 150000,
                    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
                    items: [
                        { id: 'item-1', item_type: 'seat', unit_price: 150000, details: { label: 'A1', ticket_type: { name: 'General Admission' } } }
                    ]
                }
            });
        });

        // 11. Verify Confirmation State
        // The page polls every 3s.
        await expect(page.getByText('Order Confirmed!')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Your tickets have been issued.')).toBeVisible();

        console.log('E2E Purchase Flow Verified Successfully');
    });
});
