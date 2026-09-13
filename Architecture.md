Gezer Tarım Market — Software Architecture
1. Project Goal
Gezer Tarım Market is a small-to-medium agricultural retail website.

The system should support two main user types:

Customer
Administrator
The public website will allow customers to:

Browse agricultural products
Search/filter products
View product details
Contact the company through WhatsApp
Request machine repair/service
Create an account
Upload photos/videos when creating a service request
View their previous service requests
Eventually place orders, if online sales are enabled
The administrator will be able to:

Manage products
Manage categories
Upload product images
Manage customers
View/manage service requests
View uploaded photos/videos
Update service request status
Manage homepage slider images
Manage basic website content
The important design principle is:

Keep the system simple. Don't build an enterprise system for a local agricultural business.

2. High-Level Architecture
The system will use a monolithic full-stack Next.js application with Supabase as the managed backend.

                         INTERNET
                            │
                            ▼
                  ┌────────────────────┐
                  │    NEXT.JS APP     │
                  │                    │
                  │  Public Website    │
                  │  Customer Area     │
                  │  Admin Panel       │
                  │  Server/API Logic  │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │      SUPABASE      │
                  │                    │
                  │ ┌────────────────┐ │
                  │ │ PostgreSQL DB  │ │
                  │ ├────────────────┤ │
                  │ │ Authentication │ │
                  │ ├────────────────┤ │
                  │ │ Storage        │ │
                  │ └────────────────┘ │
                  └────────────────────┘

So we don't need:

Node backend
Express
MongoDB
Separate authentication server
Separate file server
Separate REST API server

at least not for this project.

That's a major reason I like this architecture.

3. Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Lucide React

Why Next.js?
Next.js gives us:

React
Routing
Server Components
Server-side rendering
Static rendering
API/server functionality
Image optimization
Good SEO
Easy deployment
So instead of building:

React
+
React Router
+
Express
+
API
+
etc.

we can start with:

Next.js

and keep the architecture relatively small.

4. Backend
We're going to use:

Supabase

Supabase provides:

PostgreSQL
Authentication
Storage
Row Level Security

This means we don't need to build authentication and file storage ourselves.

5. Database Architecture
The database will be PostgreSQL.

The initial schema could look like this:

profiles
    │
    └──────────────┐
                   │
categories         │
    │              │
    ▼              │
products            │
    │              │
    │              │
    ▼              │
product_images      │
                   │
                   │
service_requests ◄─┘
    │
    ▼
service_media

Let's break this down.

6. Users / Profiles
Supabase Auth handles authentication.

We should not store passwords ourselves.

Supabase handles:

email
password
session
authentication

We can have our own profiles table:

profiles
------------------------
id
full_name
phone
role
created_at
updated_at

Example:

id: UUID
full_name: "Ahmet Yılmaz"
phone: "+90..."
role: "customer"

Possible roles:

customer
admin

We don't need a complicated role system.

7. Products
Main product table:

products
-----------------------------
id
category_id
name
slug
description
brand
price
stock
is_active
created_at
updated_at

Example:

id: ...
category_id: ...
name: "Akülü Budama Makası"
slug: "akulu-budama-makasi"
description: "..."
brand: "..."
price: 4250
stock: 10
is_active: true

Why slug?
Instead of:

/products/1234

we can have:

/products/akulu-budama-makasi

which is better for SEO and much nicer for users.

8. Categories
Categories:

categories
----------------
id
name
slug
description
image_url
sort_order
is_active

Our initial categories:

Tohum
Gübre
Zirai İlaç
Tarım Aletleri
Peyzaj

We could also have:

Servis & Tamir

but I would not make this a product category.

Service is a separate business function.

9. Product Images
Products can have multiple images.

Therefore:

products
    │
    │ 1:N
    ▼
product_images

Table:

product_images
-------------------------
id
product_id
storage_path
alt_text
sort_order
created_at

For example:

Akülü Budama Makası
       │
       ├── image-1.jpg
       ├── image-2.jpg
       └── image-3.jpg

This is better than putting:

image1
image2
image3
image4

directly into the products table.

10. Storage Architecture
Supabase Storage will handle files.

We can create buckets such as:

product-images
service-media
site-media

