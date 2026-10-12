import React from 'react';
import { Loader2 } from 'lucide-react';

// ─── Button ──────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants: Record<string, string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-2xs',
  };

  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 rounded-xl',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 rounded-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2 text-sm border rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
            error ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── Textarea ────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-150 resize-y min-h-[90px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 ${
            error ? 'border-rose-400' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ─── Select ──────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-900 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 hover:border-slate-300 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    accent: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) {
  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-3.5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-2xs ${paddings[padding]} ${
        hover ? 'hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200/60 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes: Record<string, string> = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={`${sizes[size]} animate-spin text-indigo-600 ${className}`} />;
}

// ─── Page Loading ────────────────────────────────────────────────────────

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ─── Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full ${sizes[size]} animate-slideUp overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────

interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200/80 p-0.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all relative cursor-pointer ${
            activeTab === tab.id
              ? 'text-indigo-600 bg-indigo-50/70'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Visibility Badge ────────────────────────────────────────────────────

export function VisibilityBadge({ visibility }: { visibility: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    public: { label: 'Public', variant: 'success' },
    private: { label: 'Private', variant: 'default' },
    shared: { label: 'Shared', variant: 'accent' },
  };
  const { label, variant } = config[visibility] || config.private;
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Status Badge ────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'warning' },
    published: { label: 'Published', variant: 'success' },
    archived: { label: 'Archived', variant: 'default' },
  };
  const { label, variant } = config[status] || config.draft;
  return <Badge variant={variant}>{label}</Badge>;
}
