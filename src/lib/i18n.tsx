import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'ru' | 'ka';

export interface Translations {
  nav: {
    fleet: string;
    admin: string;
    findUs: string;
    reviews: string;
    faq: string;
  };
  hero: {
    title: string;
    titleItalic: string;
    subtitle: string;
  };
  categories: {
    sectionTitle: string;
    selectCar: string;
    city: { label: string; sublabel: string };
    mountains: { label: string; sublabel: string };
    sea: { label: string; sublabel: string };
    winter: { label: string; sublabel: string };
  };
  filters: {
    searchPlaceholder: string;
    allTypes: string;
    automatic: string;
    manual: string;
    anyPrice: string;
    under50: string;
    range50100: string;
    over100: string;
    featured: string;
    lowToHigh: string;
    highToLow: string;
  };
  card: {
    day: string;
    seats: string;
    book: string;
    bookNow: string;
    from: string;
    withDriver: string;
    rentalPeriod: string;
    driverLabel: string;
    withoutDriver: string;
    reserve: string;
    tiers: {
      day1: string;
      day2: string;
      day3_4: string;
      day5_7: string;
      day8plus: string;
    };
    whatsappMsg: (year: number | null, brand: string, model: string) => string;
    reserveMsg: (brand: string, model: string, year: number | null, period: string, driverOption: string, price: number, driverPrice?: number | null) => string;
  };
  states: {
    loading: string;
    noResults: string;
    noResultsHint: string;
  };
  whyChoose: {
    sectionTitle: string;
    sectionSubtitle: string;
    manager: { title: string; desc: string };
    assistance: { title: string; desc: string };
    winterTires: { title: string; desc: string };
    extras: { title: string; desc: string };
  };
  faq: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: { question: string; answer: string }[];
  };
  findUs: {
    sectionTitle: string;
    sectionSubtitle: string;
    tbilisi: string;
    batumi: string;
    kutaisi: string;
    whatsapp: string;
  };
  reviews: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  featureBar: {
    insurance: string;
    noFees: string;
    support: string;
    delivery: string;
  };
  social: {
    heading: string;
  };
  admin: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      signIn: string;
      signingIn: string;
      footer: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      addVehicle: string;
      publicSite: string;
      signOut: string;
      totalFleet: string;
      available: string;
      rented: string;
      maintenance: string;
      inactive: string;
      search: string;
      vehicles: string;
      colPhoto: string;
      colVehicle: string;
      colSpecs: string;
      colPrice: string;
      colStatus: string;
      colActions: string;
      specTrans: string;
      specEngine: string;
      specSeats: string;
      perDay: string;
      withDriver: string;
      loadingFleet: string;
      noMatch: string;
      noVehicles: string;
      deleteConfirm: string;
      auto: string;
      manual: string;
    };
    form: {
      editTitle: string;
      addTitle: string;
      photo: string;
      uploadPhoto: string;
      orPasteUrl: string;
      urlPlaceholder: string;
      brand: string;
      model: string;
      year: string;
      seats: string;
      transmission: string;
      fuelType: string;
      engine: string;
      mileage: string;
      pricingHeader: string;
      day1: string;
      day2: string;
      day3_4: string;
      day5_7: string;
      day8plus: string;
      withDriver: string;
      originalPrice: string;
      features: string;
      featuresHint: string;
      featuresPlaceholder: string;
      status: string;
      statusHint: string;
      cancel: string;
      save: string;
      add: string;
      automatic: string;
      manual: string;
      fuelPlaceholder: string;
      enginePlaceholder: string;
      mileagePlaceholder: string;
      statusAvailable: string;
      statusRented: string;
      statusMaintenance: string;
      statusInactive: string;
      uploadErrorBucket: string;
      uploadErrorGeneric: string;
    };
    toasts: {
      carCreated: string;
      carCreatedDesc: string;
      carUpdated: string;
      carUpdatedDesc: string;
      carDeleted: string;
      carDeletedDesc: string;
      errorCreate: string;
      errorUpdate: string;
      errorDelete: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      fleet: 'Fleet',
      admin: 'Admin',
      findUs: 'Where to find us',
      reviews: 'Reviews',
      faq: 'FAQ',
    },
    hero: {
      title: 'Drive with',
      titleItalic: 'Confidence',
      subtitle: 'Premium car rentals in Georgia. Modern fleet, unlimited mileage — and a personal manager available 24/7.',
    },
    categories: {
      sectionTitle: 'Choose Your Destination',
      selectCar: 'Select Car',
      city: { label: 'City', sublabel: 'Urban comfort drives' },
      mountains: { label: 'Mountains', sublabel: 'Conquer every peak' },
      sea: { label: 'Sea', sublabel: 'Coastal road trips' },
      winter: { label: 'Winter', sublabel: 'All-season confidence' },
    },
    filters: {
      searchPlaceholder: 'Search make or model...',
      allTypes: 'All Types',
      automatic: 'Automatic',
      manual: 'Manual',
      anyPrice: 'Any Price',
      under50: 'Under $50',
      range50100: '$50 – $100',
      over100: 'Over $100',
      featured: 'Featured',
      lowToHigh: 'Price: Low to High',
      highToLow: 'Price: High to Low',
    },
    card: {
      day: '/day',
      seats: 'Seats',
      book: 'Book via WhatsApp',
      bookNow: 'BOOK NOW',
      from: 'from',
      withDriver: 'With Driver',
      rentalPeriod: 'Rental Period',
      driverLabel: 'Driver option, price per day',
      withoutDriver: 'Without driver',
      reserve: 'RESERVE',
      tiers: {
        day1: '1 day',
        day2: '2 days',
        day3_4: '3–4 days',
        day5_7: '5–7 days',
        day8plus: '8+ days',
      },
      whatsappMsg: (year, brand, model) =>
        `Hello! I'm interested in renting the ${year ? year + ' ' : ''}${brand} ${model}. Please send me availability and pricing details.`,
      reserveMsg: (brand, model, year, period, driverOption, price, driverPrice) => {
        const driverLine = driverPrice ? `\n- Driver: ${driverOption} (+$${driverPrice}/day)` : `\n- Driver: ${driverOption}`;
        return `Hello! I'd like to reserve the ${year ? year + ' ' : ''}${brand} ${model}.\n- Rental Period: ${period}${driverLine}\n- Estimated Price: $${price}/day\n\nPlease confirm availability!`;
      },
    },
    states: {
      loading: 'Loading fleet...',
      noResults: 'No cars found',
      noResultsHint: 'Try adjusting your search or filters.',
    },
    whyChoose: {
      sectionTitle: 'Why Choose AlfaDrive',
      sectionSubtitle: 'More than just a rental — a complete driving experience in Georgia.',
      manager: {
        title: '24/7 Personal Manager',
        desc: 'Your dedicated manager is reachable around the clock via WhatsApp — before, during, and after your rental.',
      },
      assistance: {
        title: 'Free Road Assistance',
        desc: 'Nationwide towing, flat tyre service, jump-starts, and fuel delivery — all included at no extra cost.',
      },
      winterTires: {
        title: 'Winter Tyres Included',
        desc: 'Seasonal winter tyres fitted free of charge on every car during the cold months. Drive the mountains with confidence.',
      },
      extras: {
        title: 'Extra Options Available',
        desc: 'Child seat, GPS navigator, portable Wi-Fi hotspot — available on request at affordable daily rates.',
      },
    },
    faq: {
      sectionTitle: 'Rental Information',
      sectionSubtitle: 'Everything you need to know before renting with AlfaDrive in Georgia.',
      items: [
        {
          question: 'Driver Requirements',
          answer: `**Minimum age:** 21 years old (ВОЗРАСТ ОТ 21 ГОДА).\n**Driving experience:** At least 2 years (2+ years licence held).\n**Documents required:** Valid national driving licence + passport/ID.\n**International drivers:** An International Driving Permit (IDP) is recommended alongside your national licence.\n**Additional drivers:** Can be added free of charge. Must meet the same age and experience requirements and be present at pickup.`,
        },
        {
          question: 'Terms & Extras',
          answer: `**Mileage:** Unlimited mileage included on every rental.\n**Contract:** Bilingual rental agreement provided in Georgian + the client's language (Russian / English).\n**Car wash:** Complimentary car wash included on vehicle return.\n**Minimum rental period:** 1 day.\n**Late returns:** Cars returned more than 1 hour late may incur an additional day charge.\n**Cancellation:** Free cancellation up to 24 hours before pickup.`,
        },
        {
          question: 'Pickup & Delivery',
          answer: `**Fuel policy:** All cars are issued with a FULL TANK — return the vehicle with the same fuel level.\n\n**Pickup locations:**\n- Tbilisi — city centre + Tbilisi International Airport (TBS)\n- Batumi — city centre + Batumi International Airport\n- Kutaisi — Kutaisi International Airport\n\n**One-way intercity drop-off:** Available on request. Drop the car in a different city for a small transfer fee.\n\n**Hotel / address delivery:** We deliver the car directly to your hotel or any address. Contact us on WhatsApp to arrange.`,
        },
        {
          question: 'Insurance & Coverage',
          answer: `**TPL — Third Party Liability (included):** Covers damage or injury to third parties in any at-fault accident.\n\n**TP — Theft Protection (optional):** Covers the vehicle in the event of theft or attempted theft.\n\n**CDW — Collision Damage Waiver (optional):** Reduces your excess to $200 franchise in case of an accident. Recommended for mountain and off-road routes.\n\n**Coverage comparison:**\n\n| Coverage | CDW (Каско) | Full Coverage | Full Coverage Plus |\n|---|---|---|---|\n| Third-party liability | ✓ | ✓ | ✓ |\n| Collision damage | $200 franchise | Covered | Covered |\n| Theft protection | — | ✓ | ✓ |\n| Windshield / Tyres | — | — | ✓ |\n| Roadside assistance | ✓ | ✓ | ✓ |`,
        },
        {
          question: 'Payment Methods',
          answer: `We accept **Visa**, **Mastercard**, and **cash** (GEL / USD / EUR).\n\nPayment can be made at pickup or in advance via bank transfer. Contact our manager on WhatsApp for details.`,
        },
      ],
    },
    findUs: {
      sectionTitle: 'Where to Find Us',
      sectionSubtitle: 'Base in Tbilisi, with car delivery available anywhere across Georgia upon request.',
      tbilisi: 'Main Office · City Centre & Airport (TBS)',
      batumi: 'Delivery to Airport (BUS) & City Centre',
      kutaisi: 'Delivery to Airport (KUT) & City Centre',
      whatsapp: 'Need delivery to a different city or your hotel? Contact us on WhatsApp to arrange custom delivery anywhere in Georgia.',
    },
    reviews: {
      sectionTitle: 'What Our Clients Say',
      sectionSubtitle: 'Real experiences from real travellers across Georgia.',
    },
    featureBar: {
      insurance: 'Full Insurance',
      noFees: 'No Hidden Fees',
      support: '24/7 Support',
      delivery: 'Delivery Across Georgia',
    },
    social: {
      heading: 'Follow Us',
    },
    admin: {
      login: {
        title: 'Admin Login',
        subtitle: 'Fleet Management Dashboard',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        signingIn: 'Signing in…',
        footer: 'AlfaDrive Fleet Management · Restricted Access',
      },
      dashboard: {
        title: 'Fleet Management',
        subtitle: 'Manage vehicles, pricing, and availability',
        addVehicle: 'Add Vehicle',
        publicSite: '← Public Site',
        signOut: 'Sign out',
        totalFleet: 'Total Fleet',
        available: 'Available',
        rented: 'Rented',
        maintenance: 'Maintenance',
        inactive: 'Inactive',
        search: 'Search by brand or model…',
        vehicles: 'Vehicles',
        colPhoto: 'Photo',
        colVehicle: 'Vehicle',
        colSpecs: 'Specs',
        colPrice: 'Price / Day',
        colStatus: 'Status',
        colActions: 'Actions',
        specTrans: 'Trans:',
        specEngine: 'Engine:',
        specSeats: 'Seats:',
        perDay: '/day',
        withDriver: '+driver',
        loadingFleet: 'Loading fleet data…',
        noMatch: 'No vehicles match your search.',
        noVehicles: 'No vehicles yet. Add your first car to get started.',
        deleteConfirm: 'Remove this vehicle from the fleet?',
        auto: 'Auto',
        manual: 'Manual',
      },
      form: {
        editTitle: 'Edit Vehicle',
        addTitle: 'Add New Vehicle',
        photo: 'Vehicle Photo',
        uploadPhoto: 'Click to upload photo',
        orPasteUrl: 'or paste URL',
        urlPlaceholder: 'https://example.com/car.jpg',
        brand: 'Brand',
        model: 'Model',
        year: 'Year',
        seats: 'Seats',
        transmission: 'Transmission',
        fuelType: 'Fuel Type',
        engine: 'Engine',
        mileage: 'Mileage',
        pricingHeader: 'Pricing (USD) — leave blank to hide tier',
        day1: '1 Day *',
        day2: '2 Days',
        day3_4: '3–4 Days',
        day5_7: '5–7 Days',
        day8plus: '8+ Days',
        withDriver: 'With Driver',
        originalPrice: 'Original Price ($)',
        features: 'Features',
        featuresHint: '(comma-separated)',
        featuresPlaceholder: 'Bluetooth, Leather Seats, 360° Camera, Sunroof',
        status: 'Status',
        statusHint: 'Only "Available" vehicles appear in the public catalog.',
        cancel: 'Cancel',
        save: 'Save Changes',
        add: 'Add Vehicle',
        automatic: 'Automatic',
        manual: 'Manual',
        fuelPlaceholder: 'Petrol / Diesel / EV',
        enginePlaceholder: '2.0L Turbo',
        mileagePlaceholder: '15,000 km',
        statusAvailable: '✅ Available',
        statusRented: '🔵 Rented',
        statusMaintenance: '🔧 Maintenance',
        statusInactive: '⚫ Inactive',
        uploadErrorBucket: 'Storage bucket "car-images" not found. Create it in Supabase → Storage.',
        uploadErrorGeneric: 'Upload failed',
      },
      toasts: {
        carCreated: 'Car added',
        carCreatedDesc: 'The car has been successfully added to the fleet.',
        carUpdated: 'Car updated',
        carUpdatedDesc: 'The car details have been updated.',
        carDeleted: 'Car deleted',
        carDeletedDesc: 'The car has been removed from the fleet.',
        errorCreate: 'Error adding car',
        errorUpdate: 'Error updating car',
        errorDelete: 'Error deleting car',
      },
    },
  },

  ru: {
    nav: {
      fleet: 'Автопарк',
      admin: 'Администратор',
      findUs: 'Где нас найти',
      reviews: 'Отзывы',
      faq: 'Частые вопросы',
    },
    hero: {
      title: 'Езди с',
      titleItalic: 'Уверенностью',
      subtitle: 'Премиальная аренда автомобилей в Грузии. Современный парк, безлимитный пробег — и личный менеджер доступен 24/7.',
    },
    categories: {
      sectionTitle: 'Выберите направление',
      selectCar: 'Выбрать автомобиль',
      city: { label: 'Город', sublabel: 'Городской комфорт' },
      mountains: { label: 'Горы', sublabel: 'Покоряй каждую вершину' },
      sea: { label: 'Море', sublabel: 'Поездки вдоль побережья' },
      winter: { label: 'Зима', sublabel: 'Уверенность в любой сезон' },
    },
    filters: {
      searchPlaceholder: 'Поиск по марке или модели...',
      allTypes: 'Все типы',
      automatic: 'Автомат',
      manual: 'Механика',
      anyPrice: 'Любая цена',
      under50: 'До $50',
      range50100: '$50 – $100',
      over100: 'Более $100',
      featured: 'Рекомендуемые',
      lowToHigh: 'Цена: по возрастанию',
      highToLow: 'Цена: по убыванию',
    },
    card: {
      day: '/день',
      seats: 'мест',
      book: 'Забронировать в WhatsApp',
      bookNow: 'ЗАБРОНИРОВАТЬ',
      from: 'от',
      withDriver: 'С водителем',
      rentalPeriod: 'Период аренды',
      driverLabel: 'Опция водителя, цена за день',
      withoutDriver: 'Без водителя',
      reserve: 'ЗАБРОНИРОВАТЬ',
      tiers: {
        day1: '1 день',
        day2: '2 дня',
        day3_4: '3–4 дня',
        day5_7: '5–7 дней',
        day8plus: '8+ дней',
      },
      whatsappMsg: (year, brand, model) =>
        `Здравствуйте! Меня интересует аренда ${brand} ${model}${year ? ' ' + year + ' года' : ''}. Пришлите, пожалуйста, информацию о наличии и ценах.`,
      reserveMsg: (brand, model, year, period, driverOption, price, driverPrice) => {
        const driverLine = driverPrice ? `\n- Водитель: ${driverOption} (+$${driverPrice}/день)` : `\n- Водитель: ${driverOption}`;
        return `Здравствуйте! Хочу забронировать ${brand} ${model}${year ? ' ' + year + ' г.' : ''}.\n- Период аренды: ${period}${driverLine}\n- Ориентировочная цена: $${price}/день\n\nПодтвердите, пожалуйста, наличие!`;
      },
    },
    states: {
      loading: 'Загрузка автопарка...',
      noResults: 'Автомобили не найдены',
      noResultsHint: 'Попробуйте изменить параметры поиска или фильтры.',
    },
    whyChoose: {
      sectionTitle: 'Почему AlfaDrive',
      sectionSubtitle: 'Это больше, чем прокат — это полноценный опыт вождения в Грузии.',
      manager: {
        title: 'Личный менеджер 24/7',
        desc: 'Ваш персональный менеджер всегда на связи через WhatsApp — до, во время и после аренды.',
      },
      assistance: {
        title: 'Бесплатная дорожная помощь',
        desc: 'Буксировка, шиномонтаж, прикурка и доставка топлива по всей Грузии — включено в стоимость.',
      },
      winterTires: {
        title: 'Зимняя резина в подарок',
        desc: 'Сезонные зимние шины устанавливаются бесплатно в холодный период. Горы — не проблема.',
      },
      extras: {
        title: 'Дополнительные опции',
        desc: 'Детское кресло, GPS-навигатор, портативный Wi-Fi роутер — доступны по запросу.',
      },
    },
    faq: {
      sectionTitle: 'Информация об аренде',
      sectionSubtitle: 'Всё, что нужно знать перед арендой автомобиля в AlfaDrive в Грузии.',
      items: [
        {
          question: 'Требования к водителю',
          answer: `**Минимальный возраст:** 21 год (ВОЗРАСТ ОТ 21 ГОДА).\n**Стаж вождения:** Не менее 2 лет (ОПЫТ ВОЖДЕНИЯ: Более 2 лет).\n**Необходимые документы:** Действующее водительское удостоверение + паспорт/удостоверение личности.\n**Иностранные водители:** Рекомендуется международное водительское удостоверение (МВУ) вместе с национальным.\n**Дополнительные водители:** Добавляются бесплатно. Должны соответствовать тем же требованиям и присутствовать при получении.`,
        },
        {
          question: 'Условия и дополнительно',
          answer: `**Пробег:** Неограниченный пробег включён во все аренды.\n**Договор:** Двуязычный договор аренды на грузинском + языке клиента (русский / английский).\n**Мойка автомобиля:** Бесплатная мойка при возврате автомобиля.\n**Минимальный срок:** 1 день.\n**Опоздание с возвратом:** Возврат более чем на 1 час позже может повлечь доп. оплату дня.\n**Отмена:** Бесплатная отмена за 24 часа до получения.`,
        },
        {
          question: 'Выдача и доставка',
          answer: `**Политика топлива:** Все автомобили выдаются с ПОЛНЫМ БАКОМ — верните с таким же уровнем топлива.\n\n**Места получения:**\n- Тбилиси — центр города + аэропорт Тбилиси (TBS)\n- Батуми — центр города + международный аэропорт Батуми\n- Кутаиси — международный аэропорт Кутаиси\n\n**Межгородская сдача:** Возможна сдача автомобиля в другом городе за небольшую плату.\n\n**Доставка в отель / по адресу:** Привезём автомобиль прямо к вашему отелю или на любой адрес. Свяжитесь через WhatsApp.`,
        },
        {
          question: 'Страхование и покрытие',
          answer: `**TPL — Ответственность перед третьими лицами (включено):** Покрывает ущерб третьим лицам при ДТП по вашей вине.\n\n**TP — Защита от угона (опционально):** Покрывает автомобиль в случае кражи или попытки угона.\n\n**CDW — Отказ от возмещения ущерба (опционально):** Снижает вашу франшизу до $200 при ДТП. Рекомендуется для горных маршрутов.\n\n**Сравнение покрытий:**\n\n| Покрытие | CDW (Каско) | Полное | Полное Плюс |\n|---|---|---|---|\n| Ответственность перед 3-ми лицами | ✓ | ✓ | ✓ |\n| Ущерб при ДТП | Франшиза $200 | Покрыто | Покрыто |\n| Защита от угона | — | ✓ | ✓ |\n| Стёкла / Шины | — | — | ✓ |\n| Помощь на дороге | ✓ | ✓ | ✓ |`,
        },
        {
          question: 'Способы оплаты',
          answer: `Принимаем **Visa**, **Mastercard** и **наличные** (GEL / USD / EUR).\n\nОплата при получении или авансовым переводом. Свяжитесь с менеджером в WhatsApp для уточнения деталей.`,
        },
      ],
    },
    findUs: {
      sectionTitle: 'Где нас найти',
      sectionSubtitle: 'Офис в Тбилиси, доставка автомобилей по всей Грузии по запросу.',
      tbilisi: 'Главный офис · Центр города и аэропорт (TBS)',
      batumi: 'Доставка в аэропорт (BUS) и центр города',
      kutaisi: 'Доставка в аэропорт (KUT) и центр города',
      whatsapp: 'Нужна доставка в другой город или к вашему отелю? Напишите нам в WhatsApp — организуем доставку в любую точку Грузии.',
    },
    reviews: {
      sectionTitle: 'Отзывы наших клиентов',
      sectionSubtitle: 'Реальные отзывы от настоящих путешественников по Грузии.',
    },
    featureBar: {
      insurance: 'Полная страховка',
      noFees: 'Без скрытых платежей',
      support: 'Поддержка 24/7',
      delivery: 'Доставка по Грузии',
    },
    social: {
      heading: 'Мы в социальных сетях',
    },
    admin: {
      login: {
        title: 'Вход в панель',
        subtitle: 'Управление автопарком',
        email: 'Email',
        password: 'Пароль',
        signIn: 'Войти',
        signingIn: 'Входим…',
        footer: 'AlfaDrive · Только для администраторов',
      },
      dashboard: {
        title: 'Управление автопарком',
        subtitle: 'Управляйте автомобилями, ценами и доступностью',
        addVehicle: 'Добавить авто',
        publicSite: '← Сайт',
        signOut: 'Выйти',
        totalFleet: 'Всего авто',
        available: 'Доступно',
        rented: 'В аренде',
        maintenance: 'Обслуживание',
        inactive: 'Неактивно',
        search: 'Поиск по марке или модели…',
        vehicles: 'Автомобили',
        colPhoto: 'Фото',
        colVehicle: 'Автомобиль',
        colSpecs: 'Характеристики',
        colPrice: 'Цена / День',
        colStatus: 'Статус',
        colActions: 'Действия',
        specTrans: 'КПП:',
        specEngine: 'Двигатель:',
        specSeats: 'Мест:',
        perDay: '/день',
        withDriver: '+водитель',
        loadingFleet: 'Загрузка автопарка…',
        noMatch: 'Авто не найдены.',
        noVehicles: 'Автомобилей нет. Добавьте первый.',
        deleteConfirm: 'Удалить автомобиль из парка?',
        auto: 'Автомат',
        manual: 'Механика',
      },
      form: {
        editTitle: 'Редактировать авто',
        addTitle: 'Добавить авто',
        photo: 'Фото автомобиля',
        uploadPhoto: 'Нажмите для загрузки фото',
        orPasteUrl: 'или вставьте ссылку',
        urlPlaceholder: 'https://example.com/car.jpg',
        brand: 'Марка',
        model: 'Модель',
        year: 'Год',
        seats: 'Мест',
        transmission: 'КПП',
        fuelType: 'Тип топлива',
        engine: 'Двигатель',
        mileage: 'Пробег',
        pricingHeader: 'Цены (USD) — оставьте пустым, чтобы скрыть тариф',
        day1: '1 день *',
        day2: '2 дня',
        day3_4: '3–4 дня',
        day5_7: '5–7 дней',
        day8plus: '8+ дней',
        withDriver: 'С водителем',
        originalPrice: 'Старая цена ($)',
        features: 'Особенности',
        featuresHint: '(через запятую)',
        featuresPlaceholder: 'Bluetooth, Кожаный салон, Камера 360°',
        status: 'Статус',
        statusHint: 'Только «Доступно» отображается в публичном каталоге.',
        cancel: 'Отмена',
        save: 'Сохранить',
        add: 'Добавить',
        automatic: 'Автомат',
        manual: 'Механика',
        fuelPlaceholder: 'Бензин / Дизель / Электро',
        enginePlaceholder: '2.0L',
        mileagePlaceholder: '15 000 км',
        statusAvailable: '✅ Доступно',
        statusRented: '🔵 В аренде',
        statusMaintenance: '🔧 Обслуживание',
        statusInactive: '⚫ Неактивно',
        uploadErrorBucket: 'Бакет "car-images" не найден. Создайте в Supabase → Storage.',
        uploadErrorGeneric: 'Ошибка загрузки',
      },
      toasts: {
        carCreated: 'Авто добавлен',
        carCreatedDesc: 'Автомобиль успешно добавлен в парк.',
        carUpdated: 'Авто обновлён',
        carUpdatedDesc: 'Данные автомобиля обновлены.',
        carDeleted: 'Авто удалён',
        carDeletedDesc: 'Автомобиль удалён из парка.',
        errorCreate: 'Ошибка добавления',
        errorUpdate: 'Ошибка обновления',
        errorDelete: 'Ошибка удаления',
      },
    },
  },

  ka: {
    nav: {
      fleet: 'ავტოპარკი',
      admin: 'ადმინი',
      findUs: 'სად გვიპოვოთ',
      reviews: 'შეფასებები',
      faq: 'კითხვები',
    },
    hero: {
      title: 'იმგზავრე',
      titleItalic: 'თავდაჯერებულად',
      subtitle: 'პრემიუმ ავტომობილების გაქირავება საქართველოში. თანამედროვე ავტოპარკი, შეუზღუდავი გარბენი — და პირადი მენეჯერი 24/7.',
    },
    categories: {
      sectionTitle: 'აირჩიე მიმართულება',
      selectCar: 'ავტომობილის არჩევა',
      city: { label: 'ქალაქი', sublabel: 'ქალაქური კომფორტი' },
      mountains: { label: 'მთები', sublabel: 'დაიპყრე ყველა მწვერვალი' },
      sea: { label: 'ზღვა', sublabel: 'სანაპიროს მოგზაურობა' },
      winter: { label: 'ზამთარი', sublabel: 'ნდობა ნებისმიერ სეზონში' },
    },
    filters: {
      searchPlaceholder: 'მოძებნე მარკა ან მოდელი...',
      allTypes: 'ყველა ტიპი',
      automatic: 'ავტომატური',
      manual: 'მექანიკური',
      anyPrice: 'ნებისმიერი ფასი',
      under50: '$50-მდე',
      range50100: '$50 – $100',
      over100: '$100-ზე მეტი',
      featured: 'რჩეული',
      lowToHigh: 'ფასი: ზრდადობით',
      highToLow: 'ფასი: კლებადობით',
    },
    card: {
      day: '/დღე',
      seats: 'ადგილი',
      book: 'WhatsApp-ით დაჯავშნა',
      bookNow: 'დაჯავშნა',
      from: 'საწყისი',
      withDriver: 'მძღოლით',
      rentalPeriod: 'გაქირავების ვადა',
      driverLabel: 'მძღოლის ვარიანტი, ფასი დღეში',
      withoutDriver: 'მძღოლის გარეშე',
      reserve: 'დაჯავშნა',
      tiers: {
        day1: '1 დღე',
        day2: '2 დღე',
        day3_4: '3–4 დღე',
        day5_7: '5–7 დღე',
        day8plus: '8+ დღე',
      },
      whatsappMsg: (year, brand, model) =>
        `გამარჯობა! მაინტერესებს ${year ? year + ' წლის ' : ''}${brand} ${model}-ის გაქირავება. გთხოვთ გამომიგზავნოთ ინფო ხელმისაწვდომობასა და ფასებზე.`,
      reserveMsg: (brand, model, year, period, driverOption, price, driverPrice) => {
        const driverLine = driverPrice ? `\n- მძღოლი: ${driverOption} (+$${driverPrice}/დღეში)` : `\n- მძღოლი: ${driverOption}`;
        return `გამარჯობა! მინდა დავჯავშნო ${year ? year + ' წლის ' : ''}${brand} ${model}.\n- გაქირავების ვადა: ${period}${driverLine}\n- სავარაუდო ფასი: $${price}/დღეში\n\nდაადასტურეთ ხელმისაწვდომობა!`;
      },
    },
    states: {
      loading: 'ავტოპარკი იტვირთება...',
      noResults: 'ავტომობილი ვერ მოიძებნა',
      noResultsHint: 'სცადე ძიების ან ფილტრის შეცვლა.',
    },
    whyChoose: {
      sectionTitle: 'რატომ AlfaDrive',
      sectionSubtitle: 'ეს მხოლოდ გაქირავება არ არის — ეს სრული სამგზავრო გამოცდილებაა.',
      manager: {
        title: 'პირადი მენეჯერი 24/7',
        desc: 'თქვენი მენეჯერი ყოველთვის ხელმისაწვდომია WhatsApp-ზე — გაქირავებამდე, განმავლობაში და შემდეგ.',
      },
      assistance: {
        title: 'უფასო დახმარება გზაზე',
        desc: 'ბუქსირი, საბურავის შეკეთება, დამუხტვა და საწვავის მიტანა მთელი საქართველოს მასშტაბით.',
      },
      winterTires: {
        title: 'ზამთრის საბურავები ჩართულია',
        desc: 'ცივ სეზონში ყველა ავტომობილზე ზამთრის საბურავები უფასოდ მონტაჟდება. მთები პრობლემა არ არის.',
      },
      extras: {
        title: 'დამატებითი ოფციები',
        desc: 'საბავშვო სავარძელი, GPS-ნავიგატორი, Wi-Fi — ხელმისაწვდომია მოთხოვნით.',
      },
    },
    faq: {
      sectionTitle: 'გაქირავების ინფორმაცია',
      sectionSubtitle: 'ყველაფერი, რაც უნდა იცოდე AlfaDrive-ით გაქირავებამდე.',
      items: [
        {
          question: 'მძღოლის მოთხოვნები',
          answer: `**მინიმალური ასაკი:** 21 წელი.\n**სამართვო გამოცდილება:** მინიმუმ 2 წელი.\n**საჭირო დოკუმენტები:** მოქმედი მართვის მოწმობა + პასპორტი/პირადობა.\n**უცხოელი მძღოლები:** რეკომენდებულია საერთაშორისო მართვის მოწმობა (IDP).\n**დამატებითი მძღოლები:** დამატება შეიძლება უფასოდ. იგივე მოთხოვნების დაკმაყოფილება სავალდებულოა.`,
        },
        {
          question: 'პირობები და დამატებები',
          answer: `**გარბენი:** შეუზღუდავი გარბენი ყველა გაქირავებაში.\n**კონტრაქტი:** ორენოვანი საიჯარო ხელშეკრულება ქართულ + კლიენტის ენაზე.\n**მობანება:** უფასო მობანება ავტომობილის დაბრუნებისას.\n**მინიმალური ვადა:** 1 დღე.\n**გაუქმება:** უფასო გაუქმება ჩაბარებამდე 24 საათით ადრე.`,
        },
        {
          question: 'ჩაბარება და მიწოდება',
          answer: `**საწვავის პოლიტიკა:** ყველა ავტომობილი გაიცემა ᲡᲐᲕᲡᲔ ᲑᲐᲙᲘᲗ — დააბრუნე იმავე დონით.\n\n**ჩაბარების ადგილები:**\n- თბილისი — ქალაქის ცენტრი + TBS აეროპორტი\n- ბათუმი — ქალაქის ცენტრი + ბათუმის საერთაშორისო აეროპორტი\n- ქუთაისი — ქუთაისის საერთაშორისო აეროპორტი\n\n**ქალაქთაშორისი ჩაბარება:** შეიძლება სხვა ქალაქში დაბრუნება მცირე საფასურით.\n\n**სასტუმრო / მისამართზე მიწოდება:** ავტომობილს მოვიყვანთ პირდაპირ თქვენს სასტუმრომდე. WhatsApp-ით დაგვიკავშირდით.`,
        },
        {
          question: 'დაზღვევა და დაფარვა',
          answer: `**TPL — მესამე პირის პასუხისმგებლობა (შედის):** ფარავს ზიანს მესამე პირებისთვის ავარიის დროს.\n\n**TP — ქურდობის დაცვა (სურვილისამებრ):** ფარავს ავტომობილს ქურდობის შემთხვევაში.\n\n**CDW — ზიანის ანაზღაურებაზე უარი (სურვილისამებრ):** ავარიისას შენი ფრანშიზა $200-მდე მცირდება.\n\n**დაფარვის შედარება:**\n\n| დაფარვა | CDW (კასკო) | სრული | სრული პლუს |\n|---|---|---|---|\n| მე-3 პირის პასუხ. | ✓ | ✓ | ✓ |\n| ავარიული ზიანი | $200 ფრანშ. | დაფარულია | დაფარულია |\n| ქურდობა | — | ✓ | ✓ |\n| მინა / საბურავი | — | — | ✓ |\n| გზის დახმარება | ✓ | ✓ | ✓ |`,
        },
        {
          question: 'გადახდის მეთოდები',
          answer: `ვიღებთ **Visa**, **Mastercard** და **ნაღდ ფულს** (GEL / USD / EUR).\n\nგადახდა შეიძლება ჩაბარებისას ან წინასწარ გადარიცხვით. WhatsApp-ით დაგვიკავშირდი დეტალებისთვის.`,
        },
      ],
    },
    findUs: {
      sectionTitle: 'სად გვიპოვოთ',
      sectionSubtitle: 'ოფისი თბილისში, ავტომობილის მიწოდება საქართველოს ნებისმიერ კუთხეში მოთხოვნით.',
      tbilisi: 'მთავარი ოფისი · ქალაქის ცენტრი და TBS აეროპორტი',
      batumi: 'მიწოდება BUS აეროპორტსა და ქალაქის ცენტრში',
      kutaisi: 'მიწოდება KUT აეროპორტსა და ქალაქის ცენტრში',
      whatsapp: 'გჭირდებათ მიწოდება სხვა ქალაქში ან სასტუმრომდე? დაგვიკავშირდით WhatsApp-ზე — მოვაწყობთ მიწოდებას საქართველოს ნებისმიერ წერტილში.',
    },
    reviews: {
      sectionTitle: 'ჩვენი კლიენტების შეფასებები',
      sectionSubtitle: 'რეალური გამოცდილება საქართველოში მოგზაურობის მოყვარულებისგან.',
    },
    featureBar: {
      insurance: 'სრული დაზღვევა',
      noFees: 'ფარული საკომისიო არ გვაქვს',
      support: '24/7 მხარდაჭერა',
      delivery: 'მიწოდება საქართველოში',
    },
    social: {
      heading: 'გამოგვყევით',
    },
    admin: {
      login: {
        title: 'ადმინ პანელი',
        subtitle: 'ავტოპარკის მართვა',
        email: 'ელ. ფოსტა',
        password: 'პაროლი',
        signIn: 'შესვლა',
        signingIn: 'შესვლა…',
        footer: 'AlfaDrive · მხოლოდ ადმინისტრატორებისთვის',
      },
      dashboard: {
        title: 'ავტოპარკის მართვა',
        subtitle: 'მართეთ ავტომობილები, ფასები და ხელმისაწვდომობა',
        addVehicle: 'ავტომობილის დამატება',
        publicSite: '← საიტი',
        signOut: 'გასვლა',
        totalFleet: 'სულ ავტომობილი',
        available: 'ხელმისაწვდომი',
        rented: 'გაქირავებული',
        maintenance: 'მომსახურება',
        inactive: 'არააქტიური',
        search: 'ძიება მარკის ან მოდელის მიხედვით…',
        vehicles: 'ავტომობილები',
        colPhoto: 'ფოტო',
        colVehicle: 'ავტომობილი',
        colSpecs: 'მახასიათებლები',
        colPrice: 'ფასი / დღე',
        colStatus: 'სტატუსი',
        colActions: 'მოქმედება',
        specTrans: 'გადაც.:',
        specEngine: 'ძრავა:',
        specSeats: 'ადგილი:',
        perDay: '/დღე',
        withDriver: '+მძღოლი',
        loadingFleet: 'ავტოპარკი იტვირთება…',
        noMatch: 'ავტომობილი ვერ მოიძებნა.',
        noVehicles: 'ავტომობილი არ არის. დაამატე პირველი.',
        deleteConfirm: 'ამოღება ავტოპარკიდან?',
        auto: 'ავტომატი',
        manual: 'მექანიკა',
      },
      form: {
        editTitle: 'ავტომობილის რედაქტირება',
        addTitle: 'ავტომობილის დამატება',
        photo: 'ავტომობილის ფოტო',
        uploadPhoto: 'ფოტოს ასასვლელად დააჭირე',
        orPasteUrl: 'ან ჩასვი ბმული',
        urlPlaceholder: 'https://example.com/car.jpg',
        brand: 'მარკა',
        model: 'მოდელი',
        year: 'წელი',
        seats: 'ადგილი',
        transmission: 'გადაცემათა კოლოფი',
        fuelType: 'საწვავის ტიპი',
        engine: 'ძრავა',
        mileage: 'გარბენი',
        pricingHeader: 'ფასები (USD) — ტარიფის დასამალად გამოტოვე',
        day1: '1 დღე *',
        day2: '2 დღე',
        day3_4: '3–4 დღე',
        day5_7: '5–7 დღე',
        day8plus: '8+ დღე',
        withDriver: 'მძღოლით',
        originalPrice: 'ძველი ფასი ($)',
        features: 'მახასიათებლები',
        featuresHint: '(მძიმით გამოყოფილი)',
        featuresPlaceholder: 'Bluetooth, ტყავის სალონი, 360° კამერა',
        status: 'სტატუსი',
        statusHint: '"ხელმისაწვდომი" ავტომობილები ჩანს საჯარო კატალოგში.',
        cancel: 'გაუქმება',
        save: 'შენახვა',
        add: 'დამატება',
        automatic: 'ავტომატი',
        manual: 'მექანიკა',
        fuelPlaceholder: 'ბენზინი / დიზელი / ელექტრო',
        enginePlaceholder: '2.0L',
        mileagePlaceholder: '15,000 კმ',
        statusAvailable: '✅ ხელმისაწვდომი',
        statusRented: '🔵 გაქირავებული',
        statusMaintenance: '🔧 მომსახურება',
        statusInactive: '⚫ არააქტიური',
        uploadErrorBucket: 'bucket "car-images" ვერ მოიძებნა. შექმენი Supabase → Storage-ში.',
        uploadErrorGeneric: 'ატვირთვის შეცდომა',
      },
      toasts: {
        carCreated: 'ავტომობილი დამატებულია',
        carCreatedDesc: 'ავტომობილი წარმატებით დაემატა ავტოპარკს.',
        carUpdated: 'ავტომობილი განახლებულია',
        carUpdatedDesc: 'ავტომობილის მონაცემები განახლდა.',
        carDeleted: 'ავტომობილი წაშლილია',
        carDeletedDesc: 'ავტომობილი ამოღებულია ავტოპარკიდან.',
        errorCreate: 'დამატების შეცდომა',
        errorUpdate: 'განახლების შეცდომა',
        errorDelete: 'წაშლის შეცდომა',
      },
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
