/* Editorial public homepage. No personal data is collected by this renderer. */
(function () {
  'use strict';
  const arrow = '<svg class="gi-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const diagonal = '<svg class="gi-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const copy = {
    tr: {
      eyebrow: 'İNSAN. BİLGİ. YENİ OLASILIKLAR.',
      title: 'Uluslararası<br><em>Danışmanlık.</em>',
      intro: 'Kariyeriniz, eğitiminiz ve işiniz için sınırların ötesini düşünün. Uluslararası hedeflerinizi, birlikte somut adımlara dönüştürelim.',
      primary: 'Kariyeriniz için başlayın', secondary: 'Ekibinizi güçlendirin',
      imageAlt: 'Güneş enerjisi sahasında birlikte çalışan mühendisler',
      visualLabel: 'ULUSLARARASI BİR BAKIŞ', visualTitle: 'Gelecek, birlikte<br>kurulur.',
      visualCaption: 'İstihdam · Eğitim · Yatırım · Robotik',
      audienceLabel: 'SİZİN İÇİN DOĞRU BAŞLANGIÇ',
      audiences: [
        ['Adaylar için', 'Deneyiminizi paylaşın, kariyer hedefinizi belirleyin.'],
        ['İşverenler için', 'İş gücü ve yetkinlik ihtiyaçlarınızı tanımlayın.'],
        ['Öğrenciler için', 'Eğitim tercihlerinizi uluslararası ölçekte değerlendirin.']
      ],
      servicesLabel: 'UZMANLIK ALANLARIMIZ',
      servicesTitle: 'Hizmetlerimiz',
      servicesIntro: 'İnsan kaynağından eğitime, pazara girişten yeni teknolojilere. İhtiyacınıza uygun hizmet alanını keşfedin.',
      about: 'Globalistihdam’ı tanıyın',
      services: [
        ['İstihdam', 'İşverenlerin personel ihtiyaçlarını ve adayların deneyimlerini sektörün beklentileriyle birlikte değerlendiren danışmanlık.', 'İŞVERENLER & ADAYLAR', 'İstihdam hizmetlerini keşfedin'],
        ['Uluslararası Eğitim', 'Ülke, üniversite ve program seçeneklerini keşfedin. Akademik hedeflerinize uygun bir başvuru planı hazırlayın.', 'ÖĞRENCİLER & ÜNİVERSİTELER', 'Eğitim seçeneklerini keşfedin'],
        ['Yatırım Danışmanlığı', 'Yeni bir pazarı anlamak, iş bağlantılarını değerlendirmek ve sonraki adımları belirlemek için danışmanlık alanlarımızı inceleyin.', 'GİRİŞİMCİLER & İŞLETMELER', 'Yatırım danışmanlığını keşfedin'],
        ['İnsansı Robotlar', 'İnsansı robotik çözümlerin kullanım alanlarını keşfedin. Kurumunuzun uygulama ve iş birliği ihtiyaçlarını paylaşın.', 'TEKNOLOJİ & İŞ BİRLİĞİ', 'Robotik çözümleri keşfedin']
      ],
      studyLabel: 'Uluslararası Eğitim',
      studyTitle: 'Eğitim Ülkeleri',
      studyIntro: 'Nerede okumak istediğiniz kadar, neyi başarmak istediğiniz de önemli. Üniversiteleri, eğitim bölgelerini ve başvuru hazırlığına ilişkin bilgileri bir arada inceleyin.',
      studyPhoto: 'Kampüste birlikte ders çalışan üniversite öğrencileri',
      studyImageLabel: 'MERAKINIZ SİZE YOL GÖSTERSİN.',
      studyCta: 'Tüm eğitim seçenekleri', destinationLabel: 'Eğitim bölgelerini keşfedin',
      destinations: ['Almanya', 'Kuzey Kıbrıs', 'Azerbaycan', 'Kanada', 'Amerika Birleşik Devletleri', 'Çin'],
      sectorLabel: 'SEKTÖREL UZMANLIK',
      sectorTitle: 'Sektörler',
      sectorIntro: 'Doğru başlangıç, işin gerektirdiklerini anlamaktır. Hizmet alanlarımızı inceleyin ve mesleki hedefinizi ya da personel ihtiyacınızı bizimle paylaşın.',
      allSectors: 'Tüm sektörleri inceleyin',
      sectors: [
        ['Sağlık hizmetleri', 'Klinik ve destek ekipleri', 'Bir hastanede bir araya gelen sağlık çalışanları'],
        ['Turizm ve konaklama', 'Misafir deneyimi ve operasyon', 'Otel resepsiyonunda çalışan bir görevli'],
        ['Üretim ve mühendislik', 'Teknik yetkinlik ve üretim', 'Üretim ve mühendislik sektörünü temsil eden çalışma alanı']
      ],
      moreSectors: ['Enerji', 'Eğitim ve dil hizmetleri', 'Bakım ve destek'],
      investmentLabel: 'Yatırım Danışmanlığı',
      investmentTitle: 'Yatırım Danışmanlığı',
      investmentIntro: 'Türkiye ve uluslararası pazarlar için iş geliştirme, bağlantı kurma ve pazara giriş başlıklarını keşfedin.',
      investmentCta: 'Pazarları ve hizmetleri inceleyin',
      investmentAlt: 'İstanbul Boğazı kıyısından şehir manzarası',
      processLabel: 'BAŞVURU MERKEZİ', processTitle: 'Başvuru Süreci',
      processIntro: 'İlk görüşmeden sonraki adımlara kadar, ihtiyacı anlamaya ve beklentileri açıkça tanımlamaya odaklanırız.',
      steps: [
        ['Hedefinizi paylaşın', 'Size uygun başvuru yolunu seçin. Deneyiminizi, eğitim hedefinizi veya kuruluşunuzun ihtiyacını açıklayın.'],
        ['İhtiyaçları netleştirelim', 'Kapsamı, tercihleri ve hazırlanması gereken bilgileri birlikte değerlendirelim.'],
        ['Sonraki adımı planlayalım', 'İlgili hizmetin koşullarını ve takip edilecek yolu görüşerek ilerleyelim.']
      ],
      faqLabel: 'BAŞVURU REHBERİ', faqTitle: 'Sık Sorulanlar',
      faqs: [
        ['Hangi başvuru yolunu seçmeliyim?', 'İş arıyorsanız aday, personel arıyorsanız işveren, yurt dışında eğitim planlıyorsanız öğrenci başvurusunu seçin. Yatırım ve robotik talepleriniz için ilgili hizmet sayfasını kullanabilir veya bizimle görüşebilirsiniz.'],
        ['Listelenen sektörler açık iş ilanı anlamına gelir mi?', 'Hayır. Sektör sayfaları hizmet alanlarını tanıtır. Güncel pozisyonları, uygunluk koşullarını ve başvuru sürecini ayrıca teyit etmeniz gerekir.'],
        ['Üniversite ve program bilgilerini nasıl değerlendirmeliyim?', 'Ülke ve üniversite sayfaları ilk araştırmanıza yardımcı olur. Başvurmadan önce programın güncel kabul şartlarını, ücretlerini ve son tarihlerini ilgili üniversiteden doğrulayın.']
      ],
      contactLabel: 'BİR SONRAKİ ADIM', contactTitle: 'İletişim',
      contactIntro: 'Bir kariyer değişikliği, yeni bir ekip veya uluslararası bir eğitim planı. Sizin için önemli olanı dinleyelim.',
      contactCta: 'Bizimle iletişime geçin', callLabel: 'WHATSAPP',
      photography: 'Sektör ve öğrenci fotoğrafları temsili görsellerdir.'
    },
    en: {
      eyebrow: 'PEOPLE. KNOWLEDGE. POSSIBILITIES.',
      title: 'International<br><em>Advisory.</em>',
      intro: 'Think beyond borders for your career, education and business. Let’s turn your international ambitions into a considered next step.',
      primary: 'Start your career enquiry', secondary: 'Build your team',
      imageAlt: 'Engineers working together at a solar energy site',
      visualLabel: 'AN INTERNATIONAL PERSPECTIVE', visualTitle: 'The future is<br>a shared endeavour.',
      visualCaption: 'Recruitment · Education · Investment · Robotics',
      audienceLabel: 'FIND YOUR STARTING POINT',
      audiences: [
        ['For candidates', 'Share your experience and define your next career move.'],
        ['For employers', 'Tell us about your workforce and skills requirements.'],
        ['For students', 'Explore an international perspective on your education.']
      ],
      servicesLabel: 'OUR EXPERTISE',
      servicesTitle: 'Our Services',
      servicesIntro: 'From workforce needs and education to market entry and emerging technology. Find the service that fits your plans.',
      about: 'Get to know Globalistihdam',
      services: [
        ['Recruitment', 'Consultancy that considers employers’ staffing needs and candidates’ experience alongside the requirements of their industry.', 'EMPLOYERS & CANDIDATES', 'Explore recruitment services'],
        ['International Education', 'Discover countries, universities and programme options. Start preparing an application plan around your academic ambitions.', 'STUDENTS & UNIVERSITIES', 'Explore education options'],
        ['Investment Advisory', 'Explore our advisory areas to understand a new market, consider business connections and identify your next steps.', 'ENTREPRENEURS & BUSINESSES', 'Explore investment advisory'],
        ['Humanoid Robotics', 'Discover potential applications for humanoid robotics. Share your organisation’s implementation and cooperation requirements.', 'TECHNOLOGY & COOPERATION', 'Explore robotics solutions']
      ],
      studyLabel: 'International Education',
      studyTitle: 'Study Destinations',
      studyIntro: 'What you want to achieve matters as much as where you want to study. Explore universities, destinations and application preparation in one place.',
      studyPhoto: 'University students studying together on campus',
      studyImageLabel: 'LET CURIOSITY LEAD THE WAY.',
      studyCta: 'Explore all education options', destinationLabel: 'Explore study destinations',
      destinations: ['Germany', 'North Cyprus', 'Azerbaijan', 'Canada', 'United States', 'China'],
      sectorLabel: 'SECTOR EXPERTISE',
      sectorTitle: 'Sectors',
      sectorIntro: 'A good starting point is understanding the work. Explore our service areas and share your professional ambitions or staffing requirements.',
      allSectors: 'Explore all sectors',
      sectors: [
        ['Healthcare', 'Clinical and support teams', 'Healthcare professionals together in a hospital'],
        ['Tourism & hospitality', 'Guest experience and operations', 'A member of staff working at a hotel reception'],
        ['Manufacturing & engineering', 'Technical skills and production', 'A working environment illustrating manufacturing and engineering']
      ],
      moreSectors: ['Energy', 'Education & language services', 'Care & support'],
      investmentLabel: 'Investment Advisory',
      investmentTitle: 'Investment Advisory',
      investmentIntro: 'Explore business development, relationship building and market entry topics for Türkiye and international markets.',
      investmentCta: 'Explore markets and services',
      investmentAlt: 'A view of Istanbul from the Bosphorus waterfront',
      processLabel: 'APPLICATION CENTRE', processTitle: 'Application Process',
      processIntro: 'From your first enquiry to the next steps, we focus on understanding your requirements and setting clear expectations.',
      steps: [
        ['Share your ambition', 'Choose the relevant application route. Describe your experience, study goals or organisation’s requirements.'],
        ['Clarify the requirements', 'Let’s consider the scope, your preferences and the information you will need to prepare.'],
        ['Plan your next step', 'Discuss the relevant service conditions and agree on a path forward.']
      ],
      faqLabel: 'APPLICATION GUIDANCE', faqTitle: 'FAQs',
      faqs: [
        ['Which application route should I choose?', 'Choose the candidate route if you are looking for work, the employer route if you are recruiting, or the student route if you are planning to study abroad. For investment and robotics enquiries, visit the relevant service page or contact us.'],
        ['Do the listed sectors represent current vacancies?', 'No. Sector pages introduce service areas. Current vacancies, eligibility requirements and the application process need to be confirmed separately.'],
        ['How should I use the university and programme information?', 'Country and university pages support your initial research. Before applying, confirm current entry requirements, fees and deadlines directly with the relevant university.']
      ],
      contactLabel: 'YOUR NEXT STEP', contactTitle: 'Contact',
      contactIntro: 'A career move, a new team or an international education. Tell us what matters to you.',
      contactCta: 'Start a conversation', callLabel: 'WHATSAPP',
      photography: 'Industry and student photographs are illustrative.'
    }
  };

  globalThis.GlobalistihdamHome = function (language) {
    const lang = language === 'en' ? 'en' : 'tr';
    const c = copy[lang];
    const runtime = globalThis.GlobalistihdamRuntime;
    const local = path => runtime.url(path + (path.includes('?') ? '&' : '?') + 'lang=' + lang);
    const asset = path => runtime.url('/' + path);
    const portal = type => runtime.portalOrigin + '/portal?type=' + type + '&lang=' + lang;
    const contact = runtime.url('/#' + lang + '/contact');
    const about = runtime.url('/#' + lang + '/corporate');
    const audienceLinks = [portal('employee'), portal('company'), portal('student')];
    const serviceLinks = [local('/sectors/'), local('/education/'), local('/investment/'), runtime.portalOrigin + '/robotics?lang=' + lang];
    const destinationSlugs = ['germany', 'north-cyprus', 'azerbaijan', 'canada', 'usa', 'china'];
    const sectorSlugs = ['healthcare', 'hospitality', 'manufacturing'];
    const serviceImages = ['energy-team.jpg', 'students-campus.jpg', 'investment-istanbul.jpg', 'sector-manufacturing.jpg'];

    return `<div class="gi-home">
      <section class="gi-hero" aria-labelledby="gi-hero-title">
        <div class="gi-shell gi-hero-grid">
          <div class="gi-hero-copy">
            <p class="gi-kicker"><span aria-hidden="true"></span>${c.eyebrow}</p>
            <h1 class="gi-hero-title" id="gi-hero-title">${c.title}</h1>
            <p class="gi-hero-intro">${c.intro}</p>
            <div class="gi-actions"><a class="gi-button" href="${audienceLinks[0]}">${c.primary}${arrow}</a><a class="gi-link" href="${audienceLinks[1]}">${c.secondary}${arrow}</a></div>
          </div>
          <figure class="gi-hero-visual">
            <img src="${asset('energy-team.jpg')}" width="1800" height="1200" alt="${c.imageAlt}" fetchpriority="high">
            <figcaption><span class="gi-visual-label">${c.visualLabel}</span><strong>${c.visualTitle}</strong><span class="gi-visual-caption">${c.visualCaption}</span></figcaption>
            <span class="gi-visual-corner" aria-hidden="true">${diagonal}</span>
          </figure>
        </div>
      </section>
      <section class="gi-audiences gi-shell" aria-label="${c.audienceLabel}">
        ${c.audiences.map((a, i) => `<a class="gi-audience" href="${audienceLinks[i]}"><span class="gi-number">0${i + 1}</span><div><h2>${a[0]}</h2><p>${a[1]}</p></div>${diagonal}</a>`).join('')}
      </section>
      <section class="gi-services gi-section" aria-labelledby="gi-services-title">
        <div class="gi-shell gi-services-layout"><div class="gi-services-intro"><p class="gi-kicker">${c.servicesLabel}</p><h2 class="gi-title" id="gi-services-title">${c.servicesTitle}</h2><p class="gi-body">${c.servicesIntro}</p><a class="gi-link" href="${about}">${c.about}${arrow}</a></div><div class="gi-service-list">
          ${c.services.map((s, i) => `<article class="gi-service"><span class="gi-number" aria-hidden="true">0${i + 1}</span><div class="gi-service-copy"><p class="gi-service-tag">${s[2]}</p><h3><a href="${serviceLinks[i]}">${s[0]}</a></h3><p>${s[1]}</p></div><img class="gi-service-image" src="${asset(serviceImages[i])}" width="1800" height="1200" alt="" loading="lazy"><a class="gi-icon-link" href="${serviceLinks[i]}" aria-label="${s[3]}">${diagonal}</a></article>`).join('')}
        </div></div>
      </section>
      <section class="gi-study gi-section" aria-labelledby="gi-study-title"><div class="gi-shell gi-study-layout">
        <figure class="gi-study-image"><img src="${asset('students-campus.jpg')}" width="1800" height="1200" alt="${c.studyPhoto}" loading="lazy"><figcaption>${c.studyImageLabel}</figcaption></figure>
        <div class="gi-study-copy"><p class="gi-kicker">${c.studyLabel}</p><h2 class="gi-title" id="gi-study-title">${c.studyTitle}</h2><p class="gi-body">${c.studyIntro}</p><nav class="gi-destinations" aria-label="${c.destinationLabel}">${c.destinations.map((d, i) => `<a href="${local('/education/' + destinationSlugs[i] + '/')}"><span>${d}</span>${arrow}</a>`).join('')}</nav><a class="gi-link" href="${serviceLinks[1]}">${c.studyCta}${arrow}</a></div>
      </div></section>
      <section class="gi-sectors gi-section" aria-labelledby="gi-sectors-title"><div class="gi-shell">
        <div class="gi-section-heading"><div><p class="gi-kicker">${c.sectorLabel}</p><h2 class="gi-title" id="gi-sectors-title">${c.sectorTitle}</h2></div><div><p class="gi-body">${c.sectorIntro}</p><a class="gi-link" href="${serviceLinks[0]}">${c.allSectors}${arrow}</a></div></div>
        <div class="gi-sector-grid">${c.sectors.map((s, i) => `<a class="gi-sector" href="${local('/sectors/' + sectorSlugs[i] + '/')}"><div class="gi-sector-photo"><img src="${asset('sector-' + sectorSlugs[i] + '.jpg')}" width="1800" height="1200" alt="${s[2]}" loading="lazy"></div><div class="gi-sector-heading"><div><p>${s[1]}</p><h3>${s[0]}</h3></div>${diagonal}</div></a>`).join('')}</div>
        <nav class="gi-sector-more" aria-label="${c.allSectors}">${c.moreSectors.map((s, i) => `<a href="${local('/sectors/' + ['energy', 'education', 'care'][i] + '/')}">${s}${arrow}</a>`).join('')}</nav>
      </div></section>
      <section class="gi-investment" aria-labelledby="gi-investment-title"><div class="gi-shell gi-investment-layout"><div class="gi-investment-copy"><p class="gi-kicker">${c.investmentLabel}</p><h2 class="gi-title" id="gi-investment-title">${c.investmentTitle}</h2><p class="gi-body">${c.investmentIntro}</p><a class="gi-link" href="${serviceLinks[2]}">${c.investmentCta}${arrow}</a></div><img src="${asset('investment-istanbul.jpg')}" alt="${c.investmentAlt}" width="2100" height="1180" loading="lazy"></div></section>
      <section class="gi-process gi-section" aria-labelledby="gi-process-title"><div class="gi-shell"><div class="gi-section-heading"><div><p class="gi-kicker">${c.processLabel}</p><h2 class="gi-title" id="gi-process-title">${c.processTitle}</h2></div><p class="gi-body">${c.processIntro}</p></div><ol class="gi-steps">${c.steps.map((s, i) => `<li><span class="gi-step-number" aria-hidden="true">0${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('')}</ol><section class="gi-faq-layout" aria-labelledby="gi-faq-title"><div class="gi-faq-intro"><p class="gi-kicker">${c.faqLabel}</p><h2 class="gi-title" id="gi-faq-title">${c.faqTitle}</h2></div><div class="gi-faq">${c.faqs.map(q => `<details><summary>${q[0]}<span aria-hidden="true">+</span></summary><p>${q[1]}</p></details>`).join('')}</div></section></div></section>
      <section class="gi-contact" aria-labelledby="gi-contact-title"><div class="gi-shell gi-contact-layout"><div><p class="gi-kicker">${c.contactLabel}</p><h2 class="gi-title" id="gi-contact-title">${c.contactTitle}</h2><p class="gi-body">${c.contactIntro}</p><a class="gi-button gi-button-light" href="${contact}">${c.contactCta}${arrow}</a></div><div class="gi-direct"><p class="gi-kicker">${c.callLabel}</p><a data-whatsapp href="https://global-istihdam.mtoman.chatgpt.site/contact/whatsapp" target="_blank" rel="noopener noreferrer">${lang==='tr'?'WhatsApp’tan yazın':'Chat on WhatsApp'}${diagonal}</a><span>Globalistihdam<br>Recruitment&amp;Investment Agency</span></div></div></section>
      <p class="gi-photo-note gi-shell">${c.photography}</p>
    </div>`;
  };
})();
