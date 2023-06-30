export const Calendar = {
    sunday: 'Pz',
    monday: 'Pzt',
    tuesday: 'Sal',
    wednesday: 'Çar',
    thursday: 'Per',
    friday: 'Cum',
    saturday: 'Cmt',
    ok: 'Tamam',
    today: 'Bugün',
    yesterday: 'Dün',
    hours: 'Saat',
    minutes: 'Dakika',
    seconds: 'Saniye',
    formattedMonthPattern: 'MMM, yyyy',
    formattedDayPattern: 'MMM dd, yyyy',
};
export const locale = {
    common: {
        loading: 'Yükleniyor...',
        emptyMessage: 'Veri Bulunamadı'
    },
    Plaintext: {
        unfilled: 'Doldurulmamış',
        notSelected: 'Seçili Değil',
        notUploaded: 'Yüklenmedi'
    },
    Pagination: {
        more : 'Daha Fazla',
        prev: 'Önceki',
        next: 'Sonraki',
        first: 'İlk',
        last: 'Son',
        limit: '{0} / Sayfa',
        total: 'Toplam Satır: {0}',
        skip: 'Git{0}'
    },
    Calendar,
    DatePicker: {
        ...Calendar
    },
    DateRangePicker: {
        ...Calendar,
        last7Days: 'Son 7 gün',
    },
    Picker: {
        noResultsText: 'Sonuç Bulunamadı',
        placeholder: 'Seç',
        searchPlaceholder: 'Ara',
        checkAll: 'Hepsini Seç'
    },
    InputPicker: {
        newItem: 'Yeni Öğe',
        createOption: 'Seçenek Oluştur "{0}"'
    },
    Uploader: {
        inited: 'Baştaki',
        progress: 'Yükleniyor',
        error: 'Hata',
        complete: 'Tamamlanmış',
        emptyFile: 'Boş',
        upload: 'Yükle'
    },
    CloseButton: {
        closeLabel: 'Kapat'
    },
    Breadcrumb: {
        expandText: 'Yolu Göster'
    },
    Toggle: {
        on: 'Açık',
        off: 'Kapalı'
    }
};
