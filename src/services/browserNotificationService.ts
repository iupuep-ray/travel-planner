const TODO_NOTIFICATION_TITLE = '待辦事項提醒';

export const TODO_NOTIFICATION_TEMPLATE = '您設定的待辦事項 $待辦事項項目內容 尚未完成，請你快點完成！！！';

export const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isBrowserNotificationSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
};

export const buildTodoNotificationMessage = (todoContent: string): string => {
  return TODO_NOTIFICATION_TEMPLATE.replace('$待辦事項項目內容', todoContent);
};

export const showTodoReminderNotification = (todoId: string, todoContent: string): boolean => {
  if (!isBrowserNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const notification = new Notification(TODO_NOTIFICATION_TITLE, {
    body: buildTodoNotificationMessage(todoContent),
    tag: `todo-reminder-${todoId}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return true;
};
