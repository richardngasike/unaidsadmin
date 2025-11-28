// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaUpload, FaFilePdf, FaSignOutAlt, FaSearch, FaTrash,
  FaMoon, FaSun, FaUser, FaChartBar, FaDownload, FaCalendarAlt,
  FaCloudUploadAlt, FaGlobeAmericas, FaUsers
} from 'react-icons/fa';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API_URL = "http://localhost:8000";
const CLIENT_PASSWORD = "16359101008";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [country, setCountry] = useState('');
  const [profileCountry, setProfileCountry] = useState('');
  const [file, setFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [uploadedList, setUploadedList] = useState([]);
  const [profileList, setProfileList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItems, setSelectedItems] = useState([]);
  const [lastLogin, setLastLogin] = useState('');

  const totalCountries = 195;
  const roadmapCount = uploadedList.length;
  const profileCount = profileList.length;
  const progress = Math.round((roadmapCount / totalCountries) * 100);

  const monthlyData = [
    { month: 'Jan', uploads: 12 }, { month: 'Feb', uploads: 19 }, { month: 'Mar', uploads: 28 },
    { month: 'Apr', uploads: 35 }, { month: 'May', uploads: 42 }, { month: 'Jun', uploads: 58 }
  ];

  const regionData = [
    { name: 'Africa', value: 54, color: '#4338ca' },
    { name: 'Asia', value: 48, color: '#6366f1' },
    { name: 'Europe', value: 44, color: '#8b5cf6' },
    { name: 'Americas', value: 35, color: '#ec4899' },
    { name: 'Oceania', value: 14, color: '#f59e0b' }
  ];

  const countries = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
    "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
    "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
    "Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
    "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
    "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
    "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
    "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
    "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
    "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
    "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
    "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
    "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
    "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia",
    "Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
    "Suriname","Sweden","Switzerland","Syria","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
    "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
    "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen","Zambia","Zimbabwe"
  ].sort();

  useEffect(() => {
    const saved = localStorage.getItem('unaids_admin_auth');
    const savedDark = localStorage.getItem('unaids_darkmode');
    const savedLogin = localStorage.getItem('unaids_last_login');
    if (saved === 'true') {
      setIsAuthenticated(true);
      setLastLogin(savedLogin || new Date().toLocaleString());
      fetchUploaded();
      fetchProfiles();
    }
    if (savedDark === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('unaids_darkmode', darkMode);
  }, [darkMode]);

  const login = (e) => {
    e.preventDefault();
    if (passwordInput === CLIENT_PASSWORD) {
      const now = new Date().toLocaleString();
      localStorage.setItem('unaids_admin_auth', 'true');
      localStorage.setItem('unaids_last_login', now);
      setIsAuthenticated(true);
      setLastLogin(now);
      toast.success('Welcome back!');
      fetchUploaded();
      fetchProfiles();
    } else {
      toast.error('Incorrect password');
    }
  };

  const logout = () => {
    localStorage.removeItem('unaids_admin_auth');
    setIsAuthenticated(false);
    toast.success('Logged out');
  };

  const fetchUploaded = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/roadmaps`);
      setUploadedList(res.data);
    } catch (err) {
      console.warn('Roadmaps not available');
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/profiles`);
      setProfileList(res.data);
    } catch (err) {
      console.warn('Profiles not available');
    }
  };

  const handleRoadmapUpload = async (e) => {
    e.preventDefault();
    if (!file || !country) return toast.error('Select country & PDF');
    const slug = country.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const formData = new FormData();
    formData.append("file", file);
    formData.append("country_slug", slug);
    formData.append("country_name", country);

    try {
      await axios.post(`${API_URL}/api/upload`, formData);
      toast.success(`${country} roadmap uploaded!`);
      setFile(null); setCountry(''); e.target.reset();
      fetchUploaded();
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleProfileUpload = async (e) => {
    e.preventDefault();
    if (!profileFile || !profileCountry) return toast.error('Select country & PDF');
    const slug = profileCountry.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const formData = new FormData();
    formData.append("file", profileFile);
    formData.append("country_slug", slug);
    formData.append("country_name", profileCountry);

    try {
      await axios.post(`${API_URL}/api/upload-profile`, formData);
      toast.success(`${profileCountry} profile uploaded!`);
      setProfileFile(null); setProfileCountry(''); e.target.reset();
      fetchProfiles();
    } catch (err) {
      toast.error('Profile upload failed');
    }
  };

  const deleteRoadmap = async (slug) => {
    if (!confirm('Delete roadmap?')) return;
    await axios.delete(`${API_URL}/api/delete/${slug}`);
    toast.success('Deleted');
    fetchUploaded();
  };

  const deleteProfile = async (slug) => {
    if (!confirm('Delete profile?')) return;
    await axios.delete(`${API_URL}/api/delete-profile/${slug}`);
    toast.success('Profile deleted');
    fetchProfiles();
  };

  const exportCSV = () => {
    const csv = "Type,Country,Slug,Date\n" +
      uploadedList.map(i => `Roadmap,${i.country_name},${i.country_slug},${new Date(i.uploaded_at).toLocaleDateString()}`).join("\n") + "\n" +
      profileList.map(i => `Profile,${i.country_name},${i.country_slug},${new Date(i.uploaded_at).toLocaleDateString()}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `unaids-documents-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const filteredList = uploadedList.filter(item =>
    item.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="login-page">
          <div className="login-overlay" />
          <div className="login-box">
            <Image src="/logounaids.svg" alt="UNAIDS" width={250} height={250} priority />
            <p className="portal-title">Sustainability Admin Portal</p>
            <form onSubmit={login}>
              <input type="password" placeholder="Enter password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required />
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className={`container ${darkMode ? 'dark' : ''}`}>
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <Image src="/logounaids.svg" alt="UNAIDS" width={150} height={150} priority />
            <p className="portal-subtitle"> Admin Portal</p>
          </div>

          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <FaChartBar /> Dashboard
            </div>
            <div className={`nav-item ${activeTab === 'upload-roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('upload-roadmap')}>
              <FaUpload /> Upload Roadmap
            </div>
            <div className={`nav-item ${activeTab === 'upload-profile' ? 'active' : ''}`} onClick={() => setActiveTab('upload-profile')}>
              <FaUsers /> Upload Country Profile
            </div>
            <div className={`nav-item ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
              <FaFilePdf /> All Documents ({roadmapCount + profileCount})
            </div>
          </nav>

          <div className="sidebar-bottom">
            <div className="admin-info">
              <FaUser /> Admin
              {lastLogin && <small><FaCalendarAlt /> {lastLogin.split(',')[0]}</small>}
            </div>
            <div className="bottom-actions">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-btn">
                {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light' : 'Dark'}
              </button>
              <button className="logout-btn" onClick={logout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              <h1 className="page-title">Dashboard Overview</h1>
              <div className="stats-grid">
                <div className="stat-card"><FaGlobeAmericas className="icon large" /><h3>Total Countries</h3><h2>{totalCountries}</h2></div>
                <div className="stat-card success"><FaFilePdf className="icon large" /><h3>Roadmaps</h3><h2>{roadmapCount}</h2></div>
                <div className="stat-card warning"><FaUsers className="icon large" /><h3>Profiles</h3><h2>{profileCount}</h2></div>
                <div className="stat-card progress">
                  <svg className="circular" viewBox="0 0 36 36">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage">{progress}%</text>
                  </svg>
                  <h3>Roadmap Progress</h3>
                </div>
              </div>
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Upload Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="uploads" stroke="#4338ca" strokeWidth={4} /></LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h3>By Region</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart><Pie data={regionData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>{regionData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Upload Roadmap */}
          {activeTab === 'upload-roadmap' && (
            <div className="upload-page">
              <h1 className="page-title">Upload Sustainability Roadmap</h1>
              <div className="upload-card">
                <form onSubmit={handleRoadmapUpload}>
                  <div className="dropzone" onClick={() => document.getElementById('roadmap-file').click()}>
                    <FaCloudUploadAlt className="upload-icon" />
                    <p>{file ? file.name : 'Drop Roadmap PDF here or click'}</p>
                    <input id="roadmap-file" type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} required />
                  </div>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} required>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="btn-upload full">Upload Roadmap</button>
                </form>
              </div>
            </div>
          )}

          {/* Upload Country Profile */}
          {activeTab === 'upload-profile' && (
            <div className="upload-page">
              <h1 className="page-title">Upload Country Profile</h1>
              <div className="upload-card">
                <form onSubmit={handleProfileUpload}>
                  <div className="dropzone" onClick={() => document.getElementById('profile-file').click()}>
                    <FaCloudUploadAlt className="upload-icon" />
                    <p>{profileFile ? profileFile.name : 'Drop Country Profile PDF here or click'}</p>
                    <input id="profile-file" type="file" accept=".pdf" hidden onChange={(e) => setProfileFile(e.target.files[0])} required />
                  </div>
                  <select value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} required>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" className="btn-upload full">Upload Profile</button>
                </form>
              </div>
            </div>
          )}

          {/* All Documents */}
          {activeTab === 'list' && (
            <div>
              <div className="list-header">
                <h1>All Documents ({roadmapCount + profileCount})</h1>
                <button onClick={exportCSV} className="btn-secondary"><FaDownload /> Export CSV</button>
              </div>
              <div className="search-box">
                <FaSearch />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="roadmap-grid">
                {uploadedList.map(item => (
                  <div key={item.id} className="roadmap-item">
                    <div><h3>{item.country_name}</h3><p>Roadmap • {new Date(item.uploaded_at).toLocaleDateString()}</p></div>
                    <div className="actions">
                      <a href={`${API_URL}/roadmaps/${item.country_slug}.pdf`} target="_blank" className="btn-view">View</a>
                      <button onClick={() => deleteRoadmap(item.country_slug)} className="btn-delete"><FaTrash /></button>
                    </div>
                  </div>
                ))}
                {profileList.map(item => (
                  <div key={item.id} className="roadmap-item profile">
                    <div><h3>{item.country_name}</h3><p>Country Profile • {new Date(item.uploaded_at).toLocaleDateString()}</p></div>
                    <div className="actions">
                      <a href={`${API_URL}/profiles/${item.country_slug}.pdf`} target="_blank" className="btn-view">View</a>
                      <button onClick={() => deleteProfile(item.country_slug)} className="btn-delete"><FaTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}