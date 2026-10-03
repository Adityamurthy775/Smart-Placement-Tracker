import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie as RPie, PieChart as RPieChart,
  Tooltip as RTooltip, XAxis as RXAxis, YAxis as RYAxis,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart } from '@/components/charts/area-chart';
import { Grid } from '@/components/charts/grid';
import { XAxis } from '@/components/charts/x-axis';
import { ChartTooltip as BklitChartTooltip } from '@/components/charts/tooltip';
import { UserContext } from '../contexts/UserContext';
import { API_BASE, cn } from '@/lib/utils';
import {
  ArrowDown, ArrowUp, ArrowUpRight, BarChart3, Bell, Briefcase, FileText,
  LayoutGrid, LogOut, Plus, RefreshCw, Search, Send, Settings, ShieldCheck,
  TrendingUp,
} from 'lucide-react';

/* ───────────────────────────── design tokens ───────────────────────────── */
const BRAND = '#12a25a';
const BRAND_DARK = '#0a7d45';
const BAR_LIGHT = '#9ed9bd';
const CARD = 'rounded-3xl border border-[#eceff2] bg-white';
const ICON_BTN = 'flex h-9 w-9 items-center justify-center rounded-xl border border-[#eceff2] bg-white text-[#5a6b7d]';

// Tab ids, not routes: the dashboard keeps its shell (top bar + rail) and
// swaps the content column, so no nav click leaves this page.
const NAV = [
  { key: 'overview', label: 'Dashboard', Icon: LayoutGrid },
  { key: 'drives', label: 'Drives', Icon: Briefcase },
  { key: 'applications', label: 'Applications', Icon: FileText },
  { key: 'analytics', label: 'My Analytics', Icon: BarChart3 },
  { key: 'settings', label: 'Settings', Icon: Settings },
];

const RANGES = [
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
  { days: 365, label: 'Last 12 months' },
];

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

/* ───────────────────────────── notifications ──────────────────────────────── */
// Feed derived client-side from application status timestamps the API already
// returns — no notification table, no polling. ponytail: derived > stored.
const STATUS_META = {
  APPLIED: { verb: 'Applied', tone: 'bg-[#f1f4f6] text-[#5a6b7d]' },
  SHORTLISTED: { verb: 'Shortlisted', tone: 'bg-[#e7f7ee] text-[#0a7d45]' },
  INTERVIEW: { verb: 'Interview scheduled', tone: 'bg-[#fff7e0] text-[#8a6a00]' },
  SELECTED: { verb: 'Selected', tone: 'bg-[#e7f7ee] text-[#0a7d45]' },
  REJECTED: { verb: 'Not selected', tone: 'bg-[#fdecec] text-[#b42318]' },
};

function buildFeed(applications, closingSoon) {
  const events = [];
  applications.forEach((app) => {
    const where = `${app.role || 'Role'} at ${app.company || 'Company'}`;
    const stamps = [
      [app.appliedAt || app.appliedDate, 'APPLIED'],
      [app.shortlistedAt, 'SHORTLISTED'],
      [app.interviewedAt, 'INTERVIEW'],
      [app.selectedAt, 'SELECTED'],
      [app.rejectedAt, 'REJECTED'],
    ];
    stamps.forEach(([at, status]) => {
      const date = parseDate(at);
      if (!date) return;
      events.push({
        key: `${app._id}-${status}`,
        at: date,
        title: `${STATUS_META[status].verb}: ${where}`,
        tone: STATUS_META[status].tone,
      });
    });
  });
  closingSoon.forEach((drive) => {
    events.push({
      key: `deadline-${drive._id}`,
      at: drive.at,
      title: `Deadline in ${drive.daysLeft}d: ${drive.companyId?.CompanyName || drive.Title || 'Drive'}`,
      tone: drive.daysLeft <= 3 ? 'bg-[#fdecec] text-[#b42318]' : 'bg-[#fff7e0] text-[#8a6a00]',
    });
  });
  return events.sort((a, b) => b.at - a.at);
}