Product images
product-images/
    products/
        {product_id}/
            image1.jpg
            image2.jpg

Service photos/videos
service-media/
    requests/
        {service_request_id}/
            photo1.jpg
            video1.mp4

Website images
site-media/
    hero/
        hero1.jpg
        hero2.jpg

    banners/
        banner1.jpg

This keeps storage organized.

11. Service / Repair System
This is one of the important features of this website.

Customer can say:

"My agricultural machine has a problem."

They create:

service_request

Table:

service_requests
--------------------------------
id
user_id
machine_type
machine_brand
description
phone
status
admin_note
created_at
updated_at

Possible statuses:

pending
reviewing
contacted
in_repair
completed
cancelled

Example:

Customer:
Ahmet

Machine:
Motorlu testere

Brand:
Stihl

Problem:
Motor çalışıyor ama zincir dönmüyor.

Status:
pending

12. Service Photos and Videos
A customer should be able to upload:

photo
photo
video

So:

service_requests
       │
       │ 1:N
       ▼
service_media

Table:

service_media
-------------------------
id
service_request_id
file_path
file_type
created_at

Example:

service_request
       │
       ├── photo.jpg
       ├── photo2.jpg
       └── video.mp4

This is much cleaner than storing binary files inside PostgreSQL.

Database stores metadata.

Supabase Storage stores actual files.

13. Customer Flow
The customer experience would look like:

                    WEBSITE
                       │
           ┌───────────┴───────────┐
           │                       │
        Products              Service
           │                       │
           ▼                       ▼
      Product Detail        Login/Register
                                   │
                                   ▼
                           Service Request
                                   │
                          ┌────────┼────────┐
                          │        │        │
                       Machine  Problem  Media
                          │        │        │
                          └────────┼────────┘
                                   ▼
                              Submit
                                   │
                                   ▼
                              Database
                                   │
                                   ▼
                                Admin

14. Customer Panel
Customer dashboard:

/account

Possible structure:

/account
├── page.tsx
├── profile/
├── service-requests/
│   ├── page.tsx
│   └── [id]/
└── settings/

The customer could see:

Merhaba Ahmet 👋

Hesabım

────────────────────────────

Servis Taleplerim

#1024
Motorlu Tırpan
Durum: İnceleniyor

#1021
Çapa Makinesi
Durum: Tamamlandı

We don't need to overcomplicate the customer dashboard.

15. Admin Panel
Admin area:

/admin

Possible structure:

/admin
├── page.tsx
├── products/
├── categories/
├── service-requests/
├── customers/
├── media/
└── settings/

Dashboard:

ADMIN DASHBOARD

────────────────────────────────────

Products             128
Customers            436
Pending Services       7
Completed Services   182

────────────────────────────────────

Recent Service Requests

#1024  Motorlu Tırpan       Pending
#1023  Çapa Makinesi        Repair
#1022  İlaçlama Makinesi    Completed

Again, simple is better.

16. Admin Product Flow
Admin clicks:

Ürünler

then:

+ Yeni Ürün

Form:

Ürün adı
Kategori
Marka
Fiyat
Stok
Açıklama

[ Fotoğraf yükle ]

[ Kaydet ]

The process:

Admin
 │
 ▼
Product Form
 │
 ├── Upload image
 │        │
 │        ▼
 │   Supabase Storage
 │
 └── Save product
          │
          ▼
      PostgreSQL

Then the public website automatically sees the new product.

17. Homepage Architecture
The homepage shouldn't contain all the data directly in code.

Eventually:

Homepage
    │
    ├── Hero Slider
    │
    ├── Categories
    │
    ├── Featured Products
    │
    ├── Service Section
    │
    └── Contact / WhatsApp

The dynamic parts will come from Supabase.

For example:

categories
      ↓
Homepage
      ↓
Category Cards

and:

products
      ↓
Homepage
      ↓
Featured Products

18. Hero Slider
Instead of hardcoding:

const slides = [...]

forever, eventually we'll have:

site_banners
--------------------
id
title
description
image_url
button_text
button_url
sort_order
is_active

Then admin can do:

Admin
 ↓
Homepage Banners
 ↓
Upload image
 ↓
Enter title
 ↓
