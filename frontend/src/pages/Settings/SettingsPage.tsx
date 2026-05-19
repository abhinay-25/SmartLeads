import * as React from 'react';
import { useState } from 'react';
import { User, Shield, Bell, Palette, ChevronRight } from 'lucide-react';
import { PageHeader, PageContainer } from '@components/ui/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useAuthStore } from '@store/authStore';
import { cn } from '@lib/cn';

/* ── Settings tabs ──────────────────────────────────────────── */

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',       icon: User    },
  { id: 'security',      label: 'Security',      icon: Shield  },
  { id: 'notifications', label: 'Notifications', icon: Bell    },
  { id: 'appearance',    label: 'Appearance',    icon: Palette },
];

/* ── Placeholder field ──────────────────────────────────────── */
const SettingsField = ({
  label,
  value,
  type = 'text',
  description,
  disabled,
}: {
  label:        string;
  value:        string;
  type?:        string;
  description?: string;
  disabled?:    boolean;
}) => (
  <div className="flex items-center justify-between gap-8 py-4 border-b border-[hsl(var(--border-subtle))] last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-medium text-[hsl(var(--text-primary))]">{label}</p>
      {description && (
        <p className="mt-0.5 text-[12px] text-[hsl(var(--text-tertiary))]">{description}</p>
      )}
    </div>
    <div className="flex shrink-0 items-center gap-3">
      <span className="text-[13px] text-[hsl(var(--text-secondary))]">
        {type === 'password' ? '••••••••••' : value}
      </span>
      {!disabled && (
        <Button variant="secondary" size="xs">
          Edit
        </Button>
      )}
    </div>
  </div>
);

/* ── Toggle setting ─────────────────────────────────────────── */
const ToggleSetting = ({
  label,
  description,
  defaultChecked = false,
}: {
  label:           string;
  description?:    string;
  defaultChecked?: boolean;
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-8 py-4 border-b border-[hsl(var(--border-subtle))] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[hsl(var(--text-primary))]">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-[hsl(var(--text-tertiary))]">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full border-2 border-transparent',
          'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2',
          checked ? 'bg-[hsl(var(--brand))]' : 'bg-[hsl(var(--bg-muted))]'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm',
            'transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};

/* ── Settings Page ──────────────────────────────────────────── */
const SettingsPage = () => {
  useDocumentTitle('Settings');
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const user = useAuthStore((s) => s.user);

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account and workspace preferences."
      />

      <div className="flex gap-6">
        {/* ── Sidebar tabs ────────────────────────────────── */}
        <nav
          aria-label="Settings sections"
          className="hidden w-44 shrink-0 sm:block"
        >
          <ul className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon     = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left',
                      'text-[13px] transition-colors duration-150',
                      isActive
                        ? 'bg-[hsl(var(--brand-subtle))] font-medium text-[hsl(var(--brand))]'
                        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-subtle))] hover:text-[hsl(var(--text-primary))]'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {tab.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 opacity-60" aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Main content ─────────────────────────────────── */}
        <div className="min-w-0 flex-1 max-w-2xl space-y-4">

          {activeTab === 'profile' && (
            <>
              <Card padding="none">
                <CardHeader className="px-5 pt-5 pb-0">
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <SettingsField label="Full name"     value={user?.name  ?? 'Not set'} />
                  <SettingsField label="Email address" value={user?.email ?? 'Not set'} />
                  <SettingsField label="Role"          value={user?.role === 'admin' ? 'Administrator' : 'Sales User'} disabled />
                </CardContent>
              </Card>

              <Card padding="none">
                <CardHeader className="px-5 pt-5 pb-0">
                  <CardTitle>Workspace</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <SettingsField
                    label="Account ID"
                    value={user?.id?.slice(0, 16) ?? '—'}
                    description="Your unique account identifier"
                    disabled
                  />
                  <SettingsField
                    label="Member since"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                    disabled
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="danger" size="sm">
                  Delete account
                </Button>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <Card padding="none">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <SettingsField
                  label="Password"
                  value="Last changed 30 days ago"
                  type="password"
                />
                <ToggleSetting
                  label="Two-factor authentication"
                  description="Add an extra layer of security to your account"
                />
                <ToggleSetting
                  label="Login alerts"
                  description="Get notified when someone signs in from a new device"
                  defaultChecked
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card padding="none">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ToggleSetting
                  label="New lead assigned"
                  description="When a lead is assigned to you"
                  defaultChecked
                />
                <ToggleSetting
                  label="Lead status changed"
                  description="When a lead moves through the pipeline"
                  defaultChecked
                />
                <ToggleSetting
                  label="Weekly digest"
                  description="Summary of your pipeline performance"
                />
                <ToggleSetting
                  label="Product updates"
                  description="New features and improvements"
                />
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card padding="none">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="py-4">
                  <p className="text-[13px] font-medium text-[hsl(var(--text-primary))]">Color theme</p>
                  <p className="mt-0.5 text-[12px] text-[hsl(var(--text-tertiary))]">Dark mode support coming soon</p>
                  <div className="mt-3 flex gap-2">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <button
                        key={theme}
                        className={cn(
                          'rounded-lg border px-4 py-2 text-[13px] transition-colors',
                          theme === 'Light'
                            ? 'border-[hsl(var(--brand))] bg-[hsl(var(--brand-subtle))] font-medium text-[hsl(var(--brand))]'
                            : 'border-[hsl(var(--border-default))] text-[hsl(var(--text-secondary))] opacity-50 cursor-not-allowed'
                        )}
                        disabled={theme !== 'Light'}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
