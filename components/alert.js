import Swal from 'sweetalert2';

export default function alert(title, message, icon, callback) {
    Swal.fire({
        customClass: 'swal-custom',
        toast: true,
        timerProgressBar: true,
        position: 'top-end',
        icon: icon,
        title: title,
        text: message,
        showConfirmButton: false,
        timer: 2000,
    }).then(() => {
        if (callback !== null) {
            callback();
        }
    }).catch(error => {
        console.log("Response:", error);
    })
}