Save

And the homepage automatically changes.

19. WhatsApp
WhatsApp doesn't need a complicated backend.

We'll simply have a configured company number:

WHATSAPP_NUMBER

and generate:

https://wa.me/...

For example:

Ürün hakkında bilgi almak istiyorum.

Ürün:
Akülü Budama Makası

could become a pre-filled WhatsApp message.

This is much cheaper and simpler than building an internal chat system.

20. Routing Architecture
Next.js App Router:

src/app/

├── page.tsx
│
├── products/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── service/
│   └── page.tsx
│
├── about/
│   └── page.tsx
│
├── contact/
│   └── page.tsx
│
├── login/
│   └── page.tsx
│
├── register/
│   └── page.tsx
│
├── account/
│   ├── page.tsx
│   └── service-requests/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
└── admin/
    ├── page.tsx
    ├── products/
    ├── categories/
    ├── service-requests/
    ├── customers/
    └── banners/

This is enough.

We don't need dozens of microservices.

21. Component Architecture
Reusable components:

src/components/

├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── MobileMenu.tsx
│
├── home/
│   ├── HeroSlider.tsx
│   ├── CategoryGrid.tsx
│   ├── FeaturedProducts.tsx
│   └── ServiceSection.tsx
│
├── products/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductFilters.tsx
│   └── ProductGallery.tsx
│
├── service/
│   ├── ServiceForm.tsx
│   ├── MediaUploader.tsx
│   └── ServiceStatus.tsx
│
├── admin/
│   ├── AdminSidebar.tsx
│   ├── ProductForm.tsx
│   ├── ProductTable.tsx
│   └── ServiceTable.tsx
│
└── ui/
    ├── Button.tsx
    ├── Modal.tsx
    ├── Input.tsx
    └── ...

We shouldn't create these all right now.

We'll create them when they're needed.

22. Data Flow
One of the most important architectural decisions:

Public product page
Browser
   │
   ▼
Next.js
   │
   ▼
Supabase
   │
   ▼
PostgreSQL
   │
   ▼
Product data
   │
   ▼
Next.js
   │
   ▼
Browser

Service request
Customer
   │
   ▼
Service Form
   │
   ├──────────────► Supabase Storage
   │                  │
   │                  └── Photos/Videos
   │
   └──────────────► PostgreSQL
                       │
                       └── Service Request

Admin
Admin
 │
 ▼
Admin Panel
 │
 ├── Products ──────► PostgreSQL
 │
 ├── Images ────────► Storage
 │
 ├── Services ──────► PostgreSQL
 │
 └── Banners ───────► PostgreSQL + Storage

23. Security Architecture
This part is important.

We should never trust the frontend.

For example, hiding the admin button doesn't make someone an admin.

We need:

Authentication
       +
Authorization
       +
Row Level Security

Supabase RLS will enforce database access.

For example:

Customer
Can:

READ active products
READ categories
CREATE own service requests
READ own service requests
UPDATE own profile

Cannot:

DELETE products
EDIT other customers
READ other customers' service requests

Admin
Can:

CRUD products
CRUD categories
READ customers
READ service requests
UPDATE service requests
MANAGE banners

This distinction will be implemented at the database/security layer, not just in React.

24. File Upload Security
We also shouldn't allow:

.exe
.sh
.php
etc.

through the upload system.

We'll restrict uploads to appropriate MIME types such as:

image/jpeg
image/png
image/webp
video/mp4

and impose file-size limits.

For example:

Images: 5–10 MB
Videos: 50–100 MB

The exact limits can be adjusted based on the hosting/storage plan.

25. SEO Architecture
Each product should eventually have metadata:

title
description
slug

For example:

/products/akulu-budama-makasi

Metadata:

Title:
Akülü Budama Makası | Gezer Tarım Market

Description:
Profesyonel akülü budama makası...

We can also add:

sitemap
robots.txt
Open Graph metadata
structured data

later.

For a local business, this is worth doing.

26. Performance
We don't want to make everything a client-side component.

Default:

Server Component

Use "use client" only where we actually need browser interaction.

For example:

Server
Product list
Product detail
Categories
SEO metadata

Client
Slider
Mobile menu
Filters
Upload UI
Interactive forms
Admin dashboard interactions

