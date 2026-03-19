'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getUser } from '@/lib/api';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <div className="stat-change up">
          <span>↗</span> 0.0% vs last month
        </div>
      </div>
      <div className={`stat-icon ${color}`}>{icon}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const role = user?.role;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      if (role === 'super_admin') {
        const data = await apiFetch('/admin/analytics');
        setAnalytics(data.data);
      } else {
        // Admin: get their own garage stats
        const [requests, garage] = await Promise.all([
          apiFetch('/service-requests'),
          apiFetch('/garages'),
        ]);
        setAnalytics({
          totalRequests: requests.count || 0,
          completedRequests: requests.data?.filter((r: any) => r.status === 'completed').length || 0,
          totalGarages: 1,
          totalRevenue: 0,
          totalUsers: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const superAdminCards = [
    { title: 'Total Garages', value: analytics?.totalGarages || 0, icon: '🏭', color: 'orange' },
    { title: 'Service Requests', value: analytics?.totalRequests || 0, icon: '🔧', color: 'blue' },
    { title: 'Total Users', value: analytics?.totalUsers || 0, icon: '👥', color: 'green' },
    { title: 'Total Revenue', value: `ETB ${(analytics?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'yellow' },
  ];

  const adminCards = [
    { title: 'Service Requests', value: analytics?.totalRequests || 0, icon: '🔧', color: 'orange' },
    { title: 'Completed', value: analytics?.completedRequests || 0, icon: '✅', color: 'green' },
    { title: 'Revenue', value: `ETB ${(analytics?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'yellow' },
    { title: 'Active Garages', value: analytics?.activeGarages || analytics?.totalGarages || 0, icon: '🏭', color: 'blue' },
  ];

  const cards = role === 'super_admin' ? superAdminCards : adminCards;

  // Mock chart data for services overview
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const values = [15, 28, 22, 35, 40, 32, 45];
  const maxVal = Math.max(...values);

  // Donut chart data
  const categories = [
    { label: 'Engine', pct: 35, color: '#d85f17' },
    { label: 'Brakes', pct: 20, color: '#3b82f6' },
    { label: 'Oil Change', pct: 18, color: '#10b981' },
    { label: 'Tires', pct: 15, color: '#f59e0b' },
    { label: 'Others', pct: 12, color: '#8b5cf6' },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here&apos;s what&apos;s happening with your {role === 'super_admin' ? 'platform' : 'garage'} today.</p>
      </div>

      <div className="stats-grid">
        {cards.map((card, i) => (
          <StatsCard key={i} {...card} />
        ))}
      </div>

      <div className="charts-row">
        {/* Area Chart - Service Requests Overview */}
        <div className="chart-card">
          <h3>Service Requests Overview</h3>
          <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 0, padding: '20px 0' }}>
            <svg width="100%" height="220" viewBox="0 0 700 220" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="0" y1={i * 55} x2="700" y2={i * 55} stroke="#2d3041" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d85f17" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#d85f17" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${220 - (values[0] / maxVal) * 200} ${values.map((v, i) => `L ${(i / (values.length - 1)) * 700} ${220 - (v / maxVal) * 200}`).join(' ')} L 700 220 L 0 220 Z`}
                fill="url(#areaGrad)"
              />
              {/* Line */}
              <path
                d={`M ${values.map((v, i) => `${(i / (values.length - 1)) * 700} ${220 - (v / maxVal) * 200}`).join(' L ')}`}
                fill="none"
                stroke="#d85f17"
                strokeWidth="2.5"
              />
              {/* Dots */}
              {values.map((v, i) => (
                <circle
                  key={i}
                  cx={(i / (values.length - 1)) * 700}
                  cy={220 - (v / maxVal) * 200}
                  r="4"
                  fill="#d85f17"
                  stroke="#1e2130"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Donut Chart - Services by Category */}
        <div className="chart-card">
          <h3>Services by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              {(() => {
                let cumulative = 0;
                return categories.map(cat => {
                  const startAngle = cumulative * 3.6;
                  cumulative += cat.pct;
                  const endAngle = cumulative * 3.6;
                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;
                  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                  const x1 = 90 + 70 * Math.cos(startRad);
                  const y1 = 90 + 70 * Math.sin(startRad);
                  const x2 = 90 + 70 * Math.cos(endRad);
                  const y2 = 90 + 70 * Math.sin(endRad);
                  return (
                    <path
                      key={cat.label}
                      d={`M 90 90 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={cat.color}
                      stroke="var(--bg-card)"
                      strokeWidth="2"
                    />
                  );
                });
              })()}
              <circle cx="90" cy="90" r="40" fill="var(--bg-card)" />
            </svg>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', marginTop: 20, justifyContent: 'center' }}>
              {categories.map(cat => (
                <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{cat.label} {cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
