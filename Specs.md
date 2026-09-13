Gezer Tarım Market — Software Specification v1.0
1. Project Definition
Project name: Gezer Tarım Market

Project type: Agricultural company website + product catalog + service/repair request system.

Primary objective:

Present Gezer Tarım Market professionally online, allow customers to browse products and contact the company, and allow customers to submit machinery repair/service requests with photos/videos.

There first version will not include online payment or a full e-commerce checkout.

2. User Types
There are exactly two authenticated roles:

Customer
A customer can:

Register
Log in
Edit their profile
Browse products
Search products
Filter products by category
View product details
Contact the company through WhatsApp
Create a service/repair request
Upload photos/videos to a service request
View their own service requests
View the status of their requests
Admin
An administrator can:

Log in
View dashboard
Manage products
Manage categories
Manage homepage slider
View customers
View service requests
View uploaded media
Change service-request status
Add internal notes to service requests
3. Public Website
Main navigation:

GEZER TARIM MARKET

Ana Sayfa
Ürünler
  ├── Tohum
  ├── Gübre
  ├── Zirai İlaç
  ├── Tarım Aletleri
  └── Peyzaj
Servis & Tamir
Hakkımızda
İletişim

                    [WhatsApp]

On mobile:

Logo       ☰

4. Homepage
Homepage sections:

┌──────────────────────────────┐
│           HEADER             │
├──────────────────────────────┤
│                              │
│        HERO SLIDER           │
│                              │
│   Tarımın Güvenilir Adresi   │
│                              │
├──────────────────────────────┤
│       KATEGORİLER            │
│                              │
│ Tohum | Gübre | İlaç | ...   │
├──────────────────────────────┤
│                              │
│      ÖNE ÇIKAN ÜRÜNLER       │
│                              │
├──────────────────────────────┤
│                              │
│      SERVİS & TAMİR          │
│                              │
├──────────────────────────────┤
│                              │
│       NEDEN GEZER?           │
│                              │
├──────────────────────────────┤
│                              │
│       İLETİŞİM / WHATSAPP    │
│                              │
├──────────────────────────────┤
│           FOOTER             │
└──────────────────────────────┘

5. Hero Slider
Admin tarafından yönetilebilir.

Each slide:

id
title
subtitle
image
buttonText
buttonUrl
sortOrder
isActive

Example:

Başlık:
Tarım İçin Güvenilir Çözümler

Açıklama:
Tohumdan gübreye, tarım aletlerinden servise...

Buton:
Ürünleri İncele

Requirements:

Desktop responsive
Mobile responsive
Automatic sliding
Previous/next controls
Pagination indicators
Admin can add/delete/edit slides
Admin can activate/deactivate slides
6. Product Categories
Initial categories:

1. Tohum
2. Gübre
3. Zirai İlaç
4. Tarım Aletleri
5. Peyzaj

Each category:

id
name
slug
description
image
sortOrder
isActive

Admin can:

Create
Edit
Delete
Activate/deactivate
Change order
7. Product Catalog
The website will have a product catalog.

Product card:

┌────────────────────┐
│                    │
│      IMAGE         │
│                    │
├────────────────────┤
│ Product Name       │
│ Category           │
│ Brand              │
│                    │
│ [Detay] [WhatsApp] │
└────────────────────┘

Product fields:

id
categoryId
name
slug
brand
description
price
showPrice
stockStatus
isFeatured
isActive
createdAt
updatedAt

Important
I recommend showPrice rather than assuming every product has a public price.

Why?

Agricultural businesses often have products where pricing changes or is better handled through contact.

So we can display:

₺1.250

or:

Fiyat için iletişime geçiniz

depending on the product.

8. Product Images
Each product can have multiple images.

Requirements:

Upload image
Delete image
Set primary image
Reorder images
Supported:

JPG
PNG
WEBP

Recommended maximum:

10 MB / image

9. Product Detail Page
URL:

/products/[slug]

Example:

/products/akulu-budama-makasi

Page:

┌─────────────────────────────────────┐
│                                     │
│ Product Gallery    Product Info     │
│                                     │
│ [IMAGE]             Product Name    │
│ [thumb]             Brand           │
│ [thumb]             Category        │
│ [thumb]                             │
│                     Description     │
│                                     │
│                     Price           │
│                                     │
│                     [WhatsApp]      │
│                                     │
└─────────────────────────────────────┘

WhatsApp button should generate a pre-filled message.

Example:

Merhaba, Akülü Budama Makası hakkında bilgi almak istiyorum.

10. Search
Product search should search:

name
brand
category

Example:

Search: "budama"

Results:

Akülü Budama Makası
Budama Testeresi
Budama Makası

Initially we don't need Elasticsearch or anything complicated.

PostgreSQL search is enough.

11. Product Filtering
Filters:

Category
Brand
Price range
Availability

We can implement only the useful ones initially.

MVP:

