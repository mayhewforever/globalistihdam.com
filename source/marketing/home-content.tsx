import {ArrowUpRight, ArrowRight, ArrowDown, BriefcaseBusiness, GraduationCap, Globe2, Bot} from 'lucide-react';
import {corporateDivisions, corporateJourneys} from '@/lib/corporate-content';
import {CorporateProcess} from '@/app/corporate-sections';
import './home.css';
import BrandSlideshow from './brand-slideshow';

type Language = 'tr' | 'en';
const icons = [BriefcaseBusiness, GraduationCap, Globe2];
const enquiries = {recruitment: ['company', 'employee'], education: ['student', 'university'], investment: ['investment']} as const;
const divisionEntries = [
  {id: 'recruitment', icon: BriefcaseBusiness, title: {tr: 'İstihdam', en: 'Recruitment'}, detail: {tr: 'İşverenler ve adaylar', en: 'Employers & candidates'}},
  {id: 'education', icon: GraduationCap, title: {tr: 'Uluslararası Eğitim', en: 'International Education'}, detail: {tr: 'Öğrenciler ve üniversiteler', en: 'Students & universities'}},
  {id: 'investment', icon: Globe2, title: {tr: 'Yatırım Danışmanlığı', en: 'Investment Advisory'}, detail: {tr: 'Yatırımcılar ve işletmeler', en: 'Investors & businesses'}},
  {id: 'robotics', icon: Bot, title: {tr: 'İnsansı Robotik', en: 'Humanoid Robotics'}, detail: {tr: 'Endüstri ve teknoloji', en: 'Industry & technology'}},
] as const;
const applicationLabels: Record<string, {tr: string; en: string}> = {
  company: {tr: 'İşveren başvurusu', en: 'Employer enquiry'},
  employee: {tr: 'Aday başvurusu', en: 'Candidate enquiry'},
  student: {tr: 'Öğrenci danışmanlığı başvurusu', en: 'Student advisory enquiry'},
  university: {tr: 'Üniversite iş birliği başvurusu', en: 'University cooperation enquiry'},
  investment: {tr: 'Yatırım danışmanlığı talebi', en: 'Investment advisory enquiry'},
  robotics: {tr: 'Robotik değerlendirme talebi', en: 'Robotics assessment enquiry'},
};
const serviceHeadings = [
  {tr: 'İstihdam ve Personel Temini', en: 'Recruitment & Workforce'},
  {tr: 'Uluslararası Eğitim Danışmanlığı', en: 'International Education Advisory'},
  {tr: 'Yatırım ve Pazara Giriş Danışmanlığı', en: 'Investment & Market Entry Advisory'},
];


