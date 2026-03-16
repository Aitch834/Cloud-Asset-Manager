import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, AlertTriangle, Info, AlertCircle, ClipboardCheck, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification, type AppNotification } from "@/hooks/use-notifications";
import { Link } from "wouter";

function severityIcon(severity: string) {
  switch (severity) {
    case "critical": return <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
    case "warning":  return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
    default:         return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
  }
}

function severityBg(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-50 border-l-red-400";
    case "warning":  return "bg-amber-50 border-l-amber-400";
    default:         return "bg-blue-50 border-l-blue-400";
  }
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

interface NotificationItemProps {
  notif: AppNotification;
  farmId: number;
  onClose: () => void;
}

function NotificationItem({ notif, farmId, onClose }: NotificationItemProps) {
  const { mutate: markRead } = useMarkNotificationRead(farmId);
  const { mutate: deleteNotif } = useDeleteNotification(farmId);

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notif.isRead) markRead(notif.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotif(notif.id);
  };

  const handleClick = () => {
    if (!notif.isRead) markRead(notif.id);
    onClose();
  };

  const href = notif.relatedModule === "inspections" ? "/inspections" : `/${notif.relatedModule ?? "dashboard"}`;

  return (
    <div className={cn(
      "group relative border-l-4 px-4 py-3 transition-colors cursor-pointer",
      severityBg(notif.severity),
      !notif.isRead ? "opacity-100" : "opacity-60",
    )} onClick={handleClick}>
      <Link href={href} className="block">
        <div className="flex gap-3 items-start">
          {severityIcon(notif.severity)}
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-semibold text-foreground leading-tight", !notif.isRead && "font-bold")}>
              {notif.title}
            </p>
            <p className="text-xs text-foreground/70 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
            <p className="text-[10px] text-foreground/40 mt-1 font-medium">{relativeTime(notif.createdAt)}</p>
          </div>
          {!notif.isRead && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
      </Link>
      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
        {!notif.isRead && (
          <button
            title="Mark as read"
            onClick={handleMarkRead}
            className="p-1 rounded bg-white/80 hover:bg-white text-foreground/50 hover:text-primary transition-colors"
          >
            <CheckCheck className="w-3 h-3" />
          </button>
        )}
        <button
          title="Dismiss"
          onClick={handleDelete}
          className="p-1 rounded bg-white/80 hover:bg-white text-foreground/50 hover:text-red-500 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const { farmId } = useAppStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data } = useNotifications(farmId);
  const { mutate: markAllRead } = useMarkAllRead(farmId);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="p-2.5 rounded-full bg-white border border-border shadow-sm hover:shadow-md transition-all text-foreground/70 relative cursor-pointer"
        onClick={() => setOpen(prev => !prev)}
        aria-label="Open notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-border/50 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-foreground text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-black/5 cursor-pointer">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm">All clear</p>
                <p className="text-xs text-foreground/50 mt-1">No alerts right now — your farm is on track.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  farmId={farmId!}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border/50 px-4 py-2.5 bg-black/[0.02]">
              <Link href="/inspections" onClick={() => setOpen(false)}>
                <button className="w-full text-xs text-foreground/50 hover:text-primary transition-colors flex items-center justify-center gap-1 cursor-pointer">
                  View all in Inspections
                  <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
