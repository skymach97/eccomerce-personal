import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51JG1qXKUkCNFWE4OUbi2rA9M8qJfqOuCFRPdnTHNTUsVpOzdUPDkXWbznHWGG417sdG9Sl4dBjEECMvU7WjbkDAL00viRvassn'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
