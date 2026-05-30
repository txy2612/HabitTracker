export type NotificationPermissionBannerProps = {
  permission: NotificationPermission | "unsupported";
  onEnable: () => Promise<void>;
};

export function NotificationPermissionBanner({ permission, onEnable }: NotificationPermissionBannerProps) {
  void permission;

  return (
    <section className="notification-permission-placeholder">
      {/* TODO: Ask user to allow notifications when needed. */}
      <button onClick={onEnable} type="button">
        Enable notifications
      </button>
    </section>
  );
}
