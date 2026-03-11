# 🛒 Alado Shop — Website Planning Questions
> **Project:** Algerian E-Commerce Platform | COD | AI + Supabase
> Use this document to define every detail before development begins.

---

## 1. 🏪 General Business & Branding

1. What is the **tagline** or slogan for Alado Shop?
2. What **language(s)** should the website support? (Arabic only / French only / Both / + English?)
3. Should Arabic be **right-to-left (RTL)** layout by default?
4. What are your **brand colors**? (e.g., specific hex codes, or general palette — gold, green, red?)
5. Do you have a **logo** already? If not, do you want one generated/designed?
6. What **tone** should the website have? (Professional / Casual / Luxury / Youth-oriented?)
7. Who is your **target audience**? (Age range, gender, location within Algeria?)
8. Do you want a **splash/loading screen** on first visit?
9. Should the website have a **"Made in Algeria" or patriotic** visual theme?
10. Do you want an **animated hero section** on the homepage?

---

## 2. 📦 Products & Catalog

11. What **category/categories** of products does Alado Shop sell? (e.g., fashion, electronics, accessories, cosmetics?)
12. How many **products** do you currently have (or plan to have at launch)?
13. Does each product have **multiple colors**? Multiple sizes? Both?
14. Do you want a **color swatch selector** on product pages (visual color circles)?
15. Should stock levels be **shown to customers** (e.g., "Only 3 left!")? Or kept hidden?
16. Do you want **"Out of Stock"** items to still appear but be disabled/greyed out?
17. Should customers be able to **filter products** by color, size, category, price range?
18. Do you want a **product search bar** with AI-powered suggestions?
19. Should there be a **"New Arrivals"** or **"Best Sellers"** section on the homepage?
20. Do you need **product image galleries** (multiple images per product)?
21. Should there be a **zoom feature** on product images?
22. Do you want **product videos** support?
23. Should products have a **discount/promo price** option (crossed-out old price + new price)?
24. Do you want **bundle deals** or **buy X get Y** promotions?
25. Should there be a **wishlist / favorites** feature for customers?

---

## 3. 🛍️ Shopping Experience & Cart

26. Should customers be able to **add to cart without an account**?
27. Do you want a **slide-out cart drawer** or a dedicated cart page?
28. Should the cart **persist** if the customer closes the browser (saved in local storage / cookies)?
29. Do you want a **"Customers also bought"** or **related products** section?
30. Should there be a **minimum order amount** for free delivery or any discount?
31. Do you want a **promo code / coupon** system?
32. Should quantity in cart have a **maximum limit** per item?
33. Do you want an **express "Buy Now"** button that skips the cart?

---

## 4. 📋 Checkout & Order Form

34. The checkout form needs: Full Name, Phone, Wilaya, Commune, Full Address — is this **all required info**?
35. Should the customer be able to add an **order note / special instructions**?
36. Do you want **real-time phone number validation** (format: 05/06/07 + 8 digits)?
37. Should the **shipping price auto-calculate** based on the selected wilaya?
38. Do you want **home delivery AND bureau delivery** options shown side by side with their prices?
39. Should the commune dropdown be **auto-populated** based on the selected wilaya?
40. Do you want an **order confirmation page** with an order number after submission?
41. Should a **confirmation SMS** be sent to the customer? (requires SMS gateway)
42. Should a **confirmation email** be sent to the customer? (requires email service)
43. Do you want the customer to be able to **track their order** via a link/code?

---

## 5. 🚚 Delivery & Shipping

44. The wilaya data (bureau + home delivery prices per courier) is provided — should the system **automatically pick the cheapest courier** or let the admin choose?
45. Should customers see **which courier** will deliver their order (DHD, ANDERSON, NOEST, YALIDIN, ZR)?
46. Do you want to show **estimated delivery time** per wilaya?
47. Should there be a **"Free delivery"** promotion feature that can be toggled on/off?
48. For **Stop Desk / Bureau delivery**: should customers be able to choose the nearest bureau location?
49. Should delivery costs be **included in the total price shown** to customers, or shown separately?
50. Do you want to be able to **block certain wilayas** temporarily (out of service)?

---

## 6. 🤖 AI Integration

51. What **AI features** do you want? (suggestions below — check all that apply):
    - AI-powered **product search** (natural language: "show me blue dresses under 3000 DZD")
    - AI **chatbot assistant** for customer support
    - AI **product recommendations** based on browsing behavior
    - AI **auto-generate product descriptions** from admin input
    - AI **demand forecasting** (predict which products will sell out)
    - AI **sentiment analysis** on customer feedback/reviews
    - AI **fraud detection** on suspicious orders
    - AI **image background removal** for product photos
52. Should the AI chatbot support **Arabic dialect (Darija)** or only Modern Standard Arabic / French?
53. Do you want AI to **auto-suggest related wilayas** if a product is out of delivery range?
54. Should AI generate **automated WhatsApp/SMS response drafts** for customer inquiries?
55. Do you want an AI **admin dashboard summary** (e.g., "Today you got 12 orders, top product is X")?
56. Which AI provider should be used? (OpenAI / Anthropic Claude / Gemini / Local model?)

---

## 7. 🗄️ Supabase & Database

57. Do you already have a **Supabase account / project** set up?
58. Should customers be required to **create an account** or can they order as a **guest**?
59. If accounts exist, should customers be able to see their **order history**?
60. Do you want **real-time stock updates** (when someone buys, stock drops instantly on all devices)?
61. Should admin changes (new product, price update) **reflect live** without refreshing the page?
62. Do you want **Row Level Security (RLS)** properly set up to protect customer data?
63. Should **order history be stored indefinitely** or archived after a certain period?
64. Do you need **image storage** via Supabase Storage for product photos?
65. Should product **view counts / analytics** be tracked in the database?
66. Do you want **Supabase Edge Functions** for any backend logic (e.g., SMS trigger, spreadsheet export)?

---

## 8. 👨‍💼 Admin Dashboard

67. How many **admin users** will there be? Should there be **roles** (superadmin / staff / viewer)?
68. Should the admin dashboard have its own **subdomain** (e.g., admin.aladoshop.com) or a hidden route?
69. For the **Orders Table**, which columns should be visible by default?
    - Order ID, Date, Customer Name, Phone, Wilaya, Commune, Product, Quantity, Total Price, Status, Courier?
70. What **order statuses** do you need? (e.g., New / Confirmed / Shipped / Delivered / Cancelled / Returned?)
71. Should admins be able to **bulk update** order statuses?
72. Do you want **order filtering** by status, wilaya, date range, courier?
73. Should there be **color-coded status badges** on orders? (e.g., red = new, green = delivered)
74. Do you want **desktop notifications** when a new order arrives?
75. Should admins be able to **add notes to orders** (internal comments not visible to customers)?
76. Do you want a **"Call customer" button** that dials directly from the admin panel?
77. Should admins be able to **edit order details** after submission?
78. Do you want a **product management panel** (add, edit, delete products with image upload)?
79. Should there be a **stock management interface** where admin manually updates quantities?
80. Do you want **low stock alerts** (e.g., notify when a product drops below 5 units)?
81. Should the admin see a **revenue dashboard** with charts (daily / weekly / monthly sales)?
82. Do you want **wilaya-level analytics** (which regions order the most)?
83. Should the admin be able to **toggle product visibility** (show/hide without deleting)?
84. Do you want a **returns / refunds management** section?

---

## 9. 📊 Spreadsheet Export

