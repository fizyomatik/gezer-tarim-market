export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const isUploadPath = (path: string) => /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path) && isUuid(path.split('.')[0]);

export function validateImages(files: { size: number; type: string }[]) {
  if (files.length > 10) return 'En fazla 10 görsel yükleyebilirsiniz.';
  if (files.some((file) => !IMAGE_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES)) {
    return 'Görseller JPG, PNG veya WEBP biçiminde ve en fazla 10 MB olmalıdır.';
  }
  return '';
}

export function validateProduct(form: FormData) {
  const name = String(form.get('name') ?? '').trim();
  const brand = String(form.get('brand') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const category = String(form.get('categorySlug') ?? '').trim();
  const priceText = String(form.get('price') ?? '').trim();
  const price = Number(priceText);
  const images = form.getAll('imagePath').map(String);
  if (!name || name.length > 200 || brand.length > 120 || description.length > 10000 || !category ||
      !/^\d+(\.\d{1,2})?$/.test(priceText) || !Number.isFinite(price) || price < 0 || price > 9999999999.99 ||
      images.length > 10 || images.some((path) => !isUploadPath(path)) || new Set(images).size !== images.length) {
    return { error: 'Ürün bilgilerini, fiyatı ve görselleri kontrol edin.' } as const;
  }
  return { value: { product_name: name, product_brand: brand, product_description: description,
    product_price: price, category_slug: category, image_paths: images,
    featured: form.get('featured') === 'on', active: form.get('active') === 'on' } } as const;
}

export function isInternalLink(value: string) {
  return value.startsWith('/') && !value.startsWith('//') && !/[\\\s\u0000-\u001f]/.test(value);
}
