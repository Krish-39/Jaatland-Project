-- Product photos were renamed after some databases had already been seeded.
-- Point stored image paths at the new files.
UPDATE "products" SET "images" = array_replace("images", '/products/classic-tee-1.jpg', '/products/crew-neck-t-shirt-1.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/classic-tee-2.jpg', '/products/crew-neck-t-shirt-2.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/heritage-oversized-tee-1.jpg', '/products/relaxed-fit-t-shirt-1.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/nazaare-crop-top-1.jpg', '/products/cropped-top-1.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/desi-flex-hoodie-1.jpg', '/products/pullover-hoodie-1.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/roadrunner-joggers-1.jpg', '/products/cargo-joggers-1.jpg');--> statement-breakpoint
UPDATE "products" SET "images" = array_replace("images", '/products/nakhre-tote-1.jpg', '/products/tote-bag-1.jpg');--> statement-breakpoint
-- Rename the seed products and badges, but only where the admin has not
-- changed them since (the old seed value is still in place).
UPDATE "products" SET "name" = 'Essential Crew-Neck T-Shirt' WHERE "id" = 'p1' AND "name" = 'Classic Tee';--> statement-breakpoint
UPDATE "products" SET "name" = 'Relaxed-Fit T-Shirt' WHERE "id" = 'p2' AND "name" = 'Heritage Oversized Tee';--> statement-breakpoint
UPDATE "products" SET "name" = 'Cropped Short-Sleeve Top' WHERE "id" = 'p3' AND "name" = 'Nazaare Crop Top';--> statement-breakpoint
UPDATE "products" SET "name" = 'Pullover Hoodie' WHERE "id" = 'p4' AND "name" = 'Desi Flex Hoodie';--> statement-breakpoint
UPDATE "products" SET "name" = 'Tapered Cargo Joggers' WHERE "id" = 'p5' AND "name" = 'Roadrunner Joggers';--> statement-breakpoint
UPDATE "products" SET "name" = 'Everyday Tote Bag' WHERE "id" = 'p6' AND "name" = 'Nakhre Tote';--> statement-breakpoint
UPDATE "products" SET "badge" = 'Core Range' WHERE "id" = 'p1' AND "badge" = 'Bestseller';--> statement-breakpoint
UPDATE "products" SET "badge" = 'New Arrival' WHERE "id" = 'p2' AND "badge" = 'New';--> statement-breakpoint
UPDATE "products" SET "badge" = 'Limited Edition' WHERE "id" = 'p4' AND "badge" = 'Limited';--> statement-breakpoint
-- Homepage copy, again only where it still holds the old default text.
UPDATE "homepage_config" SET "hero_title" = 'Considered essentials for everyday wear.' WHERE "id" = 1 AND "hero_title" = 'Jaatland — Land of Premium Wear.';--> statement-breakpoint
UPDATE "homepage_config" SET "hero_subtitle" = 'T-shirts, hoodies, joggers and accessories, designed for comfort and a clean, modern fit.' WHERE "id" = 1 AND "hero_subtitle" = 'Everyday basics and statement pieces built for comfort. Tees, hoodies, joggers and accessories in limited drops.';--> statement-breakpoint
UPDATE "homepage_config" SET "newsletter_title" = 'Subscribe to our newsletter' WHERE "id" = 1 AND "newsletter_title" = 'Join the Jaatland club';--> statement-breakpoint
UPDATE "homepage_config" SET "newsletter_subtitle" = 'Be the first to hear about new collections and news from Jaatland.' WHERE "id" = 1 AND "newsletter_subtitle" = 'Get early access to drops and news from Jaatland.';
