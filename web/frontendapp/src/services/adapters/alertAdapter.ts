/**
 * Alert Adapter
 * Provides a unified interface for alerts/notifications across web and React Native
 * Uses window.alert() for web, but can be extended with custom notification system
 */

interface AlertConfig {
  title?: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
  }>;
}

/**
 * Web alert implementation using window.alert()
 * Can be extended to use custom notification UI
 */
export const alertAdapter = {
  /**
   * Show a simple alert dialog
   * @param message Alert message to display
   * @param title Optional alert title
   */
  alert(message: string, title?: string): void {
    const displayMessage = title ? `${title}\n\n${message}` : message;
    window.alert(displayMessage);
  },

  /**
   * Show a detailed alert with title and message
   * @param title Alert title
   * @param message Alert message
   * @param buttons Optional action buttons (web ignores buttons, shows basic alert)
   */
  alertWithTitle(
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void }>
  ): void {
    const displayMessage = `${title}\n\n${message}`;
    const result = window.confirm(displayMessage);

    // If there are buttons and user confirmed, call the first button's onPress
    if (result && buttons && buttons.length > 0) {
      buttons[0].onPress?.();
    } else if (!result && buttons && buttons.length > 1) {
      // If user cancelled and there's a second button, call it
      buttons[1].onPress?.();
    }
  },

  /**
   * Show an error alert
   * @param message Error message
   * @param title Optional error title (default: "Error")
   */
  error(message: string, title: string = 'Error'): void {
    this.alert(message, title);
  },

  /**
   * Show a success alert
   * @param message Success message
   * @param title Optional title (default: "Success")
   */
  success(message: string, title: string = 'Success'): void {
    this.alert(message, title);
  },

  /**
   * Show a warning alert
   * @param message Warning message
   * @param title Optional title (default: "Warning")
   */
  warn(message: string, title: string = 'Warning'): void {
    this.alert(message, title);
  },

  /**
   * Show an info alert
   * @param message Info message
   * @param title Optional title (default: "Info")
   */
  info(message: string, title: string = 'Info'): void {
    this.alert(message, title);
  },

  /**
   * Show a confirmation dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param onConfirm Callback if user confirms
   * @param onCancel Callback if user cancels
   */
  confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    const displayMessage = `${title}\n\n${message}`;
    const result = window.confirm(displayMessage);

    if (result) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  },

  /**
   * Show a prompt dialog (get user input)
   * @param title Dialog title
   * @param message Dialog message
   * @param onSubmit Callback with user input
   * @param onCancel Callback if user cancels
   * @param defaultValue Default input value
   */
  prompt(
    title: string,
    message: string,
    onSubmit?: (text: string) => void,
    onCancel?: () => void,
    defaultValue?: string
  ): void {
    const displayMessage = `${title}\n\n${message}`;
    const result = window.prompt(displayMessage, defaultValue);

    if (result !== null) {
      onSubmit?.(result);
    } else {
      onCancel?.();
    }
  },
};

export default alertAdapter;
