# Link Management Dashboard Design

## Kapsam

Bu özellik yalnız kullanıcının dashboard içinde kendi linklerini eklemesini, düzenlemesini, aktif/pasif yapmasını, silmesini ve sürükle-bırak ile sıralamasını kapsar. Mevcut `public.links` tablosu ve `public.reorder_links(bigint[])` fonksiyonu kullanılacaktır. Yeni migration, API route, public profil sayfası, avatar, tema, analiz, ayarlar, ödeme veya localization eklenmeyecektir.

## Dashboard Düzeni

Dashboard mevcut profil başlığını ve logout düğmesini korur. Alt çalışma alanı geniş ekranda dengeli bir içerik sütunu, mobilde tek sütun olarak görünür.

- Üst bölümde title, URL ve ilk aktiflik değerini alan küçük bir `Add link` formu bulunur.
- Alt bölüm linkleri `position ASC, id ASC` sırasıyla gösterir.
- Boş listede merkezi English empty-state metni görünür.
- Her kart title, URL, aktiflik kontrolü, edit, delete ve ayrı bir drag handle içerir.
- Edit formu kart içinde açılır.
- Delete ilk tıklamada kart içi `Delete` ve `Cancel` onay adımlarını gösterir.

## Server ve Client Sınırları

Dashboard Server Component önce mevcut profil korumasını çalıştırır, sonra doğrulanmış kullanıcının linklerini `position ASC, id ASC` olarak okur ve `initialLinks` prop'u ile `LinkManager` Client Component'ına verir.

`LinkManager` güncel listeyi, son güvenli sıralamayı, açık edit/delete durumunu ve mutation durumlarını yönetir. `SortableLinkList` DndContext ve sensörleri kapsar. `LinkCard` tek kartı ve yalnız drag handle'a bağlanan sortable attributes/listeners alanını içerir. `LinkForm` create ve edit için ortak alan davranışını paylaşır.

Server Action'lar `app/actions/links.ts` içinde create, update, toggle, delete ve reorder olarak ayrılır. Her action kendi Supabase server client'ını oluşturur, `auth.getClaims()` çağırır ve geçerli string `claims.sub` olmadan işlem yapmaz.

## Dosya Yapısı

- `app/actions/links.ts`
- `components/dashboard/link-manager.tsx`
- `components/dashboard/link-form.tsx`
- `components/dashboard/sortable-link-list.tsx`
- `components/dashboard/link-card.tsx`
- `lib/links/get-current-links.ts`
- `lib/links/validation.ts`
- `lib/links/types.ts`
- `lib/copy.ts` güncellemesi
- `app/dashboard/page.tsx` güncellemesi
- `docs/superpowers/specs/2026-06-21-link-management-dashboard-design.md`

Yalnız gerekli sürükle-bırak paketleri kesin sürümlerle eklenir: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.

## Link Okuma

`lib/links/get-current-links.ts` yalnız server tarafında çalışır. Kimliği tarayıcıdan almaz; kendi client'ı ile `getClaims()` yapar ve doğrulanmış `sub` üzerinden yalnız gerekli link alanlarını `position ASC, id ASC` sırasıyla döndürür. Sorgu hatası boş liste sayılmaz ve ham hata istemciye taşınmaz.

## Doğrulama

Title trim sonrası boş olamaz ve en fazla 120 karakter olabilir. URL en fazla 2048 karakter olabilir; whitespace veya control karakteri içeremez. Şu biçimler kabul edilir:

- `http://` veya `https://` ve `://` sonrasında boş olmayan hedef
- `mailto:` ve sonrasında boş olmayan hedef
- `tel:` ve sonrasında boş olmayan hedef

Form yalnız native `type="url"` davranışına dayanmaz; ortak browser ve Server Action doğrulaması kullanır. Veritabanı constraint'leri son doğruluk kaynağıdır.

## Tipli Action Sonuçları

Tüm action sonuçları discriminated union olarak tanımlanır. Başarı sonucu güncel link veya güncel link listesi gibi güvenli, açıkça seçilmiş alanları taşır. Hata sonucu yalnız sabit English hata kodu/metni taşır. Supabase veya Postgres `message`, `details`, `hint` alanları istemciye gönderilmez.

Her action browser'dan gelen ID'ye tek başına güvenmez. Update, toggle ve delete sorguları hem link ID hem doğrulanmış `user_id` ile sınırlandırılır; mevcut RLS ikinci güvenlik katmanı olarak kalır.

## Create Akışı

Create action tarayıcıdan `user_id` alanı kabul etmez. Yalnız action içindeki doğrulanmış `claims.sub`, insert payload içindeki `user_id` olarak kullanılır. Action doğrulanmış `title`, `url` ve `is_active` değerlerini gönderir; `position` gönderilmez. Mevcut before-insert trigger advisory lock altında sonraki position değerini atar. Action eklenen kaydı gerekli alanlarla geri döndürür ve dashboard verisini `revalidatePath("/dashboard")` ile yenilenebilir hale getirir. Client başarı sonucundaki kaydı listeye position ve id sırasına göre ekler.

## Update Akışı

Update action yalnız `title`, `url` ve `is_active` alanlarını kabul eder. `position`, `user_id` veya başka sahiplik alanı input sözleşmesinde bulunmaz. Başarıda güncel kayıt döner ve dashboard revalidate edilir. Client yalnız dönen doğrulanmış kaydı mevcut ID üzerine uygular.

## Toggle Akışı

Toggle action yalnız hedef ID ve istenen boolean aktiflik değerini kabul eder. Sorgu ID ve doğrulanmış kullanıcıyla sınırlandırılır. Başarıda güncel kayıt döner, dashboard revalidate edilir ve Client bu kaydı state'e uygular.

## Delete Akışı

Delete action kart içi açık onaydan sonra çağrılır. Sorgu ID ve doğrulanmış kullanıcıyla sınırlandırılır. Başarıda silinen ID döner, dashboard revalidate edilir ve Client kaydı listeden çıkarır. Kalan kayıtların `position` alanları ayrıca değiştirilmez veya sıkıştırılmaz; liste mevcut `position ASC, id ASC` düzeninde kalır. Gerekli normalizasyon daha sonraki başarılı reorder ile oluşur.

## Reorder ve Dnd-kit

`SortableLinkList` şu sensörleri kullanır:

- `PointerSensor`
- `TouchSensor`
- `KeyboardSensor` ve `sortableKeyboardCoordinates`

`SortableContext` ile `verticalListSortingStrategy` kullanılır. Kartın tamamı değil, ayrı handle sürüklenebilir. `prefers-reduced-motion` etkinse gereksiz transform transition'ları azaltılır veya kapatılır.

`onDragEnd` yalnız `LinkManager` içindeki, doğrulanmış kullanıcı için sunucudan sahiplik filtresiyle gelmiş ve o anda ekranda bulunan mevcut link ID'lerinden yeni dizi üretir. Başka kaynaktan ID eklenmez. Dizi `arrayMove` ile UI'a hemen uygulanır. Son güvenli sıra ayrı tutulur ve tipli reorder Server Action'a yalnız bu tam ID listesi gönderilir. Action kendi `getClaims()` kontrolünü yapar ve mevcut `reorder_links(bigint[])` RPC'sini çağırır. Normal update ile `position` değiştirilmez.

## Sıralama Durumu ve Hata Kurtarma

Reorder sürerken drag, edit, toggle ve delete devre dışıdır; `Saving...` görünür. Başarılı RPC sonrası iyimser sıra geçici olarak son güvenli sıra olur ve dashboard `revalidatePath("/dashboard")` ile yenilenir. Bu geçici kabul, sonraki `router.refresh()` veya yeni `initialLinks` prop'u ile gelen otoriter sunucu listesiyle uzlaşmayı durdurmaz.

RPC'nin eksik, tekrarlı, yabancı veya güncel olmayan listeyi reddetmesi halinde action ham hata döndürmez. Sunucudaki güncel liste tekrar `position ASC, id ASC` okunur ve mümkünse hata sonucuna otoriter liste eklenir. Client bu listeye döner ve güvenli English hata gösterir.