This keeps the application lighter.

27. Deployment Architecture
Eventually:

                         DOMAIN
                  gezer....com.tr
                          │
                          ▼
                     Vercel
                          │
                          ▼
                    Next.js App
                          │
                          ▼
                     Supabase
              ┌───────────┼───────────┐
              │           │           │
          PostgreSQL     Auth       Storage

Potentially:

Domain          → ~$10-30/year depending on TLD/registrar
Vercel          → Free initially
Supabase        → Free initially
GitHub          → Free

So the initial software infrastructure can be very cheap.

The domain is likely to be the first unavoidable recurring cost.

28. Git Architecture
We'll absolutely use Git from the beginning.

Repository:

gezer-tarim-market

Branches could be:

main
develop

For a project this size, you can even keep it simple:

main

and make meaningful commits:

initial nextjs project

create homepage navbar

add hero section

add product cards

add supabase integration

add authentication

add admin product management

add service request system

Don't over-engineer Git either.

29. Environment Variables
Secrets should never be committed to Git.

We'll eventually have:

.env.local

Something like:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Potential server-only secrets:

SUPABASE_SERVICE_ROLE_KEY=...

The service role key is especially sensitive.

Never expose it to the browser.

And:

.env.local

must be in .gitignore.

30. What We Are NOT Building
This is just as important.

We're not building:

Microservices
Kubernetes
Redis
Kafka
GraphQL
Separate Express backend
Separate authentication server
Separate media server
Complex payment infrastructure
Real-time chat
Complex recommendation engine

Not because they're bad technologies.

Because they're unnecessary for:

Gezer Tarım Market

The goal is:

simple, professional, maintainable and cheap.

31. Final Architecture
So the final architecture is approximately:

                           USER
                            │
                            ▼
                    ┌───────────────┐
                    │    Next.js    │
                    │               │
                    │ ┌───────────┐ │
                    │ │ Public    │ │
                    │ │ Website   │ │
                    │ └───────────┘ │
                    │               │
                    │ ┌───────────┐ │
                    │ │ Customer  │ │
                    │ │ Panel     │ │
                    │ └───────────┘ │
                    │               │
                    │ ┌───────────┐ │
                    │ │ Admin     │ │
                    │ │ Panel     │ │
                    │ └───────────┘ │
                    └───────┬───────┘
                            │
                     Server / Data
                            │
                            ▼
                    ┌───────────────┐
                    │   Supabase    │
                    │               │
                    │ PostgreSQL    │
                    │ Authentication│
                    │ Storage       │
                    │ RLS           │
                    └───────┬───────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
             Products     Users      Services
                │                       │
                ▼                       ▼
          Product Images         Photos / Videos

And the technology stack is:

Frontend
────────
Next.js
React
TypeScript
Tailwind CSS
Lucide

Backend
───────
Next.js Server
Supabase

Database
────────
PostgreSQL

Authentication
──────────────
Supabase Auth

File Storage
────────────
Supabase Storage

Hosting
───────
Vercel

Version Control
───────────────
Git + GitHub

Development order
This is the order I'd follow:

PHASE 1
✓ Next.js project
→ Homepage UI
→ Responsive design
→ Hero slider
→ Categories
→ Product cards
→ Service section
→ WhatsApp

PHASE 2
→ Products page
→ Product detail
→ Search
→ Category filtering

PHASE 3
→ Supabase
→ Database schema
→ Product data
→ Categories
→ Storage

PHASE 4
→ Authentication
→ Customer registration/login
→ Customer dashboard

PHASE 5
→ Service request system
→ Photo/video upload
→ Service status

PHASE 6
→ Admin authentication
→ Admin dashboard
→ Product CRUD
→ Category CRUD
→ Banner management
→ Service management

PHASE 7
→ SEO
→ Performance
→ Security audit
→ Deployment
→ Domain

One architectural decision I'd make now: don't build the customer shopping cart/order/payment system until we know that Gezer Tarım Market actually wants to sell products online. The site can initially function as a catalog + WhatsApp + service-request platform, which is much cheaper and considerably simpler. If they later want e-commerce, we can add cart → order → payment without throwing away the existing architecture.