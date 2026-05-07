import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function AddPackagePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', location: '', durationDays: 7, durationNights: 6,
    price: 1299, imageUrl: '', description: '', status: 'ACTIVE',
    mealOptions: ['Breakfast Included'],
    foodPreferences: ['Veg'],
    restaurantDetails: '',
    hotelTypes: ['3-Star'],
    transportTypes: ['Private SUV'],
    customizablePackage: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArray = (key, value) => setForm(f => ({
    ...f,
    [key]: f[key]?.includes(value) ? f[key].filter(i => i !== value) : [...(f[key] || []), value],
  }));
  const mealOptionList = ['Breakfast Included', 'Lunch Included', 'Dinner Included', 'All Meals Included'];
  const foodPreferenceList = ['Veg', 'Non-Veg', 'Vegan', 'Jain Food', 'Halal Food'];
  const hotelTypeOptions = ['3-Star', '4-Star', '5-Star', 'Boutique'];
  const transportTypeOptions = ['Shared Coach', 'Private SUV', 'Luxury Sedan', 'Flight'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) { setError('Title and location are required.'); return; }
    setLoading(true);
    try {
      await api.post('/packages', {
        ...form,
        createdById: user?.id,
        rating: 4.8,
        reviewsCount: 0,
        vendorName: user?.companyName || user?.name || 'Travel Partner',
        verified: user?.packagerStatus === 'approved',
        images: form.imageUrl ? [form.imageUrl] : [],
      });
      navigate('/packager');
    } catch {
      setError('Failed to create package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
        <Link to="/packager" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ChevronLeft size={16} /> Back
        </Link>
      </header>

      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300">
            <Sparkles size={12} /> New Listing
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Add New Package</h1>
          <p className="mt-1 text-sm text-slate-500">Travelers will see this on Explore after you publish.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

          {[
            { label: 'Trip Title', key: 'title', placeholder: 'e.g. Santorini Sunset Escapade' },
            { label: 'Destination', key: 'location', placeholder: 'Country or city' },
          ].map(f => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="input" required />
            </div>
          ))}

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Hero Image URL</label>
            <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://" className="input" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Days', key: 'durationDays' }, { label: 'Nights', key: 'durationNights' }, { label: 'Price (₹)', key: 'price' }].map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">{f.label}</label>
                <input type="number" min={0} value={form[f.key]} onChange={e => set(f.key, Number(e.target.value))} className="input" />
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              <option value="ACTIVE">Active</option>
              <option value="FEATURED">Featured</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" />
          </div>

          <div className="grid gap-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Meal Options</label>
                <span className="text-[10px] text-slate-400">Choose one or more</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mealOptionList.map(option => (
                  <button key={option} type="button" onClick={() => toggleArray('mealOptions', option)}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${form.mealOptions.includes(option) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Food Preference Options</label>
                <span className="text-[10px] text-slate-400">Optional</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {foodPreferenceList.map(option => (
                  <button key={option} type="button" onClick={() => toggleArray('foodPreferences', option)}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${form.foodPreferences.includes(option) ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Restaurant Details</label>
              <textarea rows={2} value={form.restaurantDetails} onChange={e => set('restaurantDetails', e.target.value)} className="input resize-none" placeholder="Partner restaurants, buffet concepts, local cuisine experience" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600 dark:text-slate-300">Customizable Package</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => set('customizablePackage', true)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${form.customizablePackage ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  Yes
                </button>
                <button type="button" onClick={() => set('customizablePackage', false)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${!form.customizablePackage ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                  No
                </button>
              </div>
            </div>

            {form.customizablePackage && (
              <>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Hotel Types</label>
                    <span className="text-[10px] text-slate-400">Available upgrades</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {hotelTypeOptions.map(option => (
                      <button key={option} type="button" onClick={() => toggleArray('hotelTypes', option)}
                        className={`rounded-2xl border px-3 py-2 text-sm transition ${form.hotelTypes.includes(option) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Transport Types</label>
                    <span className="text-[10px] text-slate-400">Available options</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {transportTypeOptions.map(option => (
                      <button key={option} type="button" onClick={() => toggleArray('transportTypes', option)}
                        className={`rounded-2xl border px-3 py-2 text-sm transition ${form.transportTypes.includes(option) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? 'Publishing...' : 'Publish Package'}
          </button>
        </form>
      </div>
    </div>
  );
}
