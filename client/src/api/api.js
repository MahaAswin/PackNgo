import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiRegister = (data) => api.post('/users/register', data).then(r => r.data);
export const apiLogin    = (data) => api.post('/users/login', data).then(r => r.data);
export const apiGetUser  = (id)   => api.get(`/users/${id}`).then(r => r.data);

// ── Packages ──────────────────────────────────────────────────────────────────
export const apiGetPackages   = ()   => api.get('/packages').then(r => r.data);
export const apiGetPackage    = (id) => api.get(`/packages/${id}`).then(r => r.data);
export const apiCreatePackage = (d)  => api.post('/packages', d).then(r => r.data);
export const apiUpdatePackage = (id, d) => api.patch(`/packages/${id}`, d).then(r => r.data);
export const apiDeletePackage = (id) => api.delete(`/packages/${id}`);

// ── Bookings ──────────────────────────────────────────────────────────────────
export const apiGetBookings   = (userId) => api.get(`/bookings/user/${userId}`).then(r => r.data);
export const apiCreateBooking = (d)      => api.post('/bookings', d).then(r => r.data);

// ── Feedback & Complaints ─────────────────────────────────────────────────────
export const apiSubmitFeedback = (d) => api.post('/feedback', d).then(r => r.data);
export const apiGetPackagerFeedback = (packagerId) => api.get(`/feedback/packager/${packagerId}`).then(r => r.data);
export const apiGetAllFeedback = () => api.get('/feedback').then(r => r.data);

export const apiSubmitComplaint = (d) => api.post('/complaints', d).then(r => r.data);
export const apiGetComplaints = () => api.get('/complaints').then(r => r.data);
export const apiUpdateComplaintStatus = (id, d) => api.patch(`/complaints/${id}/status`, d).then(r => r.data);

export default api;
