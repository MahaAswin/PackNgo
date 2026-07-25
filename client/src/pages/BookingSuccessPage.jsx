import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Home, Calendar, ArrowRight, ShieldCheck, User, CreditCard } from 'lucide-react';
import TopNavigation from '../components/TopNavigation';
import api from '../lib/axios';

export default function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [paymentId, setPaymentId] = useState(location.state?.paymentId || '');
  const [loading, setLoading] = useState(!booking);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!booking) {
      const bookingId = searchParams.get('bookingId');
      const payId = searchParams.get('paymentId');
      if (bookingId) {
        setPaymentId(payId || 'N/A');
        api.get(`/bookings/${bookingId}`)
          .then((res) => {
            setBooking(res.data);
          })
          .catch(() => {
            console.error('Failed to load booking details');
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, [booking, searchParams]);

  const handleDownloadInvoice = () => {
    setDownloading(true);
    setTimeout(() => {
      // Create a mock invoice download file
      const invoiceContent = `
=============================================
             PACKNGO INVOICE
=============================================
Booking ID:      ${booking?.id || 'N/A'}
Booking Date:    ${booking?.travelDate || 'N/A'}
Traveler Name:   ${booking?.user?.name || 'N/A'}
Traveler Email:  ${booking?.user?.email || 'N/A'}
Package Name:    ${booking?.travelPackage?.title || 'N/A'}
Destination:     ${booking?.travelPackage?.location || 'N/A'}
Guests:          ${booking?.guests || 1}
Meal Plan:       ${booking?.mealPlan || 'N/A'}
Hotel Type:      ${booking?.hotelType || 'N/A'}
Transport:       ${booking?.transportType || 'N/A'}
---------------------------------------------
Payment ID:      ${paymentId || 'N/A'}
Total Paid:      INR ${booking?.totalAmount?.toLocaleString() || '0'}
Payment Status:  SUCCESS
=============================================
       Thank you for traveling with us!
=============================================
`;
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_Booking_${booking?.id || 'Receipt'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <TopNavigation />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Booking Not Found</h2>
          <p className="mt-2 text-slate-500">We couldn't retrieve the details for this booking.</p>
          <Link to="/dashboard" className="btn-primary mt-6 inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const travelDateFormatted = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNavigation />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Top Success Banner */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
            >
              <CheckCircle2 size={36} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight">Booking Confirmed!</h1>
            <p className="mt-2 text-emerald-50">
              Your payment was verified, and your adventure is locked in.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Booking Details Card */}
            <div className="mb-8 rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking ID</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">#{booking.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Date</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Package Title</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.travelPackage?.title}</p>
                    <p className="text-xs text-slate-500">{booking.travelPackage?.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Traveler</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{booking.user?.name}</p>
                    <p className="text-xs text-slate-500">{booking.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Travel Date</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{travelDateFormatted}</p>
                    <p className="text-xs text-slate-500">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment ID</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white select-all">{paymentId || 'N/A'}</p>
                    <p className="text-xs text-emerald-600 font-bold dark:text-emerald-400">PAID VIA RAZORPAY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="mb-8 border-t border-slate-100 pt-6 dark:border-slate-800">
              <h3 className="mb-4 font-bold text-slate-900 dark:text-white">Amount Summary</h3>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Base Booking Package Charge</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Upgrade & Customizations</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Included</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-base dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">Amount Paid</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download size={16} />
                {downloading ? 'Generating Invoice...' : 'Download Invoice'}
              </button>

              <Link
                to="/dashboard"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Home size={16} />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
