import { Bell, Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteNotifications,
} from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useNotifications();

  // Mutations
  const { mutate: markAsReadMutation } = useMarkNotificationAsRead();
  const { mutate: markAllAsReadMutation } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotificationMutation } = useDeleteNotification();
  const { mutate: deleteAllNotificationsMutation } = useDeleteNotifications();

  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);

  // Extract data from response
  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isYesterday = (dateString: string) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  };

  const groupNotificationsByDate = () => {
    const today: typeof notifications = [];
    const yesterday: typeof notifications = [];
    const earlier: typeof notifications = [];

    const notificationsToShow = showAll
      ? notifications
      : notifications.slice(0, 3);

    notificationsToShow.forEach((notification) => {
      if (isToday(notification.createdAt)) {
        today.push(notification);
      } else if (isYesterday(notification.createdAt)) {
        yesterday.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return { today, yesterday, earlier };
  };

  const { today, yesterday, earlier } = groupNotificationsByDate();

  // Mark unread notifications as read when dropdown opens
  useEffect(() => {
    if (open && notifications.length > 0) {
      const unreadNotifications = showAll
        ? notifications.filter((n) => !n.isRead)
        : notifications.slice(0, 3).filter((n) => !n.isRead);

      unreadNotifications.forEach((notification) => {
        markAsReadMutation(notification.id);
      });
    }
  }, [open, showAll]);

  const getNotificationIcon = () => {
    return (
      <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
        <Building2 className="h-5 w-5 text-white" />
      </div>
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation(notificationId, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Notification deleted successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to delete notification.",
          variant: "destructive",
        });
      },
    });
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: (typeof notifications)[0];
  }) => (
    <div className="p-3 hover:bg-accent/50 transition-colors">
      <div className="flex gap-3">
        {getNotificationIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-600 mb-1 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex justify-end">
            <p className="text-xs text-gray-400">
              {formatTimeAgo(notification.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );

  const NotificationSection = ({
    title,
    items,
  }: {
    title: string;
    items: typeof notifications;
  }) => {
    if (items.length === 0) return null;

    const handleClearAll = (e: React.MouseEvent) => {
      e.stopPropagation();

      // Delete each notification in the section
      items.forEach((notification) => {
        deleteNotificationMutation(notification.id);
      });

      toast({
        title: "Cleared",
        description: `All ${title.toLowerCase()} notifications cleared.`,
      });
    };

    return (
      <div>
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          <button
            onClick={handleClearAll}
            className="text-[11px] text-red-500 hover:text-red-600 font-medium"
          >
            Clear All
          </button>
        </div>
        <div>
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleViewAll = () => {
    setShowAll(true);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-[41px] w-[41px] border-none shadow-none hover:bg-transparent"
        >
          <div className="relative">
            <Bell className="h-5 w-5 text-black fill-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 p-0 rounded-2xl shadow-lg border border-gray-200"
      >
        <ScrollArea
          className={`${
            showAll
              ? "h-[500px] [&::-webkit-scrollbar]:hidden"
              : "h-auto max-h-[400px]"
          } overflow-y-auto`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-16 w-16 mb-3 opacity-20 animate-pulse" />
              <p className="text-sm font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-16 w-16 mb-3 opacity-20" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We'll notify you when something arrives
              </p>
            </div>
          ) : (
            <div>
              <NotificationSection title="Today" items={today} />
              <NotificationSection title="Yesterday" items={yesterday} />
              <NotificationSection title="Earlier" items={earlier} />
            </div>
          )}
        </ScrollArea>
        {notifications.length > 3 && !showAll && (
          <div className="border-t p-1 bg-gray-50">
            <Button
              variant="link"
              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={handleViewAll}
            >
              View all
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
