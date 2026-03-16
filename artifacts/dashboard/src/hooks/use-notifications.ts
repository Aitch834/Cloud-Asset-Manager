import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react/src/custom-fetch";

export interface AppNotification {
  id: number;
  tenantId: number;
  farmId: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedModule: string | null;
  relatedId: number | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

function notificationsKey(farmId: number) {
  return ["notifications", farmId];
}

export function useNotifications(farmId: number | null) {
  return useQuery<NotificationsResponse>({
    queryKey: notificationsKey(farmId ?? 0),
    queryFn: () => customFetch<NotificationsResponse>(`/api/farms/${farmId}/notifications`),
    enabled: !!farmId,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead(farmId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notifId: number) =>
      customFetch(`/api/farms/${farmId}/notifications/${notifId}/read`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
  });
}

export function useMarkAllRead(farmId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      customFetch(`/api/farms/${farmId}/notifications/read-all`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
  });
}

export function useDeleteNotification(farmId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notifId: number) =>
      customFetch(`/api/farms/${farmId}/notifications/${notifId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKey(farmId ?? 0) }),
  });
}