function NotificationsView({ events }) {
  return (
    <div className={cn(CARD, 'p-6')}>
      <CardHead title="Notifications" sub="Status changes and upcoming deadlines" />
      {events.length === 0 ? (
        <p className="mt-6 text-sm text-[#8a97a5]">
          Nothing yet. Application updates and drive deadlines show up here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-[#f1f4f6]">
          {events.slice(0, 50).map((event) => (
            <li key={event.key} className="flex items-center gap-3 py-3">
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', event.tone)}>
                {event.at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[#0f172a]">{event.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────────── helpers ─────────────────────────────────── */
// One GET that reports failure instead of throwing: a 404 on /drive/hr/:id (HR
// with no drives yet) must not take the whole dashboard down with it. The
// caller still gets to see when every single request failed.
async function safeGet(url, config, fallback) {
  try {
    const res = await axios.get(url, { ...config, validateStatus: () => true });
    return res.status >= 400
      ? { ok: false, data: fallback }
      : { ok: true, data: res.data };
  } catch {
    return { ok: false, data: fallback };
  }
}

const parseDate = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const monthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

// Applications grouped per calendar month for the last `count` months.
function byMonth(items, count) {
  const out = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const at = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${at.getFullYear()}-${at.getMonth()}`,
      label: monthLabel(at),
      value: 0,
      offers: 0,
    });
  }
  items.forEach((item) => {
    const d = parseDate(item.appliedAt || item.appliedDate);
    if (!d) return;
    const bucket = out.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.value += 1;
    if (item.status === 'SELECTED') bucket.offers += 1;
  });
  return out;
}

// Applications grouped per calendar year across the whole history.
function byYear(items) {
  const out = new Map();
  items.forEach((item) => {
    const d = parseDate(item.appliedAt || item.appliedDate);
    if (!d) return;
    const key = String(d.getFullYear());
    const bucket = out.get(key) || { key, label: key, value: 0, offers: 0 };
    bucket.value += 1;
    if (item.status === 'SELECTED') bucket.offers += 1;
    out.set(key, bucket);
  });
  return [...out.values()].sort((a, b) => a.key.localeCompare(b.key));
}


/* ───────────────────────────── pieces ──────────────────────────────────── */
function CardHead({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-[#0f172a]">{title}</h3>
        {sub && <p className="text-xs text-[#8a97a5]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const RoundAction = ({ children }) => <span className={ICON_BTN}>{children}</span>;

function KpiCard({ label, value, hint, tone = 'plain' }) {
  const tones = {
    plain: 'text-[#0f172a]',
    good: 'text-[#0a7d45]',
    warn: 'text-[#b45309]',
  };
  return (
    <div className={cn(CARD, 'flex-1 p-4')}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a97a5]">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold', tones[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[#8a97a5]">{hint}</p>}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-[#f1f4f6]', className)} />;
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className={cn(CARD, 'flex flex-col items-center gap-3 p-10 text-center')}>
      <p className="text-sm font-semibold text-[#b42318]">Could not load dashboard data</p>
      <p className="text-xs text-[#8a97a5]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-[#0a7d45] px-4 py-2 text-xs font-bold text-white"
      >
        Retry
      </button>
    </div>
  );
}

// Running total per application, used by the area chart.
function cumulative(items, from) {
  return items
    .map((item) => parseDate(item.appliedAt || item.appliedDate))
    .filter((d) => d && d >= from)
    .sort((a, b) => a - b)
    .map((date, i) => ({ date, total: i + 1 }));
}

const daysAgo = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value ?? '—');
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const initials = (name) =>
  String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

/* ── Placement tracker: applications per month, dark = month with an offer ── */
const trackerConfig = {
  value: { label: 'Applications', color: BAR_LIGHT },
  offers: { label: 'Offers', color: BRAND_DARK },
};

function TrackerCard({ rows, mode, onModeChange }) {
  const peak = rows.reduce(
    (best, row) => (best === null || row.value > best.value ? row : best),
    null,
  );
  const peakIndex = peak ? rows.findIndex((row) => row.key === peak.key) : -1;
  const offerMonths = rows.filter((row) => row.offers > 0).length;

  return (
    <div className={cn(CARD, 'flex h-full flex-col p-5')}>
      <CardHead
        title="Placement Tracker"
        sub={`Dark bars = months with an offer (${offerMonths})`}
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-[#f3f5f7] p-1">
              {['monthly', 'annually'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onModeChange(key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold capitalize transition',
                    mode === key ? 'bg-[#0a7d45] text-white' : 'text-[#5a6b7d]',
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            <RoundAction><ArrowUpRight size={15} /></RoundAction>
          </div>
        }
      />

      {rows.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-xs text-[#8a97a5]">
          No applications in this range yet.
        </div>
      ) : (
        <ChartContainer config={trackerConfig} className="mt-4 h-[240px] w-full aspect-auto">
          <BarChart data={rows} barCategoryGap="26%" margin={{ top: 28, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e8ecef" strokeDasharray="4 6" />
            <RXAxis
              dataKey="label" axisLine={false} tickLine={false}
              tick={{ fontSize: 10, fill: '#98a4b2' }} interval={0}
            />
            <RYAxis
              allowDecimals={false} axisLine={false} tickLine={false} width={44}
              tick={{ fontSize: 10, fill: '#98a4b2' }}
            />
            <RTooltip
              cursor={{ fill: 'rgba(18, 162, 90, 0.06)' }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="value" radius={[17, 17, 0, 0]} barSize={34}
              label={({ x, width, y, index }) => {
                if (index !== peakIndex || !peak || peak.value === 0) return null;
                const cx = x + width / 2;
                return (
                  <g>
                    <rect x={cx - 30} y={y - 30} width={60} height={22} rx={11} fill="#0a7d45" />
                    <text x={cx} y={y - 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
                      +{peak.value}
                    </text>
                    <circle cx={cx} cy={y - 6} r={5} fill="#0a7d45" />
                  </g>
                );
              }}
            >
              {rows.map((row) => (
                <Cell key={row.key} fill={row.offers > 0 ? BRAND_DARK : BAR_LIGHT} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}

/* ── Application trend: cumulative applications inside the date range ── */
function TrendCard({ points, rangeDays, onGoDrives, onGoApplications }) {
  const total = points.length ? points[points.length - 1].total : 0;

  return (
    <div className={cn(CARD, 'p-5')}>
      <CardHead
        title="Application Trend"
        sub={`Cumulative over the last ${rangeDays} days`}
        action={<RoundAction><TrendingUp size={15} /></RoundAction>}
      />

      <p className="mt-4 text-center text-xs text-[#8a97a5]">Applications sent</p>
      <p className="text-center text-3xl font-bold text-[#0f172a]">{total}</p>

      {points.length < 2 ? (
        <div className="mt-4 flex h-[130px] items-center justify-center rounded-2xl border border-dashed border-[#eceff2] text-xs text-[#8a97a5]">
          Not enough activity in this range.
        </div>
      ) : (
        <AreaChart
          data={points}
          aspectRatio="16 / 7"
          margin={{ top: 16, right: 4, bottom: 4, left: 4 }}
          animationDuration={900}
        >
          <Grid horizontal />
          <Area dataKey="total" fillOpacity={0.22} stroke={BRAND} strokeWidth={2} />
          <XAxis />
          <BklitChartTooltip />
        </AreaChart>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onGoDrives}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0a7d45] px-4 py-2.5 text-xs font-bold text-white"
        >
          Browse drives <ArrowUp size={13} />
        </button>
        <button
          type="button"
          onClick={onGoApplications}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#eceff2] px-4 py-2.5 text-xs font-bold text-[#5a6b7d]"
        >
          My applications <ArrowDown size={13} />
        </button>
      </div>
    </div>
  );
}


/* ── Recent applications table, filtered by the top-bar search ── */
const STATUS_STYLE = {
  APPLIED: 'text-[#5a6b7d] bg-[#f1f4f6]',
  SHORTLISTED: 'text-[#b45309] bg-[#fef4e6]',
  INTERVIEW: 'text-[#1d4ed8] bg-[#e8effd]',
  SELECTED: 'text-[#0a7d45] bg-[#e7f7ee]',
  REJECTED: 'text-[#b42318] bg-[#fdecec]',
};

function RecentTable({ rows, query, onClearQuery, onGoDrives }) {
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? rows.filter((row) =>
        `${row.company} ${row.role} ${row.status}`.toLowerCase().includes(needle),
      )
    : rows;
  const latest = filtered.slice(0, 6);

  return (
    <div className={cn(CARD, 'p-5')}>
      <CardHead
        title="Recent Applications"
        sub={needle ? `${filtered.length} matching "${query.trim()}"` : 'Latest activity across all drives'}
        action={<RoundAction><ArrowUpRight size={15} /></RoundAction>}
      />

      {latest.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm font-semibold text-[#0f172a]">
            {rows.length === 0 ? 'No applications yet' : 'No match for that search'}
          </p>
          <p className="text-xs text-[#8a97a5]">
            {rows.length === 0
              ? 'Browse open drives and apply to start filling this table.'
              : 'Clear the search box to see everything again.'}
          </p>
          {rows.length === 0 ? (
            <button
              type="button"
              onClick={onGoDrives}
              className="mt-1 rounded-full bg-[#0a7d45] px-4 py-2 text-xs font-bold text-white"
            >
              Browse drives
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearQuery}
              className="mt-1 text-xs font-bold text-[#0a7d45] underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-[#8a97a5]">
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Applied</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Package</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((row) => (
                <tr key={row._id} className="border-t border-[#f2f4f6]">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a7d45] text-[11px] font-bold text-white"
                      >
                        {initials(row.company)}
                      </span>
                      <span className="text-xs font-bold text-[#0f172a]">{row.company || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-[#5a6b7d]">{row.role || '—'}</td>
                  <td className="py-3 text-xs text-[#5a6b7d]">{row.appliedDate || '—'}</td>
                  <td className="py-3">
                    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', STATUS_STYLE[row.status] || STATUS_STYLE.APPLIED)}>
                      {row.status || 'APPLIED'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs font-semibold text-[#0f172a]">
                    {row.salary ? formatMoney(String(row.salary).replace(/[^\d.]/g, '')) + ' LPA' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── My Analytics: status donut, top companies, selection funnel ── */
const STATUS_COLOR = {
  APPLIED: '#98a4b2',
  SHORTLISTED: '#f59e0b',
  INTERVIEW: '#3b82f6',
  SELECTED: '#0a7d45',
  REJECTED: '#e11d48',
};

function AnalyticsSection({ counts, applications, successRate }) {
  const donut = STATUSES
    .map((status) => ({ status, value: counts[status] }))
    .filter((slice) => slice.value > 0);

  const byCompany = Object.entries(
    applications.reduce((acc, app) => {
      const key = app.company || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([company, value]) => ({ company, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const maxCompany = Math.max(...byCompany.map((row) => row.value), 1);
  const funnel = [
    { label: 'Applied', value: counts.APPLIED + counts.SHORTLISTED + counts.INTERVIEW + counts.SELECTED + counts.REJECTED },
    { label: 'Shortlisted', value: counts.SHORTLISTED + counts.INTERVIEW + counts.SELECTED },
    { label: 'Interview', value: counts.INTERVIEW + counts.SELECTED },
    { label: 'Selected', value: counts.SELECTED },
  ];

  return (
    <section className="mt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">My Analytics</h2>
          <p className="text-xs text-[#8a97a5]">Everything the Reports view computes, on this page</p>
        </div>
        <span className="rounded-full bg-[#e7f7ee] px-3 py-1.5 text-xs font-bold text-[#0a7d45]">
          Success rate {successRate}%
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className={cn(CARD, 'p-5')}>
          <CardHead title="Status Breakdown" sub="Every application by where it stands" />
          {donut.length === 0 ? (
            <p className="mt-6 text-xs text-[#8a97a5]">No applications yet.</p>
          ) : (
            <>
              <div className="mt-3 flex justify-center">
                <RPieChart width={190} height={190}>
                  <RPie
                    data={donut}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {donut.map((slice) => (
                      <Cell key={slice.status} fill={STATUS_COLOR[slice.status]} />
                    ))}
                  </RPie>
                  <RTooltip
                    content={({ payload }) => (
                      <span className="rounded-lg bg-[#0f172a] px-2.5 py-1.5 text-[11px] font-semibold text-white">
                        {payload?.[0]?.name}: {payload?.[0]?.value}
                      </span>
                    )}
                  />
                </RPieChart>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {donut.map((slice) => (
                  <span key={slice.status} className="flex items-center gap-1.5 text-[11px] text-[#5a6b7d]">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_COLOR[slice.status] }} />
                    {slice.status} {slice.value}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={cn(CARD, 'p-5')}>
          <CardHead title="Top Companies" sub="Where the applications went" />
          {byCompany.length === 0 ? (
            <p className="mt-6 text-xs text-[#8a97a5]">No applications yet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {byCompany.map((row) => (
                <div key={row.company} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 truncate text-[11px] font-semibold text-[#5a6b7d]">
                    {row.company}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f1f4f6]">
                    <span
                      className="block h-full rounded-full bg-[#12a25a]"
                      style={{ width: `${Math.round((row.value / maxCompany) * 100)}%` }}
                    />
                  </span>
                  <span className="w-5 shrink-0 text-right text-[11px] font-bold text-[#0f172a]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(CARD, 'p-5')}>
          <CardHead title="Selection Funnel" sub="How many survive each stage" />
          <div className="mt-4 flex flex-col gap-3">
            {funnel.map((stage, index) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#5a6b7d]">{stage.label}</span>
                  <span className="font-bold text-[#0f172a]">{stage.value}</span>
                </div>
                <span className="mt-1 block h-2.5 overflow-hidden rounded-full bg-[#f1f4f6]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${funnel[0].value ? Math.round((stage.value / funnel[0].value) * 100) : 0}%`,
                      background: STATUS_COLOR[['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'][index]],
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-[#8a97a5]">
            {counts.SELECTED} offer{counts.SELECTED === 1 ? '' : 's'} from{' '}
            {funnel[0].value} application{funnel[0].value === 1 ? '' : 's'}.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Drives tab ── */
function driveEligibility(drive, cgpa, branch) {
  const allowed = Array.isArray(drive.AllowedBranch)
    ? drive.AllowedBranch.map((b) => String(b).toUpperCase())
    : [];
  const cgpaOk = !cgpa || Number(drive.MinCGPA || 0) <= cgpa;
  const branchOk =
    allowed.length === 0 ||
    allowed.includes('ALL') ||
    allowed.includes(String(branch).toUpperCase());
  const open = drive.status !== 'COMPLETED' && drive.status !== 'CANCELLED';
  return open && cgpaOk && branchOk;
}

function DrivesView({ drives, applications, cgpa, branch, onApply, applying, notice }) {
  const [q, setQ] = useState('');
  const applied = useMemo(
    () => new Set(applications.map((a) => String(a.driveid || a.driveId || ''))),
    [applications],
  );
  const midnight = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  const needle = q.trim().toLowerCase();
  const rows = drives.filter((drive) => {
    const company = drive.companyId?.CompanyName || '';
    const hay = `${company} ${drive.Title} ${drive.JobRole} ${drive.Package}`.toLowerCase();
    return !needle || hay.includes(needle);
  });

  return (
    <div className="flex flex-col gap-5">
      <div className={cn(CARD, 'flex flex-wrap items-center justify-between gap-3 p-5')}>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Available Drives</h2>
          <p className="text-xs text-[#8a97a5]">{rows.length} of {drives.length} drives</p>
        </div>
        <label className="flex items-center gap-2 rounded-full border border-[#eceff2] bg-[#fafbfc] px-4 py-2.5">
          <Search size={14} className="text-[#8a97a5]" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search company, role or package"
            className="w-56 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#a4b0bd]"
          />
        </label>
      </div>

      {notice && (
        <p className="rounded-2xl border border-[#e7f7ee] bg-[#e7f7ee] px-4 py-3 text-xs font-semibold text-[#0a7d45]">
          {notice}
        </p>
      )}

      {rows.length === 0 ? (
        <div className={cn(CARD, 'p-10 text-center')}>
          <p className="text-sm font-semibold text-[#0f172a]">No drive matches that search</p>
          <button type="button" onClick={() => setQ('')} className="mt-2 text-xs font-bold text-[#0a7d45] underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rows.map((drive) => {
            const company = drive.companyId?.CompanyName || 'Company';
            const lastDate = parseDate(drive.LastDate);
            const daysLeft = lastDate
              ? Math.max(0, Math.ceil((lastDate.getTime() - midnight) / 86400000))
              : null;
            const eligible = driveEligibility(drive, cgpa, branch);
            const already = applied.has(String(drive._id));
            return (
              <div key={drive._id} className={cn(CARD, 'flex flex-col gap-3 p-5')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a7d45] text-xs font-bold text-white">
                      {initials(company)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#0f172a]">{company}</span>
                      <span className="block truncate text-xs text-[#8a97a5]">{drive.Title}</span>
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#e7f7ee] px-2.5 py-1 text-[11px] font-bold text-[#0a7d45]">
                    {drive.Package}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <dt className="text-[#8a97a5]">Role</dt>
                    <dd className="font-semibold text-[#0f172a]">{drive.JobRole}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8a97a5]">Min CGPA</dt>
                    <dd className="font-semibold text-[#0f172a]">{drive.MinCGPA}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8a97a5]">Branches</dt>
                    <dd className="font-semibold text-[#0f172a]">
                      {(drive.AllowedBranch || []).join(', ') || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8a97a5]">Closes</dt>
                    <dd className="font-semibold text-[#0f172a]">
                      {lastDate ? `${lastDate.toLocaleDateString()} · ${daysLeft}d` : '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <span className={cn('text-[11px] font-bold', eligible ? 'text-[#0a7d45]' : 'text-[#b42318]')}>
                    {eligible ? 'You are eligible' : 'Not eligible for you'}
                  </span>
                  <button
                    type="button"
                    disabled={!eligible || already || applying}
                    onClick={() => onApply(drive)}
                    className="rounded-full bg-[#0a7d45] px-4 py-2 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:bg-[#d7dee5]"
                  >
                    {already ? 'Applied' : applying ? 'Sending…' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Applications tab ── */
function ApplicationsView({ applications, query, onClearQuery }) {
  const needle = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const matched = needle
      ? applications.filter((app) =>
          `${app.company} ${app.role} ${app.status}`.toLowerCase().includes(needle),
        )
      : applications;
    return [...matched].sort((a, b) => {
      const left = parseDate(a.appliedAt || a.appliedDate)?.getTime() ?? 0;
      const right = parseDate(b.appliedAt || b.appliedDate)?.getTime() ?? 0;
      return right - left;
    });
  }, [applications, needle]);

  return (
    <div className={cn(CARD, 'p-5')}>
      <CardHead
        title="My Applications"
        sub={needle ? `${rows.length} matching "${needle}"` : `${rows.length} applications, newest first`}
        action={<RoundAction><FileText size={15} /></RoundAction>}
      />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm font-semibold text-[#0f172a]">
            {applications.length === 0 ? 'No applications yet' : 'No match for that search'}
          </p>
          <button type="button" onClick={onClearQuery} className="text-xs font-bold text-[#0a7d45] underline">
            {applications.length === 0 ? 'Apply from the Drives tab' : 'Clear search'}
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="text-[11px] font-semibold text-[#8a97a5]">
                <th className="pb-3 font-semibold">Company</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Applied</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Package</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-[#f2f4f6]">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a7d45] text-[11px] font-bold text-white">
                        {initials(row.company)}
                      </span>
                      <span className="text-xs font-bold text-[#0f172a]">{row.company || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-[#5a6b7d]">{row.role || '—'}</td>
                  <td className="py-3 text-xs text-[#5a6b7d]">{row.appliedDate || '—'}</td>
                  <td className="py-3">
                    <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', STATUS_STYLE[row.status] || STATUS_STYLE.APPLIED)}>
                      {row.status || 'APPLIED'}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs font-semibold text-[#0f172a]">
                    {row.salary ? formatMoney(String(row.salary).replace(/[^\d.]/g, '')) + ' LPA' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Settings tab: writes through UserContext.saveProfileDetails ── */
const PROFILE_FIELDS = [
  { name: 'name', label: 'Full name', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'cgpa', label: 'CGPA', type: 'number', numeric: true },
  { name: 'branch', label: 'Branch', type: 'text' },
  { name: 'skills', label: 'Skills (comma separated)', type: 'text' },
  { name: 'github', label: 'GitHub', type: 'url' },
  { name: 'linkedin', label: 'LinkedIn', type: 'url' },
];

function SettingsView({ user, profileDetails, onSave, saving, message }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: profileDetails?.phone || '',
    cgpa: profileDetails?.cgpa || '',
    branch: profileDetails?.branch || '',
    skills: profileDetails?.skills || '',
    github: profileDetails?.github || '',
    linkedin: profileDetails?.linkedin || '',
  });

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <div className={cn(CARD, 'p-5 xl:col-span-2')}>
        <CardHead
          title="Profile Settings"
          sub="Saved through /user-api/profile"
          action={<RoundAction><Settings size={15} /></RoundAction>}
        />
        <form
          onSubmit={(event) => { event.preventDefault(); onSave(form); }}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {PROFILE_FIELDS.map((field) => (
            <label key={field.name} className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8a97a5]">
                {field.label}
              </span>
              <input
                type={field.type}
                {...(field.numeric ? { min: 0, max: 10, step: '0.01' } : {})}
                value={form[field.name]}
                onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}
                className="rounded-xl border border-[#eceff2] bg-[#fafbfc] px-4 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#12a25a]"
              />
            </label>
          ))}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#0a7d45] px-6 py-2.5 text-xs font-bold text-white transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
        {message && (
          <p className="mt-4 rounded-2xl bg-[#e7f7ee] px-4 py-3 text-xs font-semibold text-[#0a7d45]">
            {message}
          </p>
        )}
      </div>

      <div className={cn(CARD, 'p-5')}>
        <CardHead title="Account" sub="Read-only session details" />
        <dl className="mt-4 flex flex-col gap-3 text-xs">
          {[
            ['Email', user?.email],
            ['Role', user?.role],
            ['Profile', user?.profileCompleted ? 'Complete' : 'Incomplete'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-[#f2f4f6] pb-2">
              <dt className="text-[#8a97a5]">{label}</dt>
              <dd className="truncate font-semibold text-[#0f172a]">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ───────────────────────────── admin panel ────────────────────────────────── */
// Read-only roster over /admin-api (GET students/teachers/companies/drives).
function AdminView() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (status !== 'loading') return undefined;
    let cancelled = false;
    (async () => {
      const cfg = { withCredentials: true };
      const [students, teachers, companies, drives] = await Promise.all([
        safeGet(`${API_BASE}/admin-api/admin/student`, cfg, { payload: [] }),
        safeGet(`${API_BASE}/admin-api/admin/teacher`, cfg, { payload: [] }),
        safeGet(`${API_BASE}/admin-api/admin/company`, cfg, { payload: [] }),
        safeGet(`${API_BASE}/admin-api/admin/drive`, cfg, { payload: [] }),
      ]);
      if (cancelled) return;
      const failed = [students, teachers, companies, drives].filter((r) => !r.ok).length;
      if (failed === 4) {
        setErr('Admin API unreachable. Is the backend running?');
        setStatus('error');
        return;
      }
      setData({
        students: students.data.payload || [],
        teachers: teachers.data.payload || [],
        companies: companies.data.payload || [],
        drives: drives.data.payload || [],
      });
      setStatus('ready');
    })();
    return () => { cancelled = true; };
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (status === 'error') return <ErrorPanel message={err} onRetry={() => setStatus('loading')} />;

  const columns = [
    { title: 'Students', rows: data.students, render: (s) => `${s.Deatils?.name || 'Student'} · Roll ${s.Rollno} · ${s.Branch || '—'} · CGPA ${s.CGPA ?? '—'}` },
    { title: 'Teachers', rows: data.teachers, render: (t) => `${t.Deatils?.name || 'Teacher'} · ${t.designation || '—'} · ${t.department || '—'}` },
    { title: 'Companies', rows: data.companies, render: (c) => `${c.CompanyName || 'Company'} · ${c.Email || '—'}` },
    { title: 'Drives', rows: data.drives, render: (d) => `${d.companyId?.CompanyName || 'Drive'} · ${d.JobRole || '—'} · ${d.Package || '—'}` },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {columns.map(({ title, rows, render }) => (
        <div key={title} className={cn(CARD, 'p-5')}>
          <CardHead title={title} sub={`${rows.length} total`} />
          {rows.length === 0 ? (
            <p className="mt-4 text-xs text-[#8a97a5]">None on record.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {rows.slice(0, 8).map((row, i) => (
                <li key={row._id || i} className="truncate rounded-xl bg-[#f1f4f6] px-3 py-2 text-xs text-[#0f172a]">
                  {render(row)}
                </li>
              ))}
              {rows.length > 8 && (
                <li className="text-[11px] font-semibold text-[#8a97a5]">+{rows.length - 8} more</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── page ────────────────────────────────────── */
export default function Dashboard() {
  const { user, profileDetails, logout, saveProfileDetails } = useContext(UserContext);
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rangeDays, setRangeDays] = useState(90);
  const [mode, setMode] = useState('monthly');
  const [query, setQuery] = useState('');
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [tab, setTab] = useState('overview');
  const [studentDoc, setStudentDoc] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyNotice, setApplyNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const role = String(user?.role || '').toLowerCase();
  const isHR = role === 'hr';
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';

  // Everyone gets Notifications; Admin additionally gets the roster panel.
  const navItems = useMemo(
    () => [
      ...NAV,
      { key: 'notifications', label: 'Notifications', Icon: Bell },
      ...(isAdmin ? [{ key: 'admin', label: 'Admin', Icon: ShieldCheck }] : []),
    ],
    [isAdmin],
  );

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const cfg = { withCredentials: true };
    const params = isStudent && user.email ? { studentEmail: user.email } : {};

    const [appsRes, drivesRes, analyticsRes, studentsRes] = await Promise.all([
      safeGet(`${API_BASE}/student-api/applications`, { ...cfg, params }, { payload: [] }),
      safeGet(
        isHR ? `${API_BASE}/drive-api/drive/hr/${user.id}` : `${API_BASE}/drive-api/drive`,
        cfg,
        { payload: [] },
      ),
      safeGet(`${API_BASE}/analytics-api/dashboard`, cfg, { payload: null }),
      // The student's own document, matched by `Deatils` (the user ref).
      // /student-api/student/:id filters on Rollno and there is no "me"
      // endpoint, so the (small) roster is filtered client side.
      safeGet(`${API_BASE}/student-api/student`, cfg, { payload: [] }),
    ]);

    if (!appsRes.ok && !drivesRes.ok && !analyticsRes.ok) {
      setError(`No response from ${API_BASE}. Is the backend running on that port?`);
      setLoading(false);
      return;
    }

    setApplications(Array.isArray(appsRes.data?.payload) ? appsRes.data.payload : []);
    setDrives(Array.isArray(drivesRes.data?.payload) ? drivesRes.data.payload : []);
    setAnalytics(analyticsRes.data?.payload || null);
    const roster = Array.isArray(studentsRes.data?.payload) ? studentsRes.data.payload : [];
    setStudentDoc(roster.find((s) => String(s.Deatils) === String(user.id)) || null);
    setLoading(false);
  }, [user, isHR, isStudent]);

  // Deferred one tick: `load` flips `loading` synchronously, and calling it
  // straight from the effect body is what react-hooks/set-state-in-effect
  // flags. Same request, one macrotask later; the cleanup drops a stale run if
  // `user` changes shape first.
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // UserContext fetches the session on mount. If it never arrives, this is a
  // direct hit on /dashboard without a login, so send them to /login.
  useEffect(() => {
    if (user || authTimedOut) return undefined;
    const timer = setTimeout(() => setAuthTimedOut(true), 2500);
    return () => clearTimeout(timer);
  }, [user, authTimedOut]);

  useEffect(() => {
    if (authTimedOut && !user) navigate('/login', { replace: true });
  }, [authTimedOut, user, navigate]);

  const cgpa = Number(profileDetails?.cgpa) || 0;
  const branch = profileDetails?.branch || '';

  const counts = useMemo(() => {
    const base = STATUSES.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    applications.forEach((app) => {
      if (base[app.status] !== undefined) base[app.status] += 1;
    });
    return base;
  }, [applications]);

  const from = useMemo(() => daysAgo(rangeDays), [rangeDays]);

  const inRange = useMemo(
    () => applications.filter((app) => {
      const date = parseDate(app.appliedAt || app.appliedDate);
      return date && date >= from;
    }),
    [applications, from],
  );

  const months = rangeDays <= 30 ? 3 : rangeDays <= 90 ? 6 : 12;
  const trackerRows = useMemo(
    () => (mode === 'annually' ? byYear(applications) : byMonth(applications, months)),
    [applications, mode, months],
  );
  const trendPoints = useMemo(() => cumulative(inRange, from), [inRange, from]);

  const eligibleDrives = useMemo(
    () => drives.filter((drive) => {
      const open = drive.status !== 'COMPLETED' && drive.status !== 'CANCELLED';
      const cgpaOk = !cgpa || Number(drive.MinCGPA || 0) <= cgpa;
      const allowed = Array.isArray(drive.AllowedBranch)
        ? drive.AllowedBranch.map((b) => String(b).toUpperCase())
        : [];
      const branchOk =
        allowed.length === 0 ||
        allowed.includes('ALL') ||
        allowed.includes(String(branch).toUpperCase());
      return open && cgpaOk && branchOk;
    }),
    [drives, cgpa, branch],
  );

  const closingSoon = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    return drives
      .map((drive) => ({ ...drive, at: parseDate(drive.LastDate) }))
      .filter((drive) => drive.at && drive.at >= today && drive.at <= limit)
      .sort((a, b) => a.at - b.at)
      .map((drive) => ({
        ...drive,
        // Math.ceil of whole days left, floored at 0 for a deadline that
        // expires today. Computed here rather than in JSX: rendering must stay
        // pure, and Date.now() during render is not.
        daysLeft: Math.max(0, Math.ceil((drive.at.getTime() - today.getTime()) / 86400000)),
      }));
  }, [drives]);

  const completeness = useMemo(() => {
    const fields = ['phone', 'cgpa', 'branch', 'skills', 'github', 'linkedin'];
    const filled = fields.filter((f) => String(profileDetails?.[f] || '').trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profileDetails]);

  const feed = useMemo(
    () => buildFeed(applications, closingSoon),
    [applications, closingSoon],
  );

  const avgPackage = analytics?.avgPackage ?? 0;
  const totalPlacements = analytics?.totalPlacements ?? 0;
  const firstName = String(user?.name || '').split(' ')[0] || 'there';

  const onApply = async (drive) => {
    setApplying(true);
    setApplyNotice('');
    const company = drive.companyId?.CompanyName || 'Company';
    try {
      await axios.post(
        `${API_BASE}/student-api/apply`,
        {
          driveid: drive._id,
          driveId: String(drive._id),
          company,
          role: drive.JobRole,
          salary: drive.Package,
          // studentid must be the STUDENT document id, not the user id: the
          // analytics endpoint populates studentid to read `Branch`.
          studentid: studentDoc?._id || user?.id,
          studentName: user?.name || 'Student',
          studentEmail: user?.email || '',
          studentCgpa: profileDetails?.cgpa || 'N/A',
          studentPhone: profileDetails?.phone || '',
          studentBranch: profileDetails?.branch || '',
          studentSkills: profileDetails?.skills || '',
          studentGithub: profileDetails?.github || '',
          studentLinkedin: profileDetails?.linkedin || '',
          resumeUrl: '',
          resumeName: '',
          status: 'APPLIED',
          appliedDate: new Date().toLocaleDateString(),
          appliedAt: new Date(),
        },
        { withCredentials: true },
      );
      setApplyNotice(`Applied to ${company}.`);
      setTab('applications');
      load();
    } catch (error) {
      setApplyNotice(
        `Could not apply to ${company}: ${error.response?.data?.message || 'server error'}`,
      );
    } finally {
      setApplying(false);
    }
  };

  const saveProfile = async (form) => {
    setSavingProfile(true);
    setProfileMsg('');
    const result = await saveProfileDetails(form);
    setProfileMsg(result.success ? 'Profile saved.' : result.error);
    setSavingProfile(false);
  };
  const totalApplications = applications.length;
  const successRate = totalApplications
    ? Math.round((counts.SELECTED / totalApplications) * 100)
    : 0;


  if (authTimedOut && !user) return null;

  return (
    <div className="min-h-screen bg-[#e4e8ec] p-4 sm:p-8">
      <div className="mx-auto max-w-[1400px] rounded-[32px] bg-[#fafbfc] p-5 sm:p-7">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#12a25a] text-white">
              <Send size={16} />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-[#0a7d45]">Quixotic</span>
          </Link>

          <nav className="flex flex-wrap gap-1.5 rounded-2xl border border-[#eceff2] bg-white p-1.5">
            {navItems.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                  tab === key
                    ? 'bg-[#12a25a] text-white shadow-[0_2px_8px_rgba(18,162,90,0.25)]'
                    : 'text-[#5a6b7d] hover:bg-[#f3f5f7] hover:text-[#0f172a]',
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[#eceff2] bg-white px-3 py-2">
              <Search size={14} className="text-[#8a97a5]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search applications"
                className="w-32 bg-transparent text-xs text-[#0f172a] outline-none placeholder:text-[#a4b0bd]"
              />
            </label>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a7d45] text-[11px] font-bold text-white">
              {initials(user?.name)}
            </span>
            <button
              type="button"
              onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
              className="flex items-center gap-1.5 rounded-full border border-[#eceff2] bg-white px-3 py-2 text-xs font-semibold text-[#5a6b7d] transition hover:border-[#fca5a5] hover:text-[#b42318]"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* greeting */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#0f172a]">
            Welcome Back, <span className="text-[#98a4b2]">{firstName}</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <select
              value={rangeDays}
              onChange={(event) => setRangeDays(Number(event.target.value))}
              className="rounded-full border border-[#eceff2] bg-white px-4 py-2.5 text-xs font-semibold text-[#5a6b7d]"
            >
              {RANGES.map((range) => (
                <option key={range.days} value={range.days}>{range.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setTab('drives')}
              className="flex items-center gap-2 rounded-full border border-[#eceff2] bg-white px-4 py-2.5 text-xs font-semibold text-[#0f172a] transition hover:border-[#12a25a] hover:text-[#0a7d45]"
            >
              <Plus size={14} /> Browse Drives
            </button>
          </div>
        </div>

        {/* student KPI cards */}
        <div className="mt-5 flex flex-wrap gap-4">
          <KpiCard label="Applications" value={loading ? '—' : applications.length} hint="All time" />
          <KpiCard label="Shortlisted" value={loading ? '—' : counts.SHORTLISTED} hint="Moved forward" tone="plain" />
          <KpiCard label="Interviews" value={loading ? '—' : counts.INTERVIEW} hint="In progress" tone="plain" />
          <KpiCard label="Offers" value={loading ? '—' : counts.SELECTED} hint="Offers received" tone="good" />
          <KpiCard label="Rejected" value={loading ? '—' : counts.REJECTED} hint="Not selected" tone="warn" />
          <KpiCard label="Avg Package" value={loading ? '—' : `${avgPackage} LPA`} hint={`${totalPlacements} placed`} tone="good" />
        </div>

        {error && <div className="mt-5"><ErrorPanel message={error} onRetry={load} /></div>}


        {/* body: icon rail + card grid */}
        <div className="mt-5 flex gap-5">
          <aside className="hidden shrink-0 flex-col justify-between self-stretch rounded-3xl border border-[#eceff2] bg-white py-5 lg:flex">
            <div className="flex flex-col items-center gap-3">
              {navItems.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  title={label}
                  aria-label={label}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl transition',
                    tab === key
                      ? 'bg-[#12a25a] text-white'
                      : 'text-[#8a97a5] hover:bg-[#f3f5f7] hover:text-[#0a7d45]',
                  )}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <button
              type="button"
              title="Logout"
              onClick={async () => { await logout(); navigate('/login', { replace: true }); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8a97a5] transition hover:bg-[#f3f5f7] hover:text-[#b42318]"
            >
              <LogOut size={17} />
            </button>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <div className="flex flex-col gap-5 xl:col-span-3">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-28" />
                </div>
                <Skeleton className="h-[360px] xl:col-span-5" />
                <div className="flex flex-col gap-5 xl:col-span-4">
                  <Skeleton className="h-72" />
                  <Skeleton className="h-40" />
                </div>
              </div>
            ) : tab === 'overview' ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* left: placement profile + readiness */}
              <div className="flex flex-col gap-5 xl:col-span-3">
                <div className={cn(CARD, 'p-5')}>
                  <CardHead
                    title="Placement Profile"
                    sub="Your placement readiness"
                    action={<RoundAction><ArrowUpRight size={15} /></RoundAction>}
                  />
                  <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#17a95f] to-[#0b7a43] p-5 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold italic tracking-tight">
                        {isHR ? 'HR' : isStudent ? 'STUDENT' : 'FACULTY'}
                      </span>
                      <TrendingUp size={16} className="opacity-80" />
                    </div>
                    <p className="mt-4 truncate text-xs opacity-80">
                      {profileDetails?.designation || user?.email || '—'}
                    </p>
                    <p className="truncate text-2xl font-bold">{user?.name || '—'}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="block opacity-70">Branch</span>
                        <span className="font-bold">{branch || '—'}</span>
                      </div>
                      <div>
                        <span className="block opacity-70">CGPA</span>
                        <span className="font-bold">{cgpa || '—'}</span>
                      </div>
                      <div>
                        <span className="block opacity-70">Role</span>
                        <span className="font-bold">{user?.role || '—'}</span>
                      </div>
                      <div>
                        <span className="block opacity-70">Skills</span>
                        <span className="font-bold">
                          {String(profileDetails?.skills || '').split(',').filter((s) => s.trim()).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cn(CARD, 'flex items-center justify-between gap-3 p-5')}>
                  <div>
                    <p className="text-xs text-[#8a97a5]">Profile Completeness</p>
                    <p className="text-2xl font-bold text-[#0f172a]">{completeness}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8a97a5]">Eligible Drives</p>
                    <p className="text-2xl font-bold text-[#0a7d45]">{eligibleDrives.length}</p>
                  </div>
                </div>
              </div>


              {/* centre: placement tracker */}
              <div className="xl:col-span-5">
                <TrackerCard rows={trackerRows} mode={mode} onModeChange={setMode} />
              </div>

              {/* right: trend, deadlines, branch split */}
              <div className="flex flex-col gap-5 xl:col-span-4">
                <TrendCard
                  points={trendPoints}
                  rangeDays={rangeDays}
                  onGoDrives={() => setTab('drives')}
                  onGoApplications={() => setTab('applications')}
                />

                <div className={cn(CARD, 'p-5')}>
                  <CardHead
                    title="Closing Soon"
                    sub="Deadlines in the next 30 days"
                    action={<RoundAction><ArrowUpRight size={15} /></RoundAction>}
                  />
                  {closingSoon.length === 0 ? (
                    <p className="mt-4 text-xs text-[#8a97a5]">
                      No drive closes in the next 30 days.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-3">
                      {closingSoon.slice(0, 4).map((drive) => {
                        const company = drive.companyId?.CompanyName || drive.Title || 'Drive';
                        return (
                          <button
                            key={drive._id}
                            type="button"
                            onClick={() => setTab('drives')}
                            className="flex w-full items-center justify-between gap-3 text-left"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a7d45] text-[11px] font-bold text-white">
                                {initials(company)}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-bold text-[#0f172a]">{company}</span>
                                <span className="block truncate text-[10px] text-[#8a97a5]">
                                  {drive.JobRole} · {drive.Package}
                                </span>
                              </span>
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                                drive.daysLeft <= 7
                                  ? 'bg-[#fdecec] text-[#b42318]'
                                  : 'bg-[#e7f7ee] text-[#0a7d45]',
                              )}
                            >
                              {drive.daysLeft}d left
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={cn(CARD, 'p-5')}>
                  <CardHead
                    title="Branch Placements"
                    sub="Selected students per branch"
                    action={<RoundAction><BarChart3 size={15} /></RoundAction>}
                  />
                  {Object.keys(analytics?.branchBreakdown || {}).length === 0 ? (
                    <p className="mt-4 text-xs text-[#8a97a5]">
                      No branch data yet. Placements show up here once HR marks a candidate selected.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-col gap-3">
                      {Object.entries(analytics.branchBreakdown).map(([name, value]) => {
                        const max = Math.max(
                          ...Object.values(analytics.branchBreakdown).map(Number),
                          1,
                        );
                        return (
                          <div key={name} className="flex items-center gap-3">
                            <span className="w-12 shrink-0 text-[11px] font-semibold text-[#5a6b7d]">{name}</span>
                            <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f4f6]">
                              <span
                                className="block h-full rounded-full bg-[#12a25a]"
                                style={{ width: `${Math.round((Number(value) / max) * 100)}%` }}
                              />
                            </span>
                            <span className="w-6 shrink-0 text-right text-[11px] font-bold text-[#0f172a]">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>


              {/* recent applications span the left + centre */}
              <div className="xl:col-span-8">
                <RecentTable
                  rows={applications}
                  query={query}
                  onClearQuery={() => setQuery('')}
                  onGoDrives={() => setTab('drives')}
                />
              </div>
            </div>
            ) : tab === 'drives' ? (
              <DrivesView
                drives={drives}
                applications={applications}
                cgpa={cgpa}
                branch={branch}
                onApply={onApply}
                applying={applying}
                notice={applyNotice}
              />
            ) : tab === 'applications' ? (
              <ApplicationsView
                applications={applications}
                query={query}
                onClearQuery={() => setQuery('')}
              />
            ) : tab === 'analytics' ? (
              <AnalyticsSection
                counts={counts}
                applications={applications}
                successRate={successRate}
              />
            ) : tab === 'notifications' ? (
              <NotificationsView events={feed} />
            ) : tab === 'admin' ? (
              <AdminView />
            ) : (
              <SettingsView
                user={user}
                profileDetails={profileDetails}
                onSave={saveProfile}
                saving={savingProfile}
                message={profileMsg}
              />
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Refresh dashboard data"
        onClick={load}
        disabled={loading}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#eceff2] bg-white text-[#0f172a] shadow-lg transition hover:text-[#0a7d45] disabled:opacity-50"
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}