Category
Brand

Price filtering can come later if necessary.

12. Service & Repair
This is a core feature.

Page:

/servis

Headline:

Makine Servis & Tamir

Description:

Tarım makineleri ve ekipmanlarınız için bakım, onarım ve servis hizmeti sunuyoruz.

CTA:

[Servis Talebi Oluştur]

13. Service Request Form
Customer must be logged in to submit a service request.

Form:

Makine Türü *
Makine Markası
Model
Telefon *
Açıklama *

Fotoğraf / Video
[Dosya seç]

[Servis Talebi Oluştur]

Example:

Makine Türü:
Motorlu Tırpan

Marka:
Stihl

Model:
FS 55

Problem:
Makine çalışıyor fakat rölantide duruyor.

14. Media Upload
Customer can upload:

Images
Videos

Supported image formats:

JPG
PNG
WEBP

Supported video:

MP4
MOV
WEBM

Initial limits:

Image: 10 MB
Video: 100 MB

We can change these later depending on hosting/storage constraints.

The UI should show upload progress.

15. Service Request Status
Statuses:

Bekliyor
İnceleniyor
Müşteriyle İletişime Geçildi
Tamirde
Tamamlandı
İptal Edildi

Database values should be English/stable:

pending
reviewing
contacted
in_repair
completed
cancelled

UI translates them to Turkish.

16. Customer Dashboard
URL:

/account

Dashboard:

Merhaba, Ahmet

────────────────────────

Profilim

Servis Taleplerim

────────────────────────

#1024
Motorlu Tırpan

Durum:
İnceleniyor

[Detay]

Navigation:

Hesabım
Profilim
Servis Taleplerim
Çıkış Yap

17. Service Request Detail
Customer can see:

Talep #1024

Makine:
Motorlu Tırpan

Marka:
Stihl

Açıklama:
...

Durum:
Tamirde

Gönderilen Fotoğraflar:
[image]
[image]
[video]

Customer cannot change the status.

18. Admin Dashboard
URL:

/admin

Dashboard:

GEZER TARIM MARKET
ADMIN PANEL

┌───────────┐ ┌───────────┐
│ Products  │ │ Customers │
│    128    │ │    436    │
└───────────┘ └───────────┘

┌───────────┐ ┌───────────┐
│ Pending   │ │ Completed │
│ Services  │ │ Services  │
│     7     │ │    182    │
└───────────┘ └───────────┘

Recent service requests:

#1024  Motorlu Tırpan     İnceleniyor
#1023  Çapa Makinesi      Tamirde
#1022  Testere            Tamamlandı

19. Admin Product Management
Admin page:

/admin/products

Features:

List products
Search products
Filter category
Create product
Edit product
Delete product
Activate/deactivate
Mark as featured
Upload images

Table:

Image | Name | Category | Price | Status | Actions

20. Admin Service Management
URL:

/admin/service-requests

Admin can:

View requests
Filter status
Search customer
Open request
View photos
View videos
Change status
Add internal note

Example:

Service #1024

Customer:
Ahmet Yılmaz

Machine:
Motorlu Tırpan

Status:
[ Tamirde ▼ ]

Customer description:
...

Internal note:
Parça bekleniyor.

[Kaydet]

Internal note must not be visible to the customer.

21. Admin Customer Management
URL:

/admin/customers

Admin can see:

Name
Phone
Email
Registration date
Number of service requests

Initially:

View only
No complicated customer management
We don't need admin to manually create customer accounts.

22. Admin Banner Management
URL:

/admin/banners

Admin:

Create banner
Upload image
Edit text
Set button
Change order
Activate/deactivate
Delete

23. WhatsApp Integration
There is no need for WhatsApp API in v1.

We'll use a normal WhatsApp deep link.

Buttons should exist in:

Header
Product cards
Product details
Service page
Contact section
Floating WhatsApp button

The floating button:

                         🟢

on the bottom-right.

On mobile it should be very easy to reach.

24. Contact Page
URL:

/contact

Contains:

Address
Phone
WhatsApp
Email
Working hours
Google Maps

Potentially:

Pazartesi – Cumartesi
08:00 – 18:00

These should eventually be configurable from admin/settings rather than hardcoded.

25. About Page
URL:

/about

Content:

Gezer Tarım Market

Company description

Our services

Our products

Our experience

Photos

For v1, this can be relatively static.

We don't need a CMS for every paragraph.

26. Responsive Design
Mandatory:

Mobile
Tablet
Desktop
Large Desktop

Breakpoints can follow Tailwind defaults.

Primary target:

Mobile first

because agricultural customers may often access the site from mobile devices.

27. Design Requirements
Visual direction:

Modern agricultural business.

Colors:

Primary:
Dark green

Secondary:
Agricultural green

Accent:
Warm yellow/orange

Background:
White / light gray

Text:
Dark charcoal

Avoid:

Too many gradients
Huge animations
Glassmorphism everywhere
Neon colors
Tech-startup appearance

We want:

professional agricultural company, not a software company.

28. Typography
Use a modern sans-serif font.

For example:

Inter

or a similar clean font.

Typography hierarchy:

H1 → 40–56px desktop
H2 → 30–40px
H3 → 20–28px
Body → 16–18px

Mobile sizes should scale down.

29. Animation
Keep animation subtle.

Allowed:

Hero slide
Card hover
Button hover
Fade-in
Mobile menu
Modal

Avoid excessive animations.

The website should feel fast.

30. SEO Requirements
Every important page should have:

title
description
canonical URL
Open Graph metadata

Products:

/products/[slug]

Categories:

/products?category=tohum

Eventually we can create dedicated category routes if SEO becomes important.

Also:

sitemap.xml
robots.txt

31. Accessibility
Basic accessibility requirements:

Semantic HTML
Proper heading hierarchy
alt text for images
Keyboard navigation
Visible focus states
Accessible form labels
Sufficient color contrast
Buttons should have clear labels
This should be built into the components rather than fixed at the end.

32. Security Requirements
Mandatory:

Supabase Auth
Row Level Security
Server-side authorization
Input validation
File type validation
File size validation
Protected admin routes

Critical rule:

A user must never be able to access another customer's service requests by changing an ID in the URL.

For example:

/account/service-requests/123

must verify that request 123 belongs to the logged-in user.

33. Database — MVP
Our initial database can be:

profiles
categories
products
product_images
service_requests
service_media
banners

That's it.

We don't need 30 tables.

Relationships:

profiles
   │
   └────< service_requests
                    │
                    └────< service_media


categories
   │
   └────< products
              │
              └────< product_images


banners

34. API / Server Architecture
We should not immediately create a REST API for everything.

Next.js Server Actions / server-side functions can handle many operations.

For example:

createProduct()
updateProduct()
deleteProduct()

createServiceRequest()
updateServiceStatus()

uploadProductImage()

For operations that genuinely need an HTTP endpoint, we can use:

/app/api/...

This keeps the project simpler.

35. MVP Scope
The first production version is:

Public
Homepage
Hero slider
Categories
Product catalog
Product details
Search
WhatsApp
Service/repair page
Contact
About
Customer
Register
Login
Profile
Service request
Photo/video upload
Request history
Request status
Admin
Login
Dashboard
Product CRUD
Category CRUD
Product images
Banner CRUD
Customer list
Service request management
Photo/video viewing
Status management
36. Explicitly Out of Scope for v1
This is important so the project doesn't grow uncontrollably.

Not in v1:

❌ Online payment
❌ Shopping cart
❌ Order management
❌ Cargo integration
❌ Invoice system
❌ Stock synchronization
❌ WhatsApp Business API
❌ Live chat
❌ Reviews
❌ Product ratings
❌ Advanced analytics
❌ Recommendation engine
❌ Multi-language
❌ Multi-company support

If the company later says:

"We want customers to buy products directly."

then we can define v2 e-commerce specifications separately.

37. Definition of Done
The MVP is considered complete when:

✓ Customer can visit website
✓ Website works on mobile
✓ Customer can browse products
✓ Customer can search products
✓ Customer can view product details
✓ Customer can contact via WhatsApp
✓ Customer can register/login
✓ Customer can submit repair request
✓ Customer can upload photos
✓ Customer can upload videos
✓ Customer can see request status

✓ Admin can login
✓ Admin can manage products
✓ Admin can upload product images
✓ Admin can manage categories
✓ Admin can manage homepage slider
✓ Admin can see customers
✓ Admin can see service requests
✓ Admin can see uploaded media
✓ Admin can change service status

✓ RLS/security is configured
✓ Production build succeeds
✓ Responsive design works
✓ SEO basics implemented
✓ Production deployment works

38. Development Milestones
I'd split our actual coding into these milestones:

M0 — Project Foundation
    Next.js
    TypeScript
    Tailwind
    ESLint
    Git

M1 — Visual Website
    Navbar
    Homepage
    Hero
    Categories
    Products UI
    Service UI
    Footer
    WhatsApp

M2 — Product System
    Supabase
    Database
    Products
    Categories
    Images

M3 — Authentication
    Register
    Login
    Logout
    Profiles
    Protected routes

M4 — Customer Panel
    Dashboard
    Service requests
    Uploads
    Request history

M5 — Admin Panel
    Dashboard
    Products
    Categories
    Banners
    Customers
    Service requests

M6 — Production
    Security
    RLS
    SEO
    Performance
    Deployment

This is the spec I'd freeze as v1.0.

The next thing I would do is not start coding random components. We should first define the exact PostgreSQL/Supabase database schema and RLS policies, because that becomes the foundation for M2–M5. Once that is fixed, we can build the UI against a known data model instead of redesigning it halfway through