# Dashboard Design editor technical and UX plan

Date: 2026-06-23

Status: approved V1 implementation spec. The implementation task adds the migration, shared appearance model, dashboard Design editor, save action, and public/preview render support described below.

Approved V1 decisions:

- Design mode stays inside `/dashboard` as client-side `content | design` state. No new route is opened.
- Header V1 supports all mockup layout presets as real safe visual presets: `classic`, `hero`, `banner`, `cutout`, `shape`.
- No new avatar upload system is added. Header layouts use the existing avatar URL or fallback.
- Save behavior is explicit `Save changes`. Dashboard preview uses draft state instantly; the public profile uses only saved `appearance`.
- All Theme cards are active/selectable for now. No fake upgrade, locked, or Pro behavior is added to Theme cards.
- Footer V1 is default-only. Users cannot hide footer or edit footer links.
- Color validation stays limited to `#RRGGBB`.
- `schibsted-grotesk` remains the main font. The V1 font allowlist is `schibsted-grotesk`, `system-sans`, `serif-soft`, `mono-quiet`.
- The attached mockups are the source of truth for Design layout, spacing, inner navigation, and panel hierarchy in the implementation phase.

## 1. Dashboard Design ekran akışı ve mevcut shell'e entegrasyonu

Mevcut dashboard shell korunur: siyah top bar, sabit 84px sol rail, rail ile sag preview arasinda tek scroll alanina sahip orta editor, sagda sabit `%40` live preview tuvali. Design ekrani bu shell'in icinde, Content ekranina paralel ikinci bir dashboard modu olarak calisir.

Onerilen akis:

1. Sol rail iki ana islevi gosterir: `Content` ve `Design`. `Content` bugunku link editorunu acmaya devam eder. `Design` orta editor alaninda design editorunu acar.
2. Sag live preview kolonu hic degismez. `ProfilePreview`, yine `PublicProfileSurface` uzerinden render alir ve dashboard state'iyle canli kalir.
3. Design secildiginde orta editor iki parcaya ayrilir: solda Design ic navigasyonu, sagda aktif Design paneli. Ic navigasyon mockuplardaki sirayi izler: `Theme`, `Header`, `Wallpaper`, `Text`, `Buttons`, `Colors`, `Stickers`, `Footer`.
4. Orta editor scroll davranisi aynen korunur. Design ic navigasyonu orta alanin icinde sabit gibi davranabilir, fakat body/page veya preview scroll almamalidir.
5. Mockuplardaki ust `Enhance` veya promo alani V1'de yeni paket, odeme entegrasyonu veya analitik eklemez. Theme kartlarinda fake upgrade, locked veya Pro davranisi kullanilmaz.

V1 karari: dashboard icinde client-side mod state'i (`content | design`) ile ilerlemek. Yeni dashboard route'u acilmaz. Bu yol mevcut `LinkManager` local preview state'ini korur ve mockuplardaki orta editor akisini shell'i bolmeden ekler.

## 2. Her Design sekmesinin V1 kapsamı

### Theme

V1 hedefi, tema kartlarini mockup hiyerarsisiyle gostermek ve allowlist preset'leri profile appearance draft'ina uygulamaktir. Mockuptaki tum Theme kartlari simdilik aktif ve secilebilir olur. Fake upgrade, locked veya Pro davranisi eklenmez.

Gercek etki: background, font, button style, radius, shadow ve renk token'larini tek preset olarak draft'a uygular.

### Header

V1 hedefi, header layout secimlerini ve temel baslik gorunumunu yonetmektir.

Gercek etki: `classic`, `hero`, `banner`, `cutout`, `shape` layout preset'leri; title alignment; title color; alternative title font boolean. Bu presetler yeni upload sistemi gerektirmeden mevcut avatar URL'sini veya fallback avatar'i farkli guvenli CSS kompozisyonlariyla kullanir.

Inert/ertelenen etki: yeni avatar upload, logo upload veya kullanici medyasi compositing. Mockuptaki `Profile image Add` kontrolu V1'de mevcut avatar zincirini bozmadan inert kalir.

### Wallpaper

V1 hedefi, profil yuzeyinin arka plan hissini guvenli sekilde degistirmektir.

Gercek etki: `fill`, `gradient`, `soft-blur`, `pattern-grid` gibi allowlist stilleri; background color.

Inert/ertelenen etki: kullanici image/video wallpaper yukleme, harici medya, blur icin dinamik image processing.

### Text

V1 hedefi, page font ve metin renklerini yonetmektir.

Gercek etki: allowlist font preset'i, page text color, title color, alternative title font boolean.