85. The required export columns are: Full Name, Phone, Wilaya, Commune, Wilaya Code, Product Name, Quantity, Full Price — should the **spreadsheet be auto-generated** daily or on-demand?
86. Should the export be **Excel (.xlsx)** or **CSV** or both?
87. Do you want a **"Export Orders"** button in the admin panel?
88. Should exports be **filterable** before downloading (e.g., export only today's orders / specific wilaya)?
89. Should the export include the **courier name and delivery type** (bureau/home)?
90. Do you want the export formatted and ready for **direct submission to the courier company**?
91. Should exported files be **automatically uploaded** to Google Drive or emailed to you?

---

## 10. 📱 Mobile & Performance

92. Should the website be a **Progressive Web App (PWA)** (installable on phones like an app)?
93. Do you want **push notifications** for customers on their phones?
94. Should there be a **dedicated mobile layout** for the product pages?
95. What is the **target page load speed**? (Very important for conversion rates)
96. Should **lazy loading** be used for product images?
97. Do you want **Google Analytics** or a privacy-friendly alternative (e.g., Plausible) integrated?

---

## 11. 🔒 Security & Legal

98. Should there be a **terms and conditions** page?
99. Do you need a **privacy policy** page?
100. Should the admin login use **2FA (Two-Factor Authentication)**?
101. Should **customer phone numbers** be masked in certain admin views for staff privacy?
102. Do you want **rate limiting** on the order form to prevent spam/bot orders?
103. Should there be a **reCAPTCHA** or honeypot on the checkout form?

---

## 12. 🌐 Tech Stack & Hosting

104. What is your **preferred frontend framework**? (Next.js / Nuxt.js / React / Vue / Other?)
105. Should the website be **statically generated (SSG)** or **server-side rendered (SSR)**?
106. Where should it be **hosted**? (Vercel / Netlify / VPS / Other?)
107. Do you have a **domain name** already? (e.g., aladoshop.dz / aladoshop.com?)
108. Should the site support **HTTPS** with an auto-renewed SSL certificate?
109. Do you want a **staging environment** (test site) separate from the live site?
110. Should the codebase be on **GitHub / GitLab** with version control?

---

## 13. 📣 Marketing & Social

111. Do you want **social media share buttons** on product pages?
112. Should there be **Open Graph / SEO meta tags** for each product (so links look good when shared)?
113. Do you want a **Facebook Pixel** or **TikTok Pixel** for ad tracking?
114. Should there be a **WhatsApp contact button** (floating icon on every page)?
115. Do you want an **Instagram feed** embedded on the website?
116. Should there be a **referral program** (customers share links and earn discounts)?
117. Do you want **product reviews / ratings** from customers?
118. Should there be an **email newsletter** signup?

---

## 14. 🎨 Design & UX Details

119. Do you prefer a **dark mode** option or only light mode?
120. Should the website have **micro-animations** (hover effects, loading skeletons, transitions)?
121. Do you want a **floating "Back to Top"** button?
122. Should there be a **"Recently Viewed"** products section?
123. Do you want a **countdown timer** for flash sales or limited offers?
124. Should product pages have a **size guide popup**?
125. Do you want a **comparison feature** (compare 2-3 products side by side)?
126. Should there be an **FAQ page** or FAQ section on product pages?
127. Do you want a **404 page** with a custom Algerian-themed design?
128. Should there be an **"About Us"** page telling the story of Alado Shop?

---

## 📌 Priority Questions (Answer These First)

> Before anything else, these answers will shape the entire architecture:

- [ ] **Q2** — What languages? (Arabic / French / Both)
- [ ] **Q4** — Brand colors?
- [ ] **Q5** — Do you have a logo?
- [ ] **Q11** — What product category?
- [ ] **Q37** — Show auto-calculated shipping to customer? Yes/No
- [ ] **Q51** — Which AI features do you want?
- [ ] **Q57** — Do you have a Supabase project already?
- [ ] **Q67** — How many admins / roles?
- [ ] **Q104** — Preferred frontend framework?
- [ ] **Q107** — Do you have a domain?

---

*Document prepared for: **Alado Shop** | Version 1.0 | Ready for development planning*
