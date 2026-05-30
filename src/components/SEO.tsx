import { useEffect } from "react";

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: "website" | "product";
    productData?: {
        name: string;
        price: number;
        currency?: string;
        image?: string;
        category?: string;
        availability?: string;
    };
}

const SEO = ({ 
    title, 
    description, 
    keywords, 
    canonicalUrl = "https://candlesbydreamers.com", 
    ogImage = "https://candlesbydreamers.com/logo.png", 
    ogType = "website",
    productData
}: SEOProps) => {
    useEffect(() => {
        // Update Document Title
        document.title = `${title} | Candles by Dreamers`;

        // Helper function to update or create meta tags
        const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
            const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement("meta");
                if (isProperty) {
                    element.setAttribute("property", nameOrProperty);
                } else {
                    element.setAttribute("name", nameOrProperty);
                }
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };

        // Helper function to update link tags
        const updateLink = (rel: string, href: string) => {
            let element = document.querySelector(`link[rel="${rel}"]`);
            if (!element) {
                element = document.createElement("link");
                element.setAttribute("rel", rel);
                document.head.appendChild(element);
            }
            element.setAttribute("href", href);
        };

        // Core Meta tags
        updateMeta("description", description);
        if (keywords) {
            updateMeta("keywords", keywords);
        } else {
            updateMeta("keywords", "candles by dreamers, scented candles, premium candles, hand poured candles, aromatherapy candles, soy candles, luxury home fragrance, dreamers candles");
        }
        updateMeta("robots", "index, follow");

        // Canonical URL
        updateLink("canonical", canonicalUrl);

        // Open Graph
        updateMeta("og:title", `${title} | Candles by Dreamers`, true);
        updateMeta("og:description", description, true);
        updateMeta("og:type", ogType === "product" ? "product" : "website", true);
        updateMeta("og:url", canonicalUrl, true);
        updateMeta("og:image", ogImage, true);
        updateMeta("og:site_name", "Candles by Dreamers", true);
        updateMeta("og:locale", "en_IN", true);

        // Product-specific OG tags
        if (ogType === "product" && productData) {
            updateMeta("product:price:amount", String(productData.price), true);
            updateMeta("product:price:currency", productData.currency || "INR", true);
            if (productData.category) {
                updateMeta("product:category", productData.category, true);
            }
        }

        // Twitter Cards
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", `${title} | Candles by Dreamers`);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", ogImage);

        // JSON-LD Structured Data for Products
        const existingLd = document.querySelector('script[data-seo-ld]');
        if (existingLd) existingLd.remove();

        if (ogType === "product" && productData) {
            const ldJson = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": productData.name,
                "description": description,
                "image": productData.image || ogImage,
                "category": productData.category || "Scented Candles",
                "brand": {
                    "@type": "Brand",
                    "name": "Candles by Dreamers"
                },
                "offers": {
                    "@type": "Offer",
                    "url": canonicalUrl,
                    "priceCurrency": productData.currency || "INR",
                    "price": productData.price,
                    "availability": `https://schema.org/${productData.availability || "InStock"}`,
                    "seller": {
                        "@type": "Organization",
                        "name": "Candles by Dreamers"
                    }
                }
            };

            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.setAttribute("data-seo-ld", "true");
            script.textContent = JSON.stringify(ldJson);
            document.head.appendChild(script);
        }

        // Cleanup JSON-LD on unmount
        return () => {
            const ld = document.querySelector('script[data-seo-ld]');
            if (ld) ld.remove();
        };
    }, [title, description, keywords, canonicalUrl, ogImage, ogType, productData]);

    return null;
};

export default SEO;
