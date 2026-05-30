import { useEffect } from "react";

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: "website" | "product";
}

const SEO = ({ 
    title, 
    description, 
    keywords, 
    canonicalUrl = "https://candlesbydreamers.com", 
    ogImage = "https://candlesbydreamers.com/logo.png", 
    ogType = "website" 
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
        updateMeta("og:type", ogType, true);
        updateMeta("og:url", canonicalUrl, true);
        updateMeta("og:image", ogImage, true);
        updateMeta("og:site_name", "Candles by Dreamers", true);

        // Twitter Cards
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", `${title} | Candles by Dreamers`);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", ogImage);
    }, [title, description, keywords, canonicalUrl, ogImage, ogType]);

    return null;
};

export default SEO;
