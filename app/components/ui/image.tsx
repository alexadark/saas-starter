import type { ImageProps } from "@unpic/react";
import { Image as UnpicImage } from "@unpic/react";

/**
 * Production-ready image component powered by Unpic.
 * Supports 30+ CDN providers (Cloudinary, Imgix, Vercel, Supabase Storage, etc.)
 * with automatic format selection, responsive sizing, and LCP optimization.
 *
 * Usage:
 *   <Image src="https://res.cloudinary.com/demo/image/upload/sample.jpg" alt="Sample" width={800} height={600} />
 *   <Image src="/images/hero.jpg" alt="Hero" width={1200} height={630} priority />
 *
 * For local static assets, use a plain <img> tag with loading="lazy".
 */
export const Image = (props: ImageProps) => {
	return <UnpicImage {...props} />;
};
