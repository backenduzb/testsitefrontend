import { toast } from "react-toastify";
import ConfirmToast from "./ToastConfirm";

export const showConfirmToast = (message: string, onConfirm: () => void) => {
    toast(
        (props) => (
            <ConfirmToast
                {...props}
                toastProps={{ message }}
                onConfirm={onConfirm}
            />
        ),
        {
            closeButton: false,
            autoClose: false,    
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            position: "top-left",
        }
    );
}

