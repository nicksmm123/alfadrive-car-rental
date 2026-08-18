import { useState, useMemo, useRef } from 'react';
import type { Car as CarType } from '@/lib/supabase';
import { CarDetailModal } from '@/components/CarDetailModal';
import cityTbilisi  from '../assets/city-tbilisi.jpg';
import cityBatumi   from '../assets/city-batumi.jpg';
import cityKutaisi  from '../assets/city-kutaisi.jpg';
import defenderWinterImg from '../assets/defender-winter.jpg';
import cityCamryImg from '../assets/city-car-camry.jpg';
import seaMustangImg from '../assets/sea-car-mustang-convertible.jpg';
import { useAvailableCars } from '@/hooks/use-cars';
import { CarCard } from '@/components/CarCard';
import {
  Search, Loader2, Car, Building2, MountainSnow, Waves, Snowflake,
  ChevronDown, Clock, Truck, Thermometer, Package, MapPin, Star,
  MessageCircle, ShieldCheck, DollarSign, Phone,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

const WHATSAPP_NUMBER   = '+995596078800'; // ← update phone number here
const TELEGRAM_USERNAME = 'alfadrive_ge';  // ← update Telegram username here
const FACEBOOK_URL  = 'https://www.facebook.com/share/1FzQaoxpwm/?mibextid=wwXIfr';
const INSTAGRAM_URL = 'https://www.instagram.com/alfadrive_rental';
const TIKTOK_URL    = 'https://www.tiktok.com/@alfadrive_rental';

// ─── Destination Categories Data ────────────────────────────────────────────

type CategoryKey = 'city' | 'mountains' | 'sea' | 'winter';

interface Category {
  key: CategoryKey;
  Icon: React.ElementType;
  accent: string;
  bgImage: string;
  carImage: string;
}

const CATEGORIES: Category[] = [
  {
    key: 'city',
    Icon: Building2,
    accent: 'text-amber-400',
    // Old Tbilisi colourful streets at night
    bgImage: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80',
    carImage: cityCamryImg,
  },
  {
    key: 'mountains',
    Icon: MountainSnow,
    accent: 'text-emerald-400',
    // Dramatic Caucasus mountain road / peaks
    bgImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    // Grey SUV on terrain
    carImage: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80',
  },
  {
    key: 'sea',
    Icon: Waves,
    accent: 'text-cyan-400',
    // Clear Black Sea / beach coast
    bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    carImage: seaMustangImg,
  },
  {
    key: 'winter',
    Icon: Snowflake,
    accent: 'text-sky-300',
    // Dramatic snow-covered Himalayan/Caucasus mountain peaks, overcast sky
    bgImage: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80',
    carImage: defenderWinterImg,
  },
];

// ─── Feature Bar ──────────────────────────────────────────────────────────────

function FeatureBar() {
  const { t } = useLanguage();
  const items = [
    { Icon: ShieldCheck, label: t.featureBar.insurance },
    { Icon: DollarSign,  label: t.featureBar.noFees },
    { Icon: Phone,       label: t.featureBar.support },
    { Icon: MapPin,      label: t.featureBar.delivery },
  ];
  return (
    <div className="bg-[#121212] border-t border-white/10">
      <div className="grid grid-cols-4 divide-x divide-white/10">
        {items.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5 px-2 py-3 lg:flex-row lg:text-left lg:gap-2.5 lg:px-5 lg:py-3.5">
            <Icon size={15} className="text-white flex-shrink-0" />
            <span className="text-[10px] lg:text-xs font-semibold text-white leading-snug">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Destination Column Card ──────────────────────────────────────────────────

function DestinationCard({
  categoryKey,
  onSelectCar,
  delay,
}: {
  categoryKey: CategoryKey;
  onSelectCar: () => void;
  delay: number;
}) {
  const { t } = useLanguage();
  const cat = CATEGORIES.find(c => c.key === categoryKey)!;
  const label = t.categories[categoryKey];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay }}
      className="relative group overflow-hidden cursor-pointer min-h-[280px] lg:min-h-[580px]"
      onClick={onSelectCar}
    >
      {/* ── Background destination photo ── */}
      <img
        src={cat.bgImage}
        alt={label.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      {/* ── Gradient layers ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 transition-colors duration-500 pointer-events-none" />

      {/* ── Content (z-10 above gradients) ── */}
      <div className="relative z-10 flex flex-col h-full min-h-[280px] lg:min-h-[580px]">

        {/* Top text block */}
        <div className="flex-1 p-3 pt-4 lg:p-6 lg:pt-8 flex flex-col items-center text-center">
          <h3 className="text-xl lg:text-[2.4rem] font-extrabold font-sans text-white leading-tight mb-1 lg:mb-2 drop-shadow-lg tracking-tight">
            {label.label}
          </h3>
          <p className="text-[11px] lg:text-sm text-white/55 mb-3 lg:mb-6 leading-snug">{label.sublabel}</p>

          <button
            onClick={e => { e.stopPropagation(); onSelectCar(); }}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-[11px] lg:text-sm font-bold px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-full shadow-xl shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {t.categories.selectCar}
            <span className="opacity-70">→</span>
          </button>
        </div>

        {/* Car image — top-fade mask */}
        <div className="relative h-[120px] lg:h-[230px] overflow-hidden">
          <img
            src={cat.carImage}
            alt={`car — ${label.label}`}
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 42%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 42%)',
            }}
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Why Choose Section ───────────────────────────────────────────────────────

const WHY_CHOOSE_ICONS = [Clock, Truck, Thermometer, Package] as const;

function WhyChooseSection() {
  const { t } = useLanguage();
  const features = [
    { key: 'manager',     Icon: WHY_CHOOSE_ICONS[0] },
    { key: 'assistance',  Icon: WHY_CHOOSE_ICONS[1] },
    { key: 'winterTires', Icon: WHY_CHOOSE_ICONS[2] },
    { key: 'extras',      Icon: WHY_CHOOSE_ICONS[3] },
  ] as const;

  return (
    <section className="border-t border-border/40 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">{t.whyChoose.sectionTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.whyChoose.sectionSubtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ key, Icon }, i) => {
            const feature = t.whyChoose[key as keyof typeof t.whyChoose] as { title: string; desc: string };
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/25 transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Where to Find Us ─────────────────────────────────────────────────────────

function FindUsSection() {
  const { t, language } = useLanguage();

  const hubs = [
    { city: 'Tbilisi', detail: t.findUs.tbilisi, isMain: true,  bg: cityTbilisi  },
    { city: 'Batumi',  detail: t.findUs.batumi,  isMain: false, bg: cityBatumi   },
    { city: 'Kutaisi', detail: t.findUs.kutaisi, isMain: false, bg: cityKutaisi  },
  ];

  const waHref = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(CONTACT_GREETINGS[language] ?? CONTACT_GREETINGS.en)}`;

  return (
    <section id="find-us" className="border-t border-border/40 py-20 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">{t.findUs.sectionTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.findUs.sectionSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {hubs.map((hub, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-xl border border-white/10 hover:border-primary/50 transition-colors group"
              style={{ minHeight: '190px' }}
            >
              {/* Background photo — zooms on hover */}
              <img
                src={hub.bg}
                alt={hub.city}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.52) 55%, rgba(0,0,0,0.28) 100%)' }}
              />
              {/* Content — sits above the overlay */}
              <div className="relative z-10 flex flex-col justify-end gap-3 p-5 h-full" style={{ minHeight: '190px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/25 border border-primary/50 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight text-white drop-shadow">{hub.city}</p>
                    {hub.isMain && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Main Office</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/75 leading-snug drop-shadow">{hub.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto text-center bg-card border border-border rounded-xl p-5"
        >
          <p className="text-sm text-muted-foreground mb-3">{t.findUs.whatsapp}</p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2 rounded-full transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.968-1.405A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
            WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Floating Contact Widget ──────────────────────────────────────────────────

const CONTACT_GREETINGS: Record<string, string> = {
  en: "Hello! I'd like to arrange a custom car delivery with AlfaDrive.",
  ru: 'Здравствуйте! Я хочу заказать индивидуальную доставку автомобиля через AlfaDrive.',
  ka: 'გამარჯობა! მსურს ავტომობილის ინდივიდუალური მიწოდების შეკვეთა AlfaDrive-ისგან.',
};

function FloatingContactWidget() {
  const { language } = useLanguage();
  const greeting = CONTACT_GREETINGS[language] ?? CONTACT_GREETINGS.en;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(greeting)}`;
  const tgHref = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(greeting)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
      {/* WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
        style={{ backgroundColor: '#25D366', width: 52, height: 52 }}
      >
        {/* Official WhatsApp logo (Simple Icons) */}
        <svg viewBox="0 0 24 24" fill="white" width={27} height={27}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      {/* Telegram */}
      <a
        href={tgHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on Telegram"
        className="flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
        style={{ backgroundColor: '#0088cc', width: 52, height: 52 }}
      >
        <svg viewBox="0 0 24 24" fill="white" width={26} height={26}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </a>
    </div>
  );
}

// ─── Reviews Section ──────────────────────────────────────────────────────────

const REVIEWS = [
  { name: 'Александр М.', flag: '🇷🇺', rating: 5, text: 'Отличный сервис! Менеджер ответил мгновенно, автомобиль был идеален. Настоятельно рекомендую AlfaDrive для путешествий по Грузии.' },
  { name: 'Sarah L.',      flag: '🇬🇧', rating: 5, text: 'Seamless experience — the car was delivered to our hotel in perfect condition. Everything was exactly as promised. Will definitely book again!' },
  { name: 'Giorgi K.',     flag: '🇬🇪', rating: 5, text: 'სრულყოფილი სერვისი. ავტომობილი პირდაპირ სასტუმროსთან მომიყვანეს, ყველაფერი იდეალურად იყო. AlfaDrive — საუკეთესო არჩევანი!' },
  { name: 'Михаил Р.',     flag: '🇷🇺', rating: 5, text: 'Брал Camry на неделю в горы. Зимняя резина уже была установлена. Менеджер был на связи 24/7. Все прошло идеально.' },
];

function ReviewsSection() {
  const { t } = useLanguage();
  return (
    <section id="reviews" className="border-t border-border/40 py-20 scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">{t.reviews.sectionTitle}</h2>
          <p className="text-muted-foreground">{t.reviews.sectionSubtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-card border border-border flex flex-col gap-3"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-primary fill-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
              <p className="text-sm font-semibold">{review.flag} {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

function FaqAccordion() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function renderAnswer(text: string) {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(Boolean);
        const isHeader = lines[i + 1]?.startsWith('|---');
        const isSep = line.includes('---');
        if (isSep) return null;
        return (
          <tr key={i} className={isHeader ? 'bg-white/5' : 'border-t border-white/5'}>
            {cells.map((cell, j) => (
              <td key={j} className={`px-3 py-2 text-xs ${isHeader ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {cell.trim()}
              </td>
            ))}
          </tr>
        );
      }
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((p, j) =>
        j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{p}</strong> : p
      );
      return line ? <p key={i} className="mb-2 last:mb-0">{rendered}</p> : <div key={i} className="h-2" />;
    }).filter(Boolean);
  }

  function renderContent(answer: string) {
    const tableMatch = answer.match(/(\|.*\n?)+/);
    if (!tableMatch) return <div className="text-sm text-muted-foreground leading-relaxed space-y-1">{renderAnswer(answer)}</div>;
    const before = answer.slice(0, tableMatch.index);
    const after = answer.slice((tableMatch.index ?? 0) + tableMatch[0].length);
    return (
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        {before && <div>{renderAnswer(before)}</div>}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[300px]">
            <tbody>{renderAnswer(tableMatch[0])}</tbody>
          </table>
        </div>
        {after && <div>{renderAnswer(after)}</div>}
      </div>
    );
  }

  return (
    <section id="faq" className="container mx-auto px-4 pb-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-3">{t.faq.sectionTitle}</h2>
          <p className="text-muted-foreground">{t.faq.sectionSubtitle}</p>
        </motion.div>
        <div className="space-y-2">
          {t.faq.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="border border-border rounded-xl overflow-hidden bg-card"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium text-sm">{item.question}</span>
                <ChevronDown
                  size={16}
                  className={`text-primary flex-shrink-0 ml-4 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-border/50">
                      {renderContent(item.answer)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  const { t, language } = useLanguage();
  return (
    <section className="border-t border-border/40 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-10 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">
              {t.hero.title} <span className="text-primary italic">{t.hero.titleItalic}</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t.hero.subtitle}</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodeURIComponent(CONTACT_GREETINGS[language] ?? CONTACT_GREETINGS.en)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/25 uppercase tracking-wide"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Main Catalog Page ────────────────────────────────────────────────────────

export default function Catalog() {
  const { data: cars, isLoading } = useAvailableCars();
  const { t } = useLanguage();
  const catalogRef = useRef<HTMLElement>(null);

  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [search, setSearch] = useState('');
  const [transmission, setTransmission] = useState<string>('all');
  const [priceSort, setPriceSort] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<string>('all');

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredCars = useMemo(() => {
    if (!cars) return [];
    let filtered = cars.filter((car) => {
      const matchesSearch = `${car.brand} ${car.model}`.toLowerCase().includes(search.toLowerCase());
      const matchesTransmission = transmission === 'all' || car.transmission === transmission;
      let matchesPrice = true;
      if (priceRange === 'under-50') matchesPrice = car.price_per_day < 50;
      else if (priceRange === '50-100') matchesPrice = car.price_per_day >= 50 && car.price_per_day <= 100;
      else if (priceRange === 'over-100') matchesPrice = car.price_per_day > 100;
      return matchesSearch && matchesTransmission && matchesPrice;
    });
    if (priceSort === 'low-to-high') filtered.sort((a, b) => a.price_per_day - b.price_per_day);
    else if (priceSort === 'high-to-low') filtered.sort((a, b) => b.price_per_day - a.price_per_day);
    return filtered;
  }, [cars, search, transmission, priceSort, priceRange]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* ── Car Detail Modal ── */}
      {selectedCar && (
        <CarDetailModal
          key={selectedCar.id}
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}

      <Navbar />

      {/* ── Hero headline ─────────────────────────────────── */}
      <section className="py-2 text-center">
        <h1 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
          Car Rental Company in Georgia
        </h1>
      </section>

      {/* ── Destination Columns ───────────────────────────── */}
      <section>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center px-4"
        >
          {t.categories.sectionTitle}
        </motion.p>

        {/* Category cards — 2×2 on mobile, 4 col on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/[0.07]">
          {CATEGORIES.map((cat, i) => (
            <DestinationCard
              key={cat.key}
              categoryKey={cat.key}
              onSelectCar={scrollToCatalog}
              delay={0.1 + i * 0.05}
            />
          ))}
        </div>
      </section>

      {/* ── Feature Bar — standalone block below all cards ── */}
      <FeatureBar />

      {/* ── Filters + Catalog ─────────────────────────────── */}
      <section ref={catalogRef} className="flex-grow container mx-auto px-4 pb-20 scroll-mt-20">
        {/* Filter bar */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-lg">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder={t.filters.searchPlaceholder}
              className="pl-10 bg-secondary/50 border-transparent focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto h-px md:h-10 md:w-px bg-border my-2 md:my-0 md:mx-2" />

          <div className="flex w-full md:w-auto gap-4 flex-grow justify-end flex-wrap">
            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filters.allTypes}</SelectItem>
                <SelectItem value="automatic">{t.filters.automatic}</SelectItem>
                <SelectItem value="manual">{t.filters.manual}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[140px] bg-secondary/50 border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filters.anyPrice}</SelectItem>
                <SelectItem value="under-50">{t.filters.under50}</SelectItem>
                <SelectItem value="50-100">{t.filters.range50100}</SelectItem>
                <SelectItem value="over-100">{t.filters.over100}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-[160px] bg-secondary/50 border-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t.filters.featured}</SelectItem>
                <SelectItem value="low-to-high">{t.filters.lowToHigh}</SelectItem>
                <SelectItem value="high-to-low">{t.filters.highToLow}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Car grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="animate-spin mb-4 text-primary" size={32} />
            <p>{t.states.loading}</p>
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} onOpenDetail={() => setSelectedCar(car)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-xl">
            <Car className="mx-auto mb-4 text-primary opacity-40" size={48} />
            <h3 className="text-xl font-semibold mb-2">{t.states.noResults}</h3>
            <p className="text-muted-foreground mb-2">{t.states.noResultsHint}</p>
          </div>
        )}
      </section>

      {/* ── Why Choose AlfaDrive ──────────────────────────── */}
      <WhyChooseSection />

      {/* ── Where to Find Us ──────────────────────────────── */}
      <FindUsSection />

      {/* ── Reviews ───────────────────────────────────────── */}
      <ReviewsSection />

      {/* ── FAQ / Rental Info ──────────────────────────────── */}
      <div className="border-t border-border/50 pt-16">
        <FaqAccordion />
      </div>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <CTABanner />

      {/* ── Floating WhatsApp / Telegram ──────────────────── */}
      <FloatingContactWidget />

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10">
        <div className="container mx-auto px-4">

          {/* Social media */}
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-5">
              {t.social.heading}
            </p>
            <div className="flex items-center justify-center gap-4">
              {/* Facebook */}
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                 className="w-11 h-11 rounded-full flex items-center justify-center bg-secondary hover:bg-primary transition-all duration-200 hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-white" width={18} height={18}>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 className="w-11 h-11 rounded-full flex items-center justify-center bg-secondary hover:bg-primary transition-all duration-200 hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-white" width={18} height={18}>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                 className="w-11 h-11 rounded-full flex items-center justify-center bg-secondary hover:bg-primary transition-all duration-200 hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-white" width={18} height={18}>
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/30 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AlfaDrive · Georgia ·{' '}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {WHATSAPP_NUMBER}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
