import Swal from 'sweetalert2';

export default function alert(callback) {
    Swal.fire({
        customClass: 'swal-custom',
        toast: true,
        timerProgressBar: true,
        position: 'top-end',
        icon: "error",
        title: "Yetkiniz Bulunmuyor!",
        text: "Ana sayfaya yönlendiriliyorsunuz.",
        showConfirmButton: false,
        timer: 2000,
    }).then(() => {
        if (callback !== null) {
            callback();
        }
    }).catch(error => {
        console.log(error);
    })
}