Ağ veya transport hatasında Client önce son güvenli sırayı gösterir, güvenli English hata mesajı yayınlar ve `router.refresh()` ile dashboard Server Component verisini yeniden yükler. Kullanıcı doğrulanamayan iyimser sırada bırakılmaz.

## `initialLinks` Uzlaştırması

`LinkManager`, `initialLinks` değişimini körlemesine state'e yazmaz. Her mutation ve reorder için ortak bir busy/pending göstergesi bulunur.

- İşlem yoksa yeni `initialLinks` yerel listeyi ve son güvenli sırayı günceller.
- İşlem sürüyorsa gelen prop bir pending-server-snapshot ref/state alanında bekletilir; iyimser state ezilmez.
- İşlem tamamlanınca önce action'ın tipli başarı sonucu uygulanır, ardından bekleyen daha yeni server snapshot varsa onunla uzlaştırılır.
- Reorder hatasında otoriter action listesi veya refresh ile gelen snapshot önceliklidir.

Bu yaklaşım create, update, toggle, delete ve reorder sırasında RSC refresh yarışlarının yanlış state yazmasını engeller.

## Mutation Kilitleri

Reorder sırasında drag, edit, toggle ve delete kesin olarak kilitlidir. Diğer mutation'lar da aynı link üzerinde çift gönderimi önlemek için ilgili form/kart seviyesinde pending olur. Tipli action sonucu gelmeden yerel state kalıcı başarı kabul edilmez.

## Güvenli English Mesajlar

Yeni kullanıcı metinleri `lib/copy.ts` içinde English tutulur. Örnek durumlar:

- `Saving...`
- `Your link was added.`
- `We could not save the new order. The latest saved order has been restored.`
- `We could not update this link. Please try again.`
- `We could not delete this link. Please try again.`

Ham Supabase veya Postgres hata metni gösterilmez.

## Eşzamanlılık

Mevcut `reorder_links` fonksiyonu kullanıcı bazlı advisory lock, row lock, tam ID kümesi doğrulaması, deferred unique constraint ve atomik update kullanır. Aynı kullanıcının eşzamanlı reorder çağrıları serialize edilir. Başka sekmede create/delete/reorder nedeniyle ID kümesi değişirse eski istek tamamen reddedilir; Client sunucudaki güncel listeyi yeniden yükler.

## Manuel Test Senaryoları

1. Boş liste ve empty state.
2. İlk ve sonraki linklerin position göndermeden eklenmesi.
3. Geçerli `http`, `https`, `mailto`, `tel` değerleri.
4. Boş title, 120 karakter üzeri title, boşluk/control karakterli veya desteklenmeyen URL.
5. Title/URL edit ve aktiflik güncellemesi.
6. Toggle işlemi ve başarısızlık mesajı.
7. Delete onayının `Delete` ve `Cancel` davranışı.
8. Delete sonrası position alanlarının sıkıştırılmaması.
9. Fare, dokunmatik ve klavye ile sıralama; klavye koordinat davranışı.
10. Drag handle dışındaki kart alanının sürükleme başlatmaması.
11. `prefers-reduced-motion` ile azaltılmış animasyon.
12. Reorder sırasında diğer işlemlerin kilitlenmesi ve `Saving...` görünmesi.
13. RPC hatasında son güvenli/otoriter sıraya dönüş.
14. Ağ kesintisinde rollback ve server refresh.
15. İki sekmede eşzamanlı create/delete/reorder.
16. Başka kullanıcıya ait ID ile update/toggle/delete/reorder reddi.
17. Mutation sırasında gelen `initialLinks` prop'unun iyimser state'i ezmemesi ve işlem sonrası uzlaşması.

## Doğrulama ve Commit

Uygulama sonunda yalnız `npm run lint` ve `npm run build` çalıştırılır. İkisi de geçtikten sonra Git durumu incelenir. Yalnız link yönetimiyle ilgili yeni/değişen dosyalar, gerekli üç dnd-kit paket değişikliği ve bu tasarım notu stage edilerek şu mesajla commit edilir:

`feat: add link management dashboard`

`.env.local`, secret değerler, generated local dosyalar ve alakasız staged değişiklikler commit edilmez.