Fontlar yeni paket eklemeden calismalidir. Bu nedenle V1 font preset'leri mevcut font stack veya CSS font-family alias'lariyla sinirlanir.

### Buttons

V1 hedefi, public link kartlarinin temel seklini yonetmektir.

Gercek etki: button style (`solid`, `outline`, `soft`), radius, shadow, button background, button text color, link title alignment.

Inert/ertelenen etki: glass gibi daha karmasik backdrop davranislari, motion, hover scale veya ozel per-link stil.

### Colors

V1 hedefi, merkezi color token editorudur.

Gercek etki: background, button, button text, page text, title renkleri. Bu panel, Theme/Text/Buttons/Wallpaper panellerindeki ilgili renk kontrolleriyle ayni canonical appearance token'larini yazar.

### Stickers

V1'de mockupta gorunur, fakat gercek sticker sistemi acilmaz. `None` ve belki tek guvenli dekoratif preset gosterilebilir. Kullanici yukleme, pozisyonlama, layer sistemi V2'ye kalir.

### Footer

V1'de mockupta gorunur. Gercek public footer linkleri korunur: `Privacy`, `Report`, `About Canvas Links`. V1 default-only kalir; kullanici footer'i kapatamaz veya footer linklerini degistiremez. Sahte sayfa veya yeni islev eklenmez.

## 3. Gerçek çalışacak ayarlar ile yalnız görsel/inert kalacak ayarların ayrımı

Gercek calisacak V1 ayarlari:

- Theme: tum allowlist preset secimleri.
- Header: `classic`, `hero`, `banner`, `cutout`, `shape` layoutlari, title alignment, title color, alternative title font.
- Wallpaper: fill/gradient/pattern gibi allowlist style, background color.
- Text: page font preset, page text color, title color.
- Buttons: style, radius, shadow, background color, text color, alignment.
- Colors: canonical color token editoru.

Yalniz gorsel/inert kalacak V1 ayarlari:

- Header image upload, logo upload ve kullanici medyasi compositing.
- Wallpaper image/video upload.
- Stickers custom upload, sticker position/layer editoru.
- Footer dis baglantilarini duzenleme veya yeni sayfa uretme.
- Enhance/AI benzeri aksiyonlar.
- Analitik, public routing, RLS disi data veya yeni server-side otomasyon.

Inert kontroller `disabled` veya `aria-disabled` ile gercekten etkisiz olmalidir. Tiklanabilir gorunup veri degistirmemelidir.

## 4. `profiles.appearance` için güvenli, sürümlü JSONB şema önerisi

V1 icin tek kolon onerilir: `profiles.appearance jsonb not null default ...`. Bu kolon, public profile render'i icin gerekli gorunum state'ini version'li ve allowlist temelli saklar.

Onerilen normalized sekil:

```json
{
  "version": 1,
  "themePreset": "custom",
  "tokens": {
    "background": "#ECEEF1",
    "surface": "#FFFFFF",
    "pageText": "#000000",
    "title": "#000000",
    "buttonBackground": "#FFFFFF",
    "buttonText": "#000000"
  },
  "header": {
    "layout": "classic",
    "alignment": "center",
    "titleStyle": "text",
    "alternativeTitleFont": false
  },
  "wallpaper": {
    "style": "fill",
    "pattern": "none"
  },
  "text": {
    "font": "schibsted-grotesk"
  },
  "buttons": {
    "style": "solid",
    "radius": "rounder",
    "shadow": "none",
    "alignment": "center"
  },
  "stickers": {
    "preset": "none"
  },
  "footer": {
    "style": "default",
    "visible": true
  }
}
```

Kurallar:

- `version` zorunlu olur. Bilinmeyen version public render'da default V1 appearance'a dusmelidir.
- Unknown key'ler server action'da atilir; istemciden gelen JSON birebir saklanmaz.
- Theme preset uygulandiginda `tokens`, `wallpaper`, `text`, `buttons` gibi alanlar canonical sekle normalize edilir.
- Renkler yalniz sabit token alanlarina yazilir; keyfi CSS property veya class name saklanmaz.
- `footer.visible` V1'de true kalabilir; yasal/rapor linkleri saklamak icin false serbest bir kullanici ayari yapilmaz.

## 5. İzin verilen preset/enum listeleri

### Theme

V1 aktif/secilebilir:

- `custom`
- `air`
- `agate`
- `astrid`
- `aura`
- `bliss`
- `blocks`
- `bloom`
- `breeze`
- `encore`
- `grid`
- `groove`
- `haven`
- `lake`
- `mineral`
- `nourish`
- `rise`
- `sweat`
- `tress`
- `twilight`
- `vox`

### Header layout

V1 aktif:

- `classic`
- `hero`
- `banner`
- `cutout`
- `shape`

### Wallpaper style

V1 aktif:

- `fill`
- `gradient`
- `soft-blur`
- `pattern-grid`

V1 inert:

- `image`
- `video`

### Font

Yeni paket eklemeden allowlist:

- `schibsted-grotesk`: mevcut ana uygulama fontu.
- `system-sans`: system-ui, sans-serif.
- `serif-soft`: Georgia, serif.
- `mono-quiet`: ui-monospace, monospace.

### Button style

- `solid`
- `outline`
- `soft`

V1 inert/ertelenen:

- `glass`

### Radius

- `square`
- `round`
- `rounder`
- `full`

### Shadow

- `none`
- `soft`
- `strong`
- `hard`

V1 varsayilan: `none` veya `soft`. Hover hareketi eklenmez.

### Alignment

- `left`
- `center`

V1 varsayilan: `center`. Link title mockup geregi merkezli kalir; thumbnail varsa title optik olarak dengelenir.

### Renk değerleri

Kabul edilen format:

- `#RRGGBB`

Varsayilan token'lar:

- background: `#ECEEF1`
- surface: `#FFFFFF`
- pageText: `#000000`
- title: `#000000`
- buttonBackground: `#FFFFFF`
- buttonText: `#000000`

V1'de alpha, gradient string, CSS named color, `rgb()`, `hsl()`, `var()`, URL veya herhangi bir raw CSS kabul edilmez.

## 6. Renk girişleri için güvenli doğrulama yaklaşımı

Renk dogrulama server action ve client helper'da ayni kural setinden beslenmelidir.

Guvenli yaklasim:

1. Deger string degilse reddet.
2. Trim sonrasi yalniz `^#[0-9A-Fa-f]{6}$` kabul et.
3. Degeri uppercase normalize et.
4. Renk sadece bilinen token key'lerine yazilsin.
5. Iceriden CSS property adi, className, selector, `style` objesi veya arbitrary CSS string kabul edilmesin.
6. Public render tarafinda inline CSS variable kullanilacaksa variable isimleri kod tarafinda sabit olsin; kullanici yalniz dogrulanmis hex value saglasin.
7. Gecersiz veya eksik renklerde default token kullanilsin; public route hata vermesin.

Bu model, `backgroundColor: "red"` veya `background: "url(...)"` gibi yollarin hicbirini veri modeline sokmaz.

## 7. Live preview state mimarisi ve kaydetme davranışı

`LinkManager` bugun link, bio ve social handle state'lerinin merkezi. V1 Design icin ayni yerde `appearanceDraft` ve `appearanceSaved` state'i tutulur.

Akis:

1. Dashboard server load `getCurrentProfile()` icinden `appearance` alanini da getirir.
2. `LinkManager`, gelen appearance'i default V1 appearance ile merge edip draft state'e alir.
3. Design panelindeki her kontrol draft'i aninda degistirir.
4. `ProfilePreview`, `appearanceDraft` prop'unu `PublicProfileSurface`'a aktarir.
5. Bio, sosyal profiller, link CRUD, switch ve DnD bugunku gibi preview'a canli yansimaya devam eder.
6. Design degisiklikleri icin V1 kaydetme modeli explicit `Save changes` aksiyonudur. Draft preview aninda degisir; DB yalniz `Save changes` ile guncellenir.
7. Save basarili olursa `appearanceSaved = appearanceDraft`, dashboard ve public profile path revalidate edilir.
8. Save basarisiz olursa draft korunur, kullaniciya hata gosterilir; public route etkilenmez.

Autosave alternatifi V2'ye ertelenmeli. Explicit `Save changes`, RLS/validation hatalarini daha okunur yapar ve renk/input denemelerinde gereksiz server action trafigini azaltir.

## 8. Public profile render mantığı

`PublicProfileSurface` ortak presentation component olarak kalir. Yeni appearance modeli bu component'e prop olarak eklenir.

Render kurallari:

- Public route `getPublicProfile()` ile `appearance` alanini da secer.
- Dashboard preview `appearanceDraft` ile render eder; public route DB'deki saved appearance ile render eder.
- `PublicProfileSurface` appearance'i CSS module class'lari ve sabit CSS variable token'lariyla uygular.
- `mode="preview"` yalniz dashboard preview olcegi, inert link davranisi ve CTA'nin span olarak render edilmesi gibi mevcut farklari kontrol eder.
- Gercek public route'ta linkler aktif link sorgusundan gelir, yeni sekme davranisi ve avatar fallback zinciri korunur.
- Sosyal linkler bio altinda kalir ve mevcut yeni sekme davranisi degismez.
- Gecersiz veya eski appearance shape'i default appearance'a dusurulur.

Bu ayrim, gercek public profile route'un veri/RLS davranisini degistirmeden gorunum token'larini eklemeyi saglar.

## 9. Server action, validation, RLS ve migration planı

### Migration

Uygulama turunda Supabase CLI ile yeni migration olusturulmali; bu plan dosyasi migration uretmez.

Planlanan SQL etkisi:

- `public.profiles` tablosuna `appearance jsonb not null default '<default-v1-json>'::jsonb` kolonu ekle.
- Basit check constraint ekle: `jsonb_typeof(appearance) = 'object'`.
- Deep validation SQL'de degil app validator'da yapilsin; PostgreSQL check'i sadece kaba bozulmayi engellesin.
- Mevcut `profiles_owner_update` RLS policy'si owner update icin yeterli modeldir. Uygulama turunda policy'nin hala `USING` ve `WITH CHECK` ile owner'a bagli oldugu dogrulanir.
- Public select policy yayinlanmis profile'lari okumaya devam eder. Public helper yalniz gerekli kolonlari secer.
- Yeni index gerekmez; appearance filtrelenmeyecek.

### Server action

Yeni action onerisi: `updateProfileAppearanceAction`.

Sorumluluklari:

- Auth claims ile user id dogrulama.
- Input'u `normalizeAppearanceInput()` ile allowlist sekle cevirme.
- Unknown key'leri atma veya validation error'a dusme. V1 icin daha guvenli tercih: unknown key varsa error.
- `profiles.update({ appearance })` islemini sadece authenticated owner icin yapma.
- Basarida `/dashboard` ve `/${username}` path'lerini revalidate etme.
- Hata mesajlarini mevcut copy sistemiyle tutarli dondurme.

### Validation

Yeni paket eklenmeyecegi icin validation TypeScript helper'lariyla yapilir.

Onerilen dosya: `lib/profile/appearance.ts`

Icerik:

- `DEFAULT_APPEARANCE`
- enum arrays
- type guard'lar
- `normalizeAppearance(value): ProfileAppearance`
- `validateAppearanceUpdate(value): { success: true; appearance } | { success: false; message }`
- color normalizer

### RLS

RLS modeli degismez:

- Visitors: yayinlanmis profile ve aktif linkleri gorebilir.
- Owners: kendi profile row'unu okuyup guncelleyebilir.
- Action server tarafindan kullanici id'sini auth claims ile dogrular.
- Service role, security definer function veya public write endpoint gerekmez.

## 10. Bileşen/dosya planı

Onerilen yeni/dokunulacak dosyalar:

- `components/dashboard/link-manager.tsx`
  - dashboard mode state'i
  - `appearanceDraft`, `appearanceSaved`, dirty state
  - `ProfilePreview`'a appearance prop'u
- `components/dashboard/dashboard-rail.tsx`
  - Content/Design/Enhance/Settings rail ogelerini daha temiz ayirmak icin opsiyonel extract
- `components/dashboard/design-editor.tsx`
  - Design ekraninin shell'i
  - ic navigasyon ve active tab state'i
- `components/dashboard/design/design-navigation.tsx`
  - Theme/Header/Wallpaper/Text/Buttons/Colors/Stickers/Footer nav
- `components/dashboard/design/theme-panel.tsx`
- `components/dashboard/design/header-panel.tsx`
- `components/dashboard/design/wallpaper-panel.tsx`
- `components/dashboard/design/text-panel.tsx`
- `components/dashboard/design/buttons-panel.tsx`
- `components/dashboard/design/colors-panel.tsx`
- `components/dashboard/design/stickers-panel.tsx`
- `components/dashboard/design/footer-panel.tsx`
- `components/dashboard/design/design-controls.tsx`
  - preset cards, color fields, segmented controls gibi tekrar eden UI
- `components/dashboard/design-editor.module.css`
  - mockup spacing, panel grid, secondary nav, scrollbar uyumu
- `lib/profile/appearance.ts`
  - types, defaults, allowlists, validation
- `app/actions/profile.ts`
  - `updateProfileAppearanceAction`
- `lib/profile/get-current-profile.ts`
  - current profile select listesine `appearance`
- `lib/profile/get-public-profile.ts`
  - public profile select listesine `appearance`
- `components/profile/public-profile-surface.tsx`
  - `appearance` prop'u ve class/token mapping
- `components/profile/public-profile.module.css`
  - appearance variant class'lari ve CSS variable token'lari
- `lib/copy.ts`
  - Design UI copy, save/error messages
- `supabase/migrations/<generated>_add_profile_appearance.sql`
  - uygulama turunda Supabase CLI ile olusturulacak

Dosya sinirlari:

- Link CRUD, Add modal, social modal, Share panel ve link-card control panelleri kendi dosyalarinda kalir.
- `PublicProfileSurface` profile gorunumunun tek kaynagi olmaya devam eder; dashboard preview icin ayri profil tasarimi uretilmez.

## 11. Mobil davranış

Mobilde desktop kilitli scroll sistemi uygulanmaz. Dashboard tek kolon normal sayfa scroll davranisini korur.

Design mobil plan:

- Rail bugunku mobil davranisina uygun kalir veya mevcut rail yapisi korunur.
- Design ic navigasyonu yatay scroll alanina veya compact dropdown'a donusebilir.
- Aktif panel tek kolon olarak render edilir.
- Sag live preview mobilde mevcut dashboard davranisina uygun sekilde editor altinda veya gizlenmis/collapsible olabilir; desktop `%60/%40` grid mobilde zorlanmaz.
- Color input ve preset card gridleri `minmax()` ile dar ekranda tasma yapmaz.
- Inert kontroller mobilde de disabled kalir.

Public profile mobil davranisi:

- Gercek public route mevcut mobile-page hissini korur.
- Appearance token'lari ayni component uzerinden uygulanir.
- QR veya desktop-only alanlar bu Design editor kapsamina girmez.

## 12. V2’ye ertelenecekler

- Image/video wallpaper upload ve storage policy genisletmeleri.
- Header icin guvenli avatar/fallback presetlerinin otesinde gelismis uploaded-media compositing.
- Logo upload ve title yerine logo render'i.
- Stickers icin upload, layer, resize, position editoru.
- Footer linklerini ozellestirme ve yeni legal/report sayfalari.
- Curated/pro tema marketplace'i ve entitlement kontrolu.
- Enhance/AI design onerileri.
- Per-link button style override.
- Scheduled theme veya ziyaretci segmentine gore appearance degisimi.
- Animation, hover scale, parallax veya motion presetleri.
- Arbitrary custom CSS. Guvenlik ve tutarlilik nedeniyle V2 icin de onerilmez.
- Autosave. V1 explicit `Save changes` ile baslamali.

## 13. Uygulama asamalari

1. Data modeli ve validator: `lib/profile/appearance.ts` icinde defaults, enum allowlistleri, color normalizer ve appearance validator yazilir. Supabase migration uygulama turunda CLI ile uretilir; `profiles.appearance` eklenir.
2. Public surface entegrasyonu: `getCurrentProfile()` ve `getPublicProfile()` appearance secer. `PublicProfileSurface` appearance prop'unu alir ve sabit CSS variable/class mapping ile uygular.
3. Dashboard state entegrasyonu: `/dashboard` icinde client-side `content | design` state eklenir. `LinkManager` appearance draft/saved/dirty state'ini tutar ve preview'a draft'i aktarir.
4. Design editor iskeleti: mockuplardaki orta editor layout, ic navigation ve panel hiyerarsisi kurulur. Theme/Header/Wallpaper/Text/Buttons/Colors aktif paneller; Stickers/Footer kontrollu placeholder olarak render edilir.
5. Panel kontrolleri: tum Theme kartlari secilebilir olur; Header `classic`, `hero`, `banner`, `cutout`, `shape` mevcut avatar/fallback ile calisir; renk kontrolleri yalniz `#RRGGBB` yazar; font allowlist Schibsted Grotesk merkezli kalir.
6. Save davranisi: `updateProfileAppearanceAction` explicit `Save changes` ile calisir. Basarida dashboard ve public profile revalidate edilir; hatada draft korunur ve public profile saved appearance'ta kalir.
7. Kontrol turu: dashboard shell scroll davranisi, preview canli state'i, public route saved render'i, RLS owner update modeli ve mobil tasma davranisi dogrulanir.

## Spec self-review

- Eksik karar etiketi veya belirsiz doldurulacak alan kalmadi.
- V1 ve V2 kapsami ayrildi.
- Gercek calisan ayarlar ile inert ayarlar ayrildi.
- Public route veri/RLS davranisi korunacak sekilde planlandi.
- Yeni paket, migration uygulamasi, UI degisikligi, lint, build veya commit bu turda yapilmadi.
