import Swal from 'sweetalert2';
import axios from "axios";
import alertSwal from "../components/alert";

// Silme işlemi için kullanılan fonksiyon
export default function askDelete(url, getToken, callback) {
    Swal.fire({
        title: 'Emin misiniz ?',
        text: "Silme işlemi yapmak istediğinize emin misiniz? Bu işlem geri alınamaz!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#156396',
        cancelButtonColor: '#c41414',
        confirmButtonClass: 'btn btn-sm',
        confirmButtonText: 'Evet, sil!',
        cancelButtonText: 'İptal',
        cancelButtonClass:'btn btn-sm',
    }).then((result) => {
        if (result.isConfirmed) {
            axios({
                method: 'delete',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    AuthToken: getToken
                },
            }).then((response) => {
                if (callback !== null) {
                    callback();
                }
                alertSwal(response.data.title, response.data.message, response.data.status, callback)
            }).catch(error => {
                console.log("Silme işlemi başarısız axios hatası:", error);
            })
            // axios.delete(url)
            //     .then((response) => {
            //         alertSwal(response.data.title, response.data.message, response.data.status, callback)
            //     })
            //     .catch(error => {
            //         console.log(error);
            //     })
        }
    })
}