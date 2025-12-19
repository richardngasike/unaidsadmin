// src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaUpload, FaFilePdf, FaSignOutAlt, FaSearch, FaTrash, FaTrashAlt,
  FaMoon, FaSun, FaUser, FaChartBar, FaDownload, FaCalendarAlt,
  FaCloudUploadAlt, FaGlobeAmericas, FaUsers, FaBars, FaTimes,
  FaSpinner, FaArrowUp, FaArrowDown, FaDesktop, FaMobileAlt,
  FaTachometerAlt, FaClock
} from 'react-icons/fa';
import Image from 'next/image';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API_URL = "https://unaids-fastapi-backend.onrender.com";
const CLIENT_PASSWORD = "16359101008";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [uploading, setUploading] = useState(false);

  const totalCountries = 195;
  const roadmapCount = uploadedList.length;
  const profileCount = profileList.length;
  const progress = Math.round((roadmapCount / totalCountries) * 100);

  // Mock Analytics Data (i will replace with API later)
  const analyticsData = {
    totalVisitors: 28492,
    uniqueVisitors: 18921,
    totalDownloads: 8471,
    avgSessionDuration: "4m 32s",
    bounceRate: "38.2%",
    pageViews: 124892,
    performance: {
      lcp: { value: "1.8s", status: "good" },
      fid: { value: "12ms", status: "good" },
      cls: { value: "0.04", status: "good" }
    }
  };

  const trafficSources = [
    { name: "Direct", value: 38, color: "#4338ca" },
    { name: "Organic Search", value: 42, color: "#6366f1" },
    { name: "Social Media", value: 15, color: "#8b5cf6" },
    { name: "Referral", value: 5, color: "#ec4899" }
  ];

  const deviceData = [
    { name: "Desktop", value: 68, color: "#4338ca" },
    { name: "Mobile", value: 29, color: "#6366f1" },
    { name: "Tablet", value: 3, color: "#8b5cf6" }
  ];

  const monthlyVisitors = [
    { month: "Jan", visitors: 8921 },
    { month: "Feb", visitors: 10234 },
    { month: "Mar", visitors: 11892 },
    { month: "Apr", visitors: 13921 },
    { month: "May", visitors: 16892 },
    { month: "Jun", visitors: 18492 }
  ];

  const topCountries = [
    { flag: "https://flagcdn.com/us.svg", name: "United States", visits: 8921, percentage: 31.3 },
    { flag: "https://flagcdn.com/in.svg", name: "India", visits: 5218, percentage: 18.3 },
    { flag: "https://flagcdn.com/gb.svg", name: "United Kingdom", visits: 3182, percentage: 11.2 },
    { flag: "https://flagcdn.com/ng.svg", name: "Nigeria", visits: 2891, percentage: 10.1 },
    { flag: "https://flagcdn.com/ke.svg", name: "Kenya", visits: 2145, percentage: 7.5 },
    { flag: "https://flagcdn.com/za.svg", name: "South Africa", visits: 1892, percentage: 6.6 },
    { flag: "https://flagcdn.com/br.svg", name: "Brazil", visits: 1567, percentage: 5.5 },
    { flag: "https://flagcdn.com/fr.svg", name: "France", visits: 1321, percentage: 4.6 }
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
      toast.success('Welcome back, Admin!');
      fetchUploaded();
      fetchProfiles();
    } else {
      toast.error('Incorrect password');
    }
  };

  const logout = () => {
    localStorage.removeItem('unaids_admin_auth');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
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
    setUploading(true);
    const slug = country.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const formData = new FormData();
    formData.append("file", file);
    formData.append("country_slug", slug);
    formData.append("country_name", country);

    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${country} roadmap uploaded!`);
      setFile(null); setCountry(''); e.target.reset();
      fetchUploaded();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpload = async (e) => {
    e.preventDefault();
    if (!profileFile || !profileCountry) return toast.error('Select country & PDF');
    setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  const deleteRoadmap = async (slug) => {
    if (!confirm('Delete this roadmap?')) return;
    await axios.delete(`${API_URL}/api/delete/${slug}`);
    toast.success('Roadmap deleted');
    fetchUploaded();
  };

  const deleteProfile = async (slug) => {
    if (!confirm('Delete this profile?')) return;
    await axios.delete(`${API_URL}/api/delete-profile/${slug}`);
    toast.success('Profile deleted');
    fetchProfiles();
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkDelete = async () => {
    if (selectedItems.length === 0) return toast.error("No items selected");
    if (!confirm(`Delete ${selectedItems.length} items?`)) return;

    for (const id of selectedItems) {
      const item = [...uploadedList, ...profileList].find(i => i.id === id);
      if (item.country_slug.includes('-profile')) {
        await axios.delete(`${API_URL}/api/delete-profile/${item.country_slug.replace('-profile', '')}`);
      } else {
        await axios.delete(`${API_URL}/api/delete/${item.country_slug}`);
      }
    }
    toast.success("Bulk delete completed");
    setSelectedItems([]);
    fetchUploaded();
    fetchProfiles();
  };

  const exportCSV = () => {
    const csv = "Type,Country,Slug,Date,Size(KB)\n" +
      uploadedList.map(i => `Roadmap,${i.country_name},${i.country_slug},${new Date(i.uploaded_at).toLocaleDateString()},${i.file_size_kb}`).join("\n") + "\n" +
      profileList.map(i => `Profile,${i.country_name},${i.country_slug},${new Date(i.uploaded_at).toLocaleDateString()},${i.file_size_kb}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `unaids-documents-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const allDocuments = [...uploadedList.map(i => ({...i, type: 'Roadmap'})), ...profileList.map(i => ({...i, type: 'Profile'}))];
  const filteredList = allDocuments.filter(item =>
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
            <p className="portal-title">Sustainability Portal</p>
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
      <div className={`container ${darkMode ? 'dark' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
        
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Image src="/logounaids.svg" alt="UNAIDS" width={200} height={100} priority />
            <p className="portal-subtitle">Admin Portal</p>
          </div>

          <nav className="nav-menu">
            <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}}>
              <FaChartBar /> Dashboard
            </div>
            <div className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => {setActiveTab('analytics'); setSidebarOpen(false);}}>
              <FaTachometerAlt /> Analytics
            </div>
            <div className={`nav-item ${activeTab === 'upload-roadmap' ? 'active' : ''}`} onClick={() => {setActiveTab('upload-roadmap'); setSidebarOpen(false);}}>
              <FaUpload /> Upload Roadmap
            </div>
            <div className={`nav-item ${activeTab === 'upload-profile' ? 'active' : ''}`} onClick={() => {setActiveTab('upload-profile'); setSidebarOpen(false);}}>
              <FaUsers /> Upload Profile
            </div>
            <div className={`nav-item ${activeTab === 'list' ? 'active' : ''}`} onClick={() => {setActiveTab('list'); setSidebarOpen(false);}}>
              <FaFilePdf /> All Documents ({roadmapCount + profileCount})
            </div>
          </nav>
        </aside>

        <div className="main-wrapper">
          <header className="main-header">
            <h1>Admin Portal</h1>
            <div className="header-user-info">
              <FaUser /> <strong>Admin</strong>
              <small><FaCalendarAlt /> {lastLogin.split(',')[0]}</small>
            </div>
            <div className="header-actions">
              <button onClick={() => setDarkMode(!darkMode)} className="theme-btn">
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <button className="logout-btn" onClick={logout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </header>

          <main className="main-content">

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <>
                <h1 className="page-title">Website Analytics</h1>

                <div className="analytics-stats">
                  <div className="analytics-card">
                    <FaGlobeAmericas className="icon" />
                    <h3>Total Visitors</h3>
                    <div className="value">{analyticsData.totalVisitors.toLocaleString()}</div>
                    <div className="trend up"><FaArrowUp /> +12.4%</div>
                  </div>
                  <div className="analytics-card">
                    <FaUsers className="icon" />
                    <h3>Unique Visitors</h3>
                    <div className="value">{analyticsData.uniqueVisitors.toLocaleString()}</div>
                    <div className="trend up"><FaArrowUp /> +8.9%</div>
                  </div>
                  <div className="analytics-card">
                    <FaDownload className="icon" />
                    <h3>Total Downloads</h3>
                    <div className="value">{analyticsData.totalDownloads.toLocaleString()}</div>
                    <div className="trend up"><FaArrowUp /> +23.1%</div>
                  </div>
                  <div className="analytics-card">
                    <FaClock className="icon" />
                    <h3>Avg Session</h3>
                    <div className="value">{analyticsData.avgSessionDuration}</div>
                    <div className="trend down"><FaArrowDown /> -4.2%</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Visitor Growth</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={monthlyVisitors}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="visitors" stroke="#4338ca" strokeWidth={4} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="traffic-card">
                    <h3>Traffic Sources</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={trafficSources} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                          {trafficSources.map((e,i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="source-legend">
                      {trafficSources.map(s => (
                        <div key={s.name} className="source-item">
                          <span><span className={`source-color source-${s.name.toLowerCase().replace(/ /g,'-')}`}></span> {s.name}</span>
                          <strong>{s.value}%</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="performance-grid">
                  <div className="metric-card">
                    <h3><FaTachometerAlt /> Core Web Vitals</h3>
                    <div className={`metric-value status-${analyticsData.performance.lcp.status}`}>{analyticsData.performance.lcp.value}</div>
                    <div className="metric-label">Largest Contentful Paint</div>
                  </div>
                  <div className="metric-card">
                    <div className={`metric-value status-${analyticsData.performance.fid.status}`}>{analyticsData.performance.fid.value}</div>
                    <div className="metric-label">First Input Delay</div>
                  </div>
                  <div className="metric-card">
                    <div className={`metric-value status-${analyticsData.performance.cls.status}`}>{analyticsData.performance.cls.value}</div>
                    <div className="metric-label">Cumulative Layout Shift</div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Device Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                          {deviceData.map((e,i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="top-countries">
                    <h3>Top Countries</h3>
                    {topCountries.map((c, i) => (
                      <div key={i} className="country-row">
                        <img src={c.flag} alt={c.name} className="country-flag" />
                        <div className="country-info">
                          <div className="country-name">{c.name}</div>
                          <div className="country-visits">{c.visits.toLocaleString()} visits</div>
                        </div>
                        <div className="visit-count">+{c.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* DASHBOARD TAB */}
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
                {/* Rest of your dashboard charts... */}
              </>
            )}

            {/* UPLOAD ROADMAP */}
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
                    <button type="submit" className="btn-upload full" disabled={uploading}>
                      {uploading ? <><FaSpinner className="spin" /> Uploading...</> : 'Upload Roadmap'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* UPLOAD PROFILE */}
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
                    <button type="submit" className="btn-upload full" disabled={uploading}>
                      {uploading ? <><FaSpinner className="spin" /> Uploading...</> : 'Upload Profile'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ALL DOCUMENTS LIST */}
            {activeTab === 'list' && (
              <div>
                <div className="list-header">
                  <h1>All Documents ({roadmapCount + profileCount})</h1>
                  <div className="header-actions">
                    {selectedItems.length > 0 && (
                      <button onClick={bulkDelete} className="btn-danger">
                        <FaTrashAlt /> Delete Selected ({selectedItems.length})
                      </button>
                    )}
                    <button onClick={exportCSV} className="btn-secondary"><FaDownload /> Export CSV</button>
                  </div>
                </div>
                <div className="search-box">
                  <FaSearch />
                  <input type="text" placeholder="Search documents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="roadmap-grid">
                  {filteredList.map(item => (
                    <div key={item.id} className="roadmap-item">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                      <div className="item-info">
                        <h3>{item.country_name}</h3>
                        <p>{item.type} • {new Date(item.uploaded_at).toLocaleDateString()} • {item.file_size_kb} KB</p>
                      </div>
                      <div className="actions">
                        <a href={`${API_URL}/${item.type === 'Roadmap' ? 'roadmaps' : 'profiles'}/${item.country_slug}.pdf`} target="_blank" className="btn-view">View</a>
                        <button onClick={() => item.type === 'Roadmap' ? deleteRoadmap(item.country_slug) : deleteProfile(item.country_slug)} className="btn-delete"><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Floating Chat Button */}
        <div className="chat-floating-button-container">
          <button className="chat-floating-button">
            <div className="chat-bubble chat-bubble-1"></div>
            <div className="chat-bubble chat-bubble-2"></div>
            <FaUser className="chat-icon" />
          </button>
        </div>
      </div>
    </>
  );
}