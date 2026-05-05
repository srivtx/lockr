require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://test.dodopayments.com/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      billing: {
        city: "San Francisco",
        country: "US",
        state: "CA",
        street: "123 Market St",
        zipcode: "94105"
      },
      customer: {
        create_new_customer: true,
        email: "test@example.com",
        name: "Test Customer"
      },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID,
          quantity: 1,
          amount: 10000
        }
      ],
      payment_link: true,
      return_url: "https://example.com"
    })
  });
  console.log(res.status);
  console.log(await res.json());
}
test();
