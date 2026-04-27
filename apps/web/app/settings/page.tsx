'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings, Bell, Shield, Key, Database, Globe, User, Moon, Sun } from 'lucide-react';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
      <input type="checkbox" defaultChecked={defaultOn} style={{ display: 'none' }} />
      <div style={{
        width: 40, height: 22, borderRadius: 11, padding: 2,
        background: defaultOn ? 'var(--accent-cyan)' : 'var(--border-default)',
        display: 'flex', alignItems: 'center',
        transition: 'background var(--transition-fast)',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transform: defaultOn ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform var(--transition-fast)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </label>
  );
}

const SECTIONS = [
  {
    title: 'Notifications', icon: Bell,
    rows: [
      { label: 'Safety Breach Alerts', description: 'Immediate notification for threshold violations', comp: <Toggle defaultOn /> },
      { label: 'Experiment State Changes', description: 'When experiments start, pause, or complete', comp: <Toggle defaultOn /> },
      { label: 'AI Training Complete', description: 'When RL agent retraining finishes', comp: <Toggle /> },
      { label: 'Email Notifications', description: 'Send alerts to verified email address', comp: <Toggle defaultOn /> },
      { label: 'SMS Alerts', description: 'Critical-only alerts via SMS (Twilio)', comp: <Toggle /> },
      { label: 'Webhook Delivery', description: 'HMAC-signed outbound webhook', comp: <Toggle /> },
    ],
  },
  {
    title: 'Security', icon: Shield,
    rows: [
      { label: 'Multi-Factor Authentication', description: 'TOTP-based MFA (enforced for all roles)', comp: <span className="badge badge-running">ENFORCED</span> },
      { label: 'Session Timeout', description: 'Auto-logout after inactivity', comp: (
        <select className="agt-input" style={{ width: 120, cursor: 'pointer' }}>
          <option>30 minutes</option>
          <option>1 hour</option>
          <option>4 hours</option>
        </select>
      )},
      { label: 'IP Allowlist', description: 'Restrict access to approved IP ranges', comp: <Toggle /> },
      { label: 'ITAR Export Controls', description: 'Geo-block non-permitted regions (Cloudflare WAF)', comp: <Toggle defaultOn /> },
      { label: 'Audit Log Export', description: 'Allow this user to export audit logs', comp: <Toggle defaultOn /> },
    ],
  },
  {
    title: 'API & Integrations', icon: Key,
    rows: [
      { label: 'API Key', description: 'REST API access key (RS256 JWT)', comp: (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="agt-input" type="password" defaultValue="agt_live_xxxxxxxxxxxx" style={{ width: 180, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>Regenerate</button>
        </div>
      )},
      { label: 'Webhook Secret', description: 'HMAC-SHA256 signing secret', comp: (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="agt-input" type="password" defaultValue="whsec_xxxxxxxxxxxxxxxx" style={{ width: 180, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
          <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 12px' }}>Rotate</button>
        </div>
      )},
      { label: 'GraphQL Introspection', description: 'Enable schema introspection endpoint', comp: <Toggle /> },
    ],
  },
  {
    title: 'Data & Storage', icon: Database,
    rows: [
      { label: 'Telemetry Retention', description: 'How long raw sensor data is retained', comp: (
        <select className="agt-input" style={{ width: 120, cursor: 'pointer' }}>
          <option>90 days</option>
          <option>180 days</option>
          <option>1 year</option>
          <option>Indefinite</option>
        </select>
      )},
      { label: 'Auto-Archive Experiments', description: 'Archive completed experiments after 30 days', comp: <Toggle defaultOn /> },
      { label: 'HDF5 Auto-Export', description: 'Auto-export completed experiments to HDF5', comp: <Toggle /> },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout title="Settings" subtitle="Platform preferences, security, and integration configuration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 860 }}>

        {/* User profile */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-cyan)',
          }}>
            <User size={26} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Dr. Elena Vasquez</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>elena.vasquez@antigravity.lab • <span className="badge badge-completed" style={{ fontSize: 10 }}>RESEARCHER</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Propulsion Lab A • Last login: {new Date().toLocaleString()}</div>
          </div>
          <button className="btn-secondary" style={{ fontSize: 12 }}>Edit Profile</button>
        </div>

        {SECTIONS.map(({ title, icon: Icon, rows }) => (
          <div key={title} className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <Icon size={15} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
            </div>
            {rows.map(({ label, description, comp }) => (
              <SettingRow key={label} label={label} description={description}>
                {comp}
              </SettingRow>
            ))}
          </div>
        ))}

        <button className="btn-primary" style={{ alignSelf: 'flex-start', gap: 8 }}>
          <Settings size={14} /> Save Changes
        </button>
      </div>
    </DashboardLayout>
  );
}
