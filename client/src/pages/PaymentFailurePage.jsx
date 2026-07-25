import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import { useLocale } from '../context/LocaleContext';
import { loadRazorpay } from '../lib/razorpay';
import api from '../lib/axios';

export default function PaymentFailurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const [booking] = useState(location.state?.booking || null);
  const [errorMessage] = useState(location.state?.error || 'Your transaction could not be processed.');
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');

  const handleRetryPayment = async () => {
    if (!booking) {
      setError('No booking details found. Please try booking from the package page.');
      return;
    }

    setRetrying(true);
    setError('');

    try {
      // 1. Create a new Razorpay Order for this booking ID
      const orderRes = await api.post('/payment/create-order', {
        bookingId: booking.id,
      });
      const orderData = orderRes.data;

      // 2. Load Razorpay SDK script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay SDK. Please check your internet connection.');
        setRetrying(false);
        return;
      }

      // 3. Configure Checkout Options
      const options = {
        key: (import.meta.env.VITE_RAZORPAY_KEY && import.meta.env.VITE_RAZORPAY_KEY !== 'rzp_test_xxxxxxxxx') ? import.meta.env.VITE_RAZORPAY_KEY : orderData.key,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency,
        name: 'PackNgo',
        description: `Booking for ${booking.travelPackage?.title || 'Travel Package'}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setRetrying(true);
            // 4. Verify payment signature on backend
            const verifyRes = await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              navigate('/booking-success', {
                state: {
                  booking: booking,
                  paymentId: response.razorpay_payment_id,
                },
                replace: true,
              });
            } else {
              setError('Payment verification failed.');
              setRetrying(false);
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
            setRetrying(false);
          }
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
        },
        theme: {
          color: '#2563EB', // Blue-600
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled by user.');
            setRetrying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data || 'Failed to initialize payment retry. Please try again.');
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavigation />

      <main className="mx-auto max-w-md px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30">
            <XCircle size={40} className="text-rose-600" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment Failed</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {errorMessage}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {booking && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Summary</p>
              <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {booking.travelPackage?.title}
              </h4>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Guests: {booking.guests}</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(booking.totalAmount)}</span>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            {booking && (
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                {retrying ? 'Retrying Payment...' : 'Retry Payment'}
              </button>
            )}

            <Link
              to="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={16} />
              Go Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
