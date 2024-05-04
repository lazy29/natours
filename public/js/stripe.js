import axios from 'axios';

import { showToaster } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51PCIY5SDZBOiVWgf5Q5bL37KDIpOPOcYACUeXC2UBC46rM0Z6PL8HJkUlIJ97loYm0lD1tb17Occok6fXZOTGCjJ00kBM5ucbU',
    );

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);

    showToaster('error', err);
  }
};
