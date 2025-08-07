import { BaseToast, ErrorToast } from "react-native-toast-message";

export const ToastConfig = {
  success: (props) => <BaseToast {...props} />,
  error: (props) => <ErrorToast {...props} />,
};
