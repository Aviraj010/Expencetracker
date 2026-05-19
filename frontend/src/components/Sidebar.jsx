import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  TrendingDown,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react';
import api from '../utils/api';
import iconImg from '../assets/icon.png';

const SIDEBAR_STORAGE_KEY = 'finance-sidebar-collapsed';
const THEME_STORAGE_KEY = 'theme';

const sidebarVariants = {
  expanded: {
    width: 288,
    transition: { type: 'spring', stiffness: 260, damping: 32 },
  },
  collapsed: {
    width: 92,
    transition: { type: 'spring', stiffness: 260, damping: 32 },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  closed: { x: '-100%' },
  open: {
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 32 },
  },
};

const labelVariants = {
  expanded: { opacity: 1, x: 0, display: 'block' },
  collapsed: {
    opacity: 0,
    x: -8,
    transitionEnd: { display: 'none' },
  },
};

const menuGroups = [
  {
    id: 'overview',
    label: 'Workspace',
    defaultOpen: true,
    items: [
      {
        label: 'Dashboard',
        path: '/',
        icon: Home,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    id: 'money',
    label: 'Finance',
    defaultOpen: true,
    items: [
      {
        label: 'Income',
        path: '/income',
        icon: TrendingUp,
        roles: ['user', 'admin'],
      },
      {
        label: 'Expenses',
        path: '/expense',
        icon: TrendingDown,
        roles: ['user', 'admin'],
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    defaultOpen: true,
    items: [
      {
        label: 'Profile',
        path: '/profile',
        icon: UserRound,
        roles: ['user', 'admin'],
      },
      {
        label: 'Password',
        path: '/change-password',
        icon: ShieldCheck,
        roles: ['user', 'admin'],
      },
    ],
  },
];

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
}

function getInitialCollapsed() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function CollapsedTooltip({ children, label, disabled }) {
  return (
    <div className="group relative flex justify-center">
      {children}
      <span
        className={cx(
          'pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-xs font-semibold text-base-content opacity-0 shadow-2xl transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100',
          disabled && 'text-base-content/50'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function SidebarItem({ item, collapsed, isActive, onNavigate }) {
  const Icon = item.icon;
  const itemContent = (
    <motion.div
      whileHover={item.disabled ? {} : { x: collapsed ? 0 : 3, scale: 1.01 }}
      whileTap={item.disabled ? {} : { scale: 0.98 }}
      className={cx(
        'relative flex h-12 items-center overflow-hidden rounded-2xl px-3 text-sm font-medium outline-none transition-colors',
        collapsed ? 'justify-center' : 'gap-3',
        isActive
          ? 'border border-primary/20 bg-primary/10 text-primary shadow-sm'
          : 'text-base-content/70 hover:bg-base-200 hover:text-base-content',
        item.disabled && 'cursor-not-allowed opacity-55 hover:bg-transparent'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-sidebar-item"
          className="absolute inset-0 rounded-2xl bg-primary/10"
          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        />
      )}

      {isActive && (
        <motion.div
          className="absolute left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <span
        className={cx(
          'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
          isActive ? 'bg-primary/10 text-primary' : 'bg-base-100 text-base-content/70'
        )}
      >
        <motion.span
          animate={isActive ? { rotate: [0, -5, 5, 0], scale: 1.05 } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <Icon size={19} strokeWidth={2.2} />
        </motion.span>
      </span>

      <motion.span
        variants={labelVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        className="relative z-10 min-w-0 flex-1 truncate"
      >
        {item.label}
      </motion.span>
    </motion.div>
  );

  const wrapped = item.disabled ? (
    <button
      type="button"
      className="w-full text-left"
      disabled
      aria-disabled="true"
      title={item.label}
    >
      {itemContent}
    </button>
  ) : (
    <Link
      to={item.path}
      onClick={onNavigate}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
      aria-current={isActive ? 'page' : undefined}
      title={item.label}
    >
      {itemContent}
    </Link>
  );

  if (collapsed) {
    return (
      <CollapsedTooltip label={item.label} disabled={item.disabled}>
        {wrapped}
      </CollapsedTooltip>
    );
  }

  return wrapped;
}

function SidebarGroup({ group, collapsed, query, location, onNavigate }) {
  const [open, setOpen] = useState(group.defaultOpen);

  const filteredItems = collapsed
    ? group.items
    : group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      );

  if (!filteredItems.length) return null;

  return (
    <div className="space-y-2">
      {!collapsed && (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/40 transition-colors hover:text-base-content/70"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span>{group.label}</span>
          <motion.span animate={{ rotate: open ? 0 : -90 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>
      )}

      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-1 overflow-hidden"
          >
            {filteredItems.map((item) => {
              const isActive =
                Boolean(item.path) &&
                (location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path)));

              return (
                <SidebarItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive}
                  onNavigate={onNavigate}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({
  collapsed,
  setCollapsed,
  mobile,
  onClose,
  theme,
  toggleTheme,
  profile,
  handleLogout,
}) {
  const location = useLocation();
  const [query, setQuery] = useState('');

  const visibleGroups = useMemo(() => menuGroups, []);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-none border-base-300 bg-base-100/90 text-base-content shadow-xl backdrop-blur-2xl lg:rounded-r-3xl lg:border-r">
      <div className="pointer-events-none absolute -right-24 top-12 h-44 w-44 rounded-full bg-base-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-4 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      {!mobile && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05, x: collapsed ? 1 : 0 }}
          whileTap={{ scale: 0.94 }}
          className="absolute -right-3 top-6 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 shadow-lg transition-colors hover:border-primary/30 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <ChevronRight size={15} strokeWidth={2.5} />
          </motion.span>
        </motion.button>
      )}

      <div className="relative z-10 flex items-center gap-3 border-b border-base-300/70 p-4">
        <motion.div
          whileHover={{ y: -1, scale: 1.02 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
            <img src={iconImg} alt="Expense Tracker" className="h-8 w-8 object-contain" />
          </div>
        </motion.div>

        <motion.div
          variants={labelVariants}
          animate={collapsed ? 'collapsed' : 'expanded'}
          className="min-w-0 flex-1"
        >
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-black tracking-tight">
              Expense Tracker
            </h2>
          </div>
          <p className="truncate text-xs text-base-content/50">
            Finance workspace
          </p>
        </motion.div>

        <div className="flex shrink-0 items-center gap-1">
          {mobile && (
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 border-b border-base-300/70 p-4">
        {collapsed ? (
          <CollapsedTooltip label="Search navigation">
            <button type="button" className="btn btn-ghost btn-circle">
              <Search size={19} />
            </button>
          </CollapsedTooltip>
        ) : (
          <label className="input input-bordered input-sm flex h-11 items-center gap-2 rounded-2xl bg-base-200/70">
            <Search size={16} className="text-base-content/40" />
            <input
              type="search"
              className="grow"
              placeholder="Search navigation..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search navigation"
            />
          </label>
        )}
      </div>

      <nav className="relative z-10 flex-1 space-y-5 overflow-y-auto px-3 py-4 scroll-smooth">
        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            collapsed={collapsed}
            query={query}
            location={location}
            onNavigate={onClose}
          />
        ))}

        {!collapsed && query && (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/60 p-4 text-center text-sm text-base-content/60">
            Use exact menu names to narrow results.
          </div>
        )}
      </nav>

      <div className="relative z-10 border-t border-base-300/70 p-3">
        <div
          className={cx(
            'mb-3 rounded-2xl border border-base-300 bg-base-200/70 p-3',
            collapsed && 'flex justify-center p-2'
          )}
        >
          <div className={cx('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="avatar placeholder">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-base-300 bg-base-100 text-base-content/60">
                <UserRound size={20} strokeWidth={2.2} />
              </div>
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{profile.name || 'Finance User'}</p>
                <p className="truncate text-xs text-base-content/50">
                  {profile.email || 'Protected account'}
                </p>
              </div>
            )}

            {!collapsed && (
              <div className="dropdown dropdown-top dropdown-end">
                <button
                  tabIndex={0}
                  type="button"
                  className="btn btn-ghost btn-circle btn-xs"
                  aria-label="Open user menu"
                >
                  <ChevronDown size={15} />
                </button>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-50 mb-3 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl"
                >
                  <li>
                    <Link to="/profile" onClick={onClose}>
                      <UserRound size={16} />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={toggleTheme}>
                      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>
                  </li>
                  <li>
                    <button type="button" className="text-error" onClick={handleLogout}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className={cx('grid gap-2', collapsed ? 'grid-cols-1' : 'grid-cols-2')}>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cx(
              'btn btn-outline min-h-11 rounded-2xl border-base-300',
              collapsed ? 'btn-square' : 'justify-start gap-2'
            )}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
            {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cx(
              'btn btn-error min-h-11 rounded-2xl',
              collapsed ? 'btn-square' : 'justify-start gap-2'
            )}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [theme, setTheme] = useState(getInitialTheme);
  const [profile, setProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    let isMounted = true;

    api
      .get('/user/me')
      .then((response) => {
        if (!isMounted) return;
        const user = response.data?.user;
        if (user) {
          setProfile({
            name: user.name || '',
            email: user.email || '',
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile({ name: '', email: '' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      toast.success(`${nextTheme === 'dark' ? 'Dark' : 'Light'} mode activated`);
      return nextTheme;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    setMobileOpen(false);
    setTimeout(() => navigate('/auth'), 350);
  };

  return (
    <>
      <div className="navbar fixed left-0 right-0 top-0 z-40 border-b border-base-300 bg-base-100/80 shadow-lg backdrop-blur-xl lg:hidden">
        <div className="flex-1">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>
          <div className="ml-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <img src={iconImg} alt="Expense Tracker" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black">Expense Tracker</p>
              <p className="text-xs text-base-content/50">Finance workspace</p>
            </div>
          </div>
        </div>
        <div className="flex-none gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-50 bg-neutral/60 backdrop-blur-sm lg:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation overlay"
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] lg:hidden"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <SidebarContent
                collapsed={false}
                setCollapsed={setCollapsed}
                mobile
                onClose={() => setMobileOpen(false)}
                theme={theme}
                toggleTheme={toggleTheme}
                profile={profile}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        className="sticky top-0 hidden h-screen shrink-0 p-0 lg:block"
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        initial={false}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobile={false}
          onClose={() => {}}
          theme={theme}
          toggleTheme={toggleTheme}
          profile={profile}
          handleLogout={handleLogout}
        />
      </motion.aside>

      <div className="h-16 lg:hidden" />
    </>
  );
}
