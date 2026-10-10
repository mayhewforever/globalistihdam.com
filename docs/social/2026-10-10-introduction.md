# Globalistihdam introduction — 10 October 2026

A 28-second vertical introduction for Instagram Reels and YouTube Shorts. The audience is adults exploring recruitment, education, investment advisory and humanoid robotics. It introduces research and preparation, followed by the website’s Contact page. It does not ask viewers to submit personal data to the portal.

## Deliverables

- Video: `social/2026-10-10/globalistihdam-introduction.mp4`
- Reproducible renderer: `docs/social/render-introduction.py`
- Format: 720 × 1280, 9:16, 24 fps, H.264 High profile, YUV 4:2:0, AAC stereo, 28 seconds, fast-start MP4.
- English onscreen text. No narration; original, softly synthesized ambient accompaniment.
- The full-colour Türkiye-centred v4 logo is only scaled proportionally, never recoloured or cropped. Existing website photographs are marked illustrative.

Recreate from the repository root with:

```sh
python docs/social/render-introduction.py
```

The script uses Python’s standard library, FFmpeg, FFprobe and the installed DejaVu Sans fonts. It does not use a network service, API key, external music library or publishing tool. Temporary working files are deleted after rendering.

## Storyboard

Scenes overlap by 0.4 seconds through restrained dissolves. Typography enters with a short horizontal settling motion; photographs move gently within their frames.

| Scene | Timeline | Main onscreen copy | Visual |
|---|---|---|---|
| Introduction | 00:00–00:05 | Work. Study. Build. Across borders. / Explore what matters to you. | Energy professionals; live wordmark and unchanged v4 symbol |
| Four service areas | 00:04.6–00:09.6 | Find your focus. / Recruitment / International Education / Investment Advisory / Humanoid Robotics | Four restrained brand-colour accents; v4 banner |
| Explore | 00:09.2–00:14.2 | 01 / Explore. See the options. / Browse service, country and university guides. | University students |
| Prepare | 00:13.8–00:18.8 | 02 / Prepare. Bring the right questions. / Your goals. Your experience. Your preferred destinations. | Manufacturing photograph |
| Connect | 00:18.4–00:23.4 | 03 / Connect. Discuss your next step. / Visit the Contact page and tell us what you need. | Istanbul photograph |
| Closing | 00:23–00:28 | Explore the website. / Start with your questions. / Explore Globalistihdam. | Large full-colour v4 symbol on navy |

## Suggested publishing copy

**English title:** Globalistihdam | Explore. Prepare. Connect.

**Turkish title:** Globalistihdam | Keşfedin. Hazırlanın. İletişime geçin.

**Bilingual caption:**

İstihdam, uluslararası eğitim, yatırım danışmanlığı veya insansı robotlar alanında bir sonraki adımınızı mı planlıyorsunuz?

Hizmet, ülke ve üniversite rehberlerini keşfedin. Hedeflerinizi ve sorularınızı hazırlayın. İhtiyacınızı görüşmek için web sitemizdeki İletişim sayfasını kullanın.

Planning your next step in recruitment, international education, investment advisory or humanoid robotics?

Explore our service, country and university guides. Prepare your goals and questions. Use the website’s Contact page to discuss what you need.

🌐 https://globalistihdam.mtoman.chatgpt.site

Görseller temsilidir. / Photographs are illustrative.

#Globalistihdam #Recruitment #InternationalEducation #InvestmentAdvisory #HumanoidRobotics

## Publishing settings

- Instagram: Reel, vertical 9:16.
- YouTube: Short, public when approved by the publishing workflow; **not made for kids**.
- Audience: general adult and business audience. No age-sensitive claims or targeting.
- The closing uses the neutral CTA “Explore Globalistihdam.” The actual website URL is supplied in the bilingual caption and YouTube description; no bio-link availability is assumed.
- No phone number, email address, WhatsApp contact, job offer, admission promise, visa promise, investment return, response-time claim or email notification claim appears.
- The application portal remains a preview. This video deliberately covers exploring the website and preparing questions, rather than instructing viewers to submit real personal data.
- Assets are reused from this user-owned site. Existing photograph provenance remains in `PHOTO-CREDITS.txt`; no new rights claims are made.

## Weekly video cadence

The latest request is one video per week for YouTube and the same video for Instagram. Use this first 28-second edit on both channels. Weekly videos are separate from the daily website/news updates: do not create a daily-video schedule. The parent publishing workflow owns scheduling and platform actions. Each weekly edit should explain a useful service, research question or preparation step with current verified information; it should not recycle unverified job, visa, admissions or investment claims.

## Verification

Verified after the final render: 28.000 seconds, 720 × 1280, 24 fps, H.264, YUV 4:2:0, AAC stereo at 32 kHz, 1,917,764 bytes (1.92 MB). The entire MP4 decoded without errors. The original ambient audio measures approximately −29.6 dB mean and −19.4 dB peak; it is intentionally quiet and contains no speech. A six-frame contact sheet was extracted and visually inspected: headings, logo, photographs and closing CTA are legible, remain within the frame, and do not overlap. The contact sheet is a temporary QA artifact, not a publishing asset. Publishing is handled separately by the parent workflow.
