'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FlaskConical, Cpu, Shield, Activity,
  BarChart3, FileText, Settings, Zap, Radio, ChevronRight,
  Bell, User, LogOut
} from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Experiments', href: '/experiments', icon: FlaskConical },
  { label: 'Field Simulation', href: '/field-sim', icon: Activity },
  { label: 'Hardware Control', href: '/hardware', icon: Cpu },
  { label: 'Safety Watchdog', href: '/safety', icon: Shield },
  { label: 'AI Optimizer', href: '/optimizer', icon: Zap },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Audit Log', href: '/audit', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #00d4ff 0%, #0066ff 60%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,212,255,0.4)',
          flexShrink: 0
        }}>
          <Radio size={20} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
            ANTIGRAVITY
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            AGT-LEV-2026-04
          </div>
        </div>
      </div>

      {/* System Status */}
      <div style={{ padding: '10px 16px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8
        }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-green)', letterSpacing: '0.05em' }}>
            SYSTEMS NOMINAL
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div className="section-title">Navigation</div>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        <div className="separator" style={{ margin: '12px 16px' }} />
        <div className="section-title">System</div>
        <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Footer */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          borderRadius: 10,
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-cyan-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <User size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Dr. E. Vasquez
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Researcher</div>
          </div>
          <LogOut size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
