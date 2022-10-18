const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // ^5.13.15
  // const tour = {
  //   _id: '5c88fa8cf4afda39709c2955',
  //   startLocation: {
  //     description: 'Miami, USA',
  //     type: 'Point',
  //     coordinates: [-80.185942, 25.774772],
  //     address: '301 Biscayne Blvd, Miami, FL 33132, USA'
  //   },
  //   ratingsAverage: 4.8,
  //   ratingsQuantity: 6,
  //   images: ['tour-2-1.jpg', 'tour-2-2.jpg', 'tour-2-3.jpg'],
  //   startDates: [
  //     '2021-06-19T09:00:00.000Z',
  //     '2021-07-20T09:00:00.000Z',
  //     '2021-08-18T09:00:00.000Z'
  //   ],
  //   name: 'The Sea Explorer',
  //   duration: 7,
  //   maxGroupSize: 15,
  //   difficulty: 'medium',
  //   guides: ['5c8a22c62f8fb814b56fa18b', '5c8a1f4e2f8fb814b56fa185'],
  //   price: 497,
  //   summary: 'Exploring the jaw-dropping US east coast by foot and by boat',
  //   description:
  //     'Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nIrure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  //   imageCover: 'tour-2-cover.jpg',
  //   locations: [
  //     {
  //       _id: '5c88fa8cf4afda39709c2959',
  //       description: 'Lummus Park Beach',
  //       type: 'Point',
  //       coordinates: [-80.128473, 25.781842],
  //       day: 1
  //     },
  //     {
  //       _id: '5c88fa8cf4afda39709c2958',
  //       description: 'Islamorada',
  //       type: 'Point',
  //       coordinates: [-80.647885, 24.909047],
  //       day: 2
  //     },
  //     {
  //       _id: '5c88fa8cf4afda39709c2957',
  //       description: 'Sombrero Beach',
  //       type: 'Point',
  //       coordinates: [-81.0784, 24.707496],
  //       day: 3
  //     },
  //     {
  //       _id: '5c88fa8cf4afda39709c2956',
  //       description: 'West Key',
  //       type: 'Point',
  //       coordinates: [-81.768719, 24.552242],
  //       day: 5
  //     }
  //   ],
  //   slug: 'the-sea-explorer'
  // };
  console.log('Req Params', req.params.tourId);
  console.log(typeof req.params.tourId);
  console.log('Tour', tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          },
          unit_amount: tour.price * 100
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
