import { Alert, Platform } from 'react-native';

/** Cross-platform confirm — Alert buttons are unreliable on web. */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'OK',
  destructive = false
): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = window.confirm(destructive ? `${title}\n\n${message}` : `${title}\n\n${message}`);
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}

export function showMessage(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