export default function HomeContent({lang}: {lang: Language}) {
  const tr = lang === 'tr';
  const href = (path: string) => `${path}?lang=${lang}`;
  const enquiry = (type: string) => `/portal?type=${type}&lang=${lang}`;
  return <div className="home-refresh">
    <BrandSlideshow lang={lang}/>

    <section className="home-start-section" aria-labelledby="home-start-title"><div className="pro-container">
        <div className="home-start" aria-labelledby="home-start-title">
          <div className="home-start-copy">
          <span className="home-step">{tr ? 'İLK ADIM' : 'YOUR STARTING POINT'}</span>
          <h2 id="home-start-title">{tr ? 'Nasıl yardımcı olabiliriz?' : 'What brings you here?'}</h2>
          <p>{tr ? 'Hizmet alanını seçerek ilgili danışmanlık veya başvuru formuna ulaşabilirsiniz.' : 'Select a service to open the relevant advisory or application form.'}</p>
          </div>
          <form action="/portal" method="get">
            <input type="hidden" name="lang" value={lang}/>
            <label htmlFor="home-enquiry-type">{tr ? 'Başvuru türü' : 'Enquiry type'}</label>
            <select id="home-enquiry-type" name="type" defaultValue="" required>
              <option value="" disabled>{tr ? 'Başvuru türünü seçin' : 'Select an enquiry type'}</option>
              {corporateJourneys.map(([type]) => <option value={type} key={type}>{applicationLabels[type][lang]}</option>)}
            </select>
            <button type="submit" className="gc-button">{tr ? 'Başvuru formuna geçin' : 'Open the enquiry form'}<ArrowRight size={18} aria-hidden="true"/></button>
          </form>
          <div className="home-returning"><span>{tr ? 'Daha önce başvurdunuz mu?' : 'Already made an enquiry?'}</span><a href={`/portal?view=history&lang=${lang}`}>{tr ? 'Başvurularınızı takip edin' : 'Track your enquiries'}<ArrowUpRight size={15} aria-hidden="true"/></a></div>
        </div>
    </div></section>

    <nav className="home-division-nav" aria-labelledby="home-divisions-title"><div className="pro-container">
      <div className="home-division-nav-heading"><p id="home-divisions-title">{tr ? 'HİZMET BÖLÜMLERİ' : 'SERVICE DIVISIONS'}</p><span>{tr ? 'İlgili bölüme doğrudan erişin.' : 'Go directly to the relevant division.'}</span></div>
      <div className="home-division-grid">{divisionEntries.map((division,i) => {
        const Icon = division.icon;
        return <a key={division.id} className={`home-division-link home-division-${division.id}`} href={`#${division.id}`}><span className="home-division-number">0{i+1}</span><Icon size={23} aria-hidden="true"/><div><strong>{division.title[lang]}</strong><span>{division.detail[lang]}</span></div><ArrowDown className="home-division-arrow" size={17} aria-hidden="true"/></a>;
      })}</div>
    </div></nav>
    <nav className="home-section-nav" aria-label={tr ? 'Rehberler ve çalışma süreci' : 'Guides and our approach'}><div className="pro-container">
      <a href="#explore">{tr ? 'Ülke ve sektör rehberleri' : 'Country & industry guides'}</a><a href="#approach">{tr ? 'Çalışma süreci' : 'Our approach'}</a><a href={href('/services')}>{tr ? 'Tüm hizmetlerin kapsamı' : 'All service information'}</a>
    </div></nav>

    <section className="home-section" id="services" aria-labelledby="services-title"><div className="pro-container">
      <div className="home-section-heading"><div><p className="gc-eyebrow">{tr ? 'UZMANLIK ALANLARIMIZ' : 'OUR CORE SERVICES'}</p><h2 id="services-title">{tr ? 'İstihdam, eğitim ve yatırım hizmetlerimiz' : 'Recruitment, education and investment services'}</h2></div><p>{tr ? 'Üç ana hizmet alanımızın kapsamını inceleyin. İhtiyacınıza uygun danışmanlık ve başvuru sürecini seçin.' : 'Review the scope of our three core services and select the advisory or application process that meets your needs.'}</p></div>
      <div className="home-service-grid">{corporateDivisions.slice(0,3).map((division,i) => {
        const Icon = icons[i];
        return <article className={`home-service home-service-${division.id}`} key={division.id} id={division.id} aria-labelledby={`${division.id}-title`}>
          <a className="home-service-image" href={href(division.path)} tabIndex={-1} aria-hidden="true"><img src={division.image} alt="" width={1200} height={800} loading="lazy"/><span><b>0{i+1}</b>{divisionEntries[i].title[lang]}</span></a>
          <div className="home-service-body"><Icon size={26} aria-hidden="true"/><p className="home-audience">{division.audience[lang]}</p><h3 id={`${division.id}-title`}><a href={href(division.path)}>{serviceHeadings[i][lang]}</a></h3><p>{division.intro[lang]}</p><ul>{division.items[lang].slice(0,2).map(item => <li key={item}>{item}</li>)}</ul>
            <a className="home-service-link" href={href(division.path)}>{tr ? 'Hizmet kapsamını inceleyin' : 'Review the service'}<ArrowUpRight size={18} aria-hidden="true"/></a>
            <div className="home-enquiry-links">{enquiries[division.id as keyof typeof enquiries].map(type => {
              return <a key={type} href={enquiry(type)}>{applicationLabels[type][lang]}<ArrowRight size={14} aria-hidden="true"/></a>;
            })}</div>
          </div>
        </article>;
      })}</div>
    </div></section>

    <section className="home-guides home-section" id="explore" aria-labelledby="explore-title"><div className="pro-container">
      <div className="home-section-heading"><div><p className="gc-eyebrow">{tr ? 'ÜLKE VE SEKTÖR REHBERLERİ' : 'COUNTRY & INDUSTRY GUIDES'}</p><h2 id="explore-title">{tr ? 'Ülkeler, eğitim seçenekleri ve sektörler' : 'Countries, study options and industries'}</h2></div><a className="gc-link" href={href('/countries')}>{tr ? 'Tüm ülke rehberlerini inceleyin' : 'View all country guides'}</a></div>
      <div className="home-guide-grid">
        <a className="home-guide-card" href={`${href('/countries')}#study`}><span className="home-guide-image"><img src="/country-united-kingdom.jpg" alt="" width={800} height={500} loading="lazy"/></span><div><span className="home-step">{tr ? 'EĞİTİM REHBERLERİ' : 'STUDY GUIDES'}</span><h3>{tr ? 'Uluslararası eğitim seçenekleri' : 'International study options'}</h3><p>{tr ? 'Eğitim ülkelerini, üniversiteleri ve başvuru hazırlığını inceleyin.' : 'Explore destinations, universities and application preparation.'}</p><span className="home-guide-action">{tr ? 'Eğitim ülkeleri' : 'Study destinations'}<ArrowUpRight size={19} aria-hidden="true"/></span></div></a>
        <a className="home-guide-card" href={`${href('/countries')}#investment`}><span className="home-guide-image"><img src="/investment-istanbul.jpg" alt="" width={800} height={500} loading="lazy"/></span><div><span className="home-step">{tr ? 'PAZAR REHBERLERİ' : 'MARKET GUIDES'}</span><h3>{tr ? 'Yatırım ve pazara giriş seçenekleri' : 'Investment and market entry options'}</h3><p>{tr ? 'Ülke, sektör ve pazara giriş seçeneklerini karşılaştırın.' : 'Compare countries, sectors and routes into a new market.'}</p><span className="home-guide-action">{tr ? 'Yatırım pazarları' : 'Investment markets'}<ArrowUpRight size={19} aria-hidden="true"/></span></div></a>
        <a className="home-guide-card" href={`${href('/sectors')}#sectors`}><span className="home-guide-image"><img src="/sector-manufacturing.jpg" alt="" width={800} height={500} loading="lazy"/></span><div><span className="home-step">{tr ? 'SEKTÖR REHBERLERİ' : 'INDUSTRY GUIDES'}</span><h3>{tr ? 'Sektörlere göre iş gücü ihtiyaçları' : 'Workforce requirements by industry'}</h3><p>{tr ? 'Turizm, üretim, sağlık ve enerji dâhil farklı sektörlerdeki personel ihtiyaçlarını inceleyin.' : 'Explore workforce requirements across hospitality, energy and other industries.'}</p><span className="home-guide-action">{tr ? 'Sektörleri inceleyin' : 'Explore industries'}<ArrowUpRight size={19} aria-hidden="true"/></span></div></a>
      </div>
      <div className="home-feature-link"><GraduationCap size={25} aria-hidden="true"/><div><strong>{tr ? 'Üniversite tanıtımı: Uluslararası Final Üniversitesi' : 'University profile: Final International University'}</strong><span>{tr ? 'Üniversite profilini, programları ve eğitim yollarını inceleyin.' : 'Explore the university profile, programmes and study pathways.'}</span></div><a className="gc-link" href={href('/universities/final-international-university')}>{tr ? 'Profili inceleyin' : 'View profile'}<ArrowUpRight size={16} aria-hidden="true"/></a></div>
    </div></section>

    <section className="home-section" id="robotics" aria-labelledby="robotics-title"><div className="pro-container home-robotics">
      <div className="home-robotics-image"><img src="/robotics-hero.png" alt={tr ? 'Endüstriyel robotik için yapay zekâ ile oluşturulmuş temsili görsel' : 'AI-generated illustration of industrial robotics'} width={1200} height={800} loading="lazy"/><span>{tr ? 'Yapay zekâ ile oluşturulmuş temsili görsel' : 'AI-generated illustration'}</span></div>
      <div className="home-robotics-copy"><p className="home-eyebrow">{tr ? '04 / ROBOTİK VE OTOMASYON' : '04 / ROBOTICS & AUTOMATION'}</p><h2 id="robotics-title">{tr ? 'İnsansı Robotik ve Endüstriyel Uygulamalar' : 'Humanoid Robotics & Industrial Applications'}</h2><p>{corporateDivisions[3].intro[lang]}</p><div className="home-hero-actions"><a className="gc-button" href={href('/robotics')}>{tr ? 'Robotik hizmetlerini inceleyin' : 'Review robotics services'}<ArrowUpRight size={17} aria-hidden="true"/></a><a className="home-light-link" href={enquiry('robotics')}>{tr ? 'Robotik değerlendirme talebi' : 'Request a robotics assessment'}</a></div></div>
    </div></section>

    <div className="pro-container" id="approach"><CorporateProcess lang={lang}/></div>
    <section className="home-closing"><div className="pro-container"><div><p className="gc-eyebrow">{tr ? 'DANIŞMANLIK VE İLETİŞİM' : 'ADVISORY ENQUIRIES'}</p><h2>{tr ? 'Danışmanlık ihtiyacınızı birlikte değerlendirelim.' : 'Discuss your advisory requirements.'}</h2><p>{tr ? 'Hizmet kapsamı, başvuru süreci ve ihtiyaç duyduğunuz destek hakkında ekibimizle iletişime geçebilirsiniz.' : 'Contact our team to discuss service scope, the enquiry process and the support you require.'}</p></div><a className="gc-button" href={href('/contact')}>{tr ? 'Danışmanlık talebi oluşturun' : 'Contact our advisory team'}<ArrowUpRight size={18} aria-hidden="true"/></a></div></section>
  </div>;
}
