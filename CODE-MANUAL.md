# Code Manual - Jaatland E-Commerce Website

**Project:** Jaatland E-Commerce Clothing Website  
**Repository:** https://github.com/Krish-39/jaatland-web  
**Branch:** main  
**Document Version:** 1.0  
**Last Updated:** December 2024

---

## 1. Introduction

This Code Manual provides comprehensive documentation for the Jaatland E-Commerce Clothing Website. It serves as a technical guide for developers, system administrators, and end-users who need to understand, install, configure, and use the Jaatland e-commerce platform.

---

## 2. Required Tools and Applications

### 2.1 Runtime Environment

| Tool | Minimum Version | Purpose |
|------|-----------------|---------|
| **Node.js** | 18.0.0 | JavaScript runtime |
| **npm** | 9.0.0 | Package manager |
| **Git** | 2.0.0 | Version control |

**Installation:**
- Node.js: https://nodejs.org (choose LTS version)
- Git: https://git-scm.com

### 2.2 Code Editor

| Tool | Purpose |
|------|---------|
| **Visual Studio Code** | Primary code editor |
| **VSCode Extensions** | ESLint, Prettier, Tailwind CSS IntelliSense |

### 2.3 Web Browsers for Testing

| Browser | Purpose |
|---------|---------|
| **Google Chrome** | Primary testing browser |
| **Mozilla Firefox** | Cross-browser compatibility |
| **Apple Safari** | macOS/iOS compatibility |
| **Microsoft Edge** | Windows compatibility |

### 2.4 Stripe Account

| Requirement | Purpose | Access |
|-------------|---------|--------|
| **Stripe Account** | Payment processing | https://dashboard.stripe.com |
| **Test Card** | 4242 4242 4242 4242 | Any future date, any CVC |

---

## 3. Installation Guide

### 3.1 Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/Krish-39/jaatland-web.git

# Navigate into the project directory
cd jaatland-web

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main
```

### 3.2 Installing Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3.3 Environment Configuration

Create `.env.local` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

**Stripe Key Setup:**
1. Visit https://dashboard.stripe.com/test/apikeys
2. Copy the Secret Key (starts with `sk_test_`)
3. Paste it into `.env.local`

---

## 4. Running the Application

### 4.1 Development Server

```bash
# Start development server
npm run dev
```

**Access:** http://localhost:3000

### 4.2 Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

### 4.3 Linting and Type Checking

```bash
# Run ESLint
npm run lint

# Run TypeScript check
npx tsc --noEmit
```

---

## 5. Project Structure

```
jaatland-web/
├── public/                          # Static assets
├── src/
│   ├── app/                        # Next.js pages
│   │   ├── admin/page.tsx          # Admin dashboard
│   │   ├── api/create-payment-intent/route.ts  # Stripe API
│   │   ├── checkout/page.tsx       # Checkout page
│   │   ├── orders/page.tsx         # Order history
│   │   ├── product/[id]/page.tsx   # Product detail
│   │   ├── page.tsx                # Homepage
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/ui/              # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   └── lib/                        # Utilities
│       ├── types.ts
│       └── utils.ts
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
└── tsconfig.json                   # TypeScript config
```

---

## 6. System Usage Guide

### 6.1 User Features

**Browsing Products:**
- Navigate to http://localhost:3000
- Click category links (Men, Women, Unisex, Accessories)
- Use search bar to find products

**Filtering:**
- Size: XS, S, M, L, XL, XXL
- Color: Black, White, Blue, Beige, Olive, Maroon
- Price: Slider €0 - €100

**Shopping Cart:**
- Click cart icon in header
- Adjust quantities with +/- buttons
- Cart persists across sessions

**Checkout:**
1. Review cart contents
2. Enter shipping information
3. Complete payment with test card: 4242 4242 4242 4242

**Order History:**
- Log in to account
- Navigate to orders page
- View past orders with status

### 6.2 Admin Features

**Admin Dashboard:** http://localhost:3000/admin

- Total products count
- Total orders count
- Total revenue
- Product management (CRUD)
- Homepage configuration

---

## 7. API Documentation

### 7.1 Create Payment Intent

**Endpoint:** `POST /api/create-payment-intent`

**Request:**
```json
{
  "amount": 104.97
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_0987654321"
}
```

---

## 8. Deployment

### 8.1 Vercel Deployment

1. Push to GitHub: `git push origin main`
2. Connect repository at https://vercel.com
3. Add `STRIPE_SECRET_KEY` environment variable
4. Automatic deployment on push

### 8.2 Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t jaatland-web .
docker run -p 3000:3000 -d jaatland-web
```

---

## 9. Troubleshooting

### Common Issues

**Port 3000 in use:**
```bash
lsof -i :3000
kill -9 <PID>
# or use different port
npm run dev -- -p 3001
```

**npm install fails:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Stripe errors:**
- Verify `STRIPE_SECRET_KEY` is correct
- Ensure key starts with `sk_test_`
- Check Stripe dashboard for errors

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

---

## Appendix: LocalStorage Keys

| Key | Data |
|-----|------|
| `jaatland_cart` | Shopping cart items |
| `jaatland_wishlist` | Wishlist items |
| `jaatland_user` | Current user |
| `jaatland_orders` | Order history |
| `jaatland_products` | Product catalog |
| `jaatland_theme` | Theme preference |

---

**Document Information:**
- Repository: https://github.com/Krish-39/jaatland-web
- Branch: main
- Last Updated: December 2024

