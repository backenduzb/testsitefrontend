import { toast } from "react-toastify";
import ConfirmToast from "./ToastConfirm";

export const showConfirmToast = (message: string, onConfirm: () => void) => {
    toast(
        (props) => (
            <ConfirmToast
                {...props}
                message={message}
                onConfirm={onConfirm}
            />
        ),
        {
            closeButton: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            position: "top-left",
            autoClose: 3000,
        }
    );
}
