import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { Helmet } from "react-helmet-async";
import { ShoppingCart, Play } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onPlayVideo?: (videoUrl: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onPlayVideo }) => {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getProcessedImageUrl = () => {
    if (imageError) {
      return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&crop=entropy&auto=format&q=80";
    }

    try {
      new URL(product.imageUrl);
      if (product.imageUrl.includes("?")) {
        return product.imageUrl;
      }
      return `${product.imageUrl}?w=600&h=400&fit=crop&crop=entropy&auto=format&q=80`;
    } catch (e) {
      return "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop&crop=entropy&auto=format&q=80";
    }
  };

  const imageUrl = getProcessedImageUrl();
  const productName = product.name[language];
  const productDescription = product.description[language];

  return (
    <article>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: productName,
            image: imageUrl,
            description: productDescription,
            offers: {
              "@type": "Offer",
              priceCurrency: "UAH",
              price: product.price.toString(),
              availability: "https://schema.org/InStock",
              url: `https://videosoundevents.com/categories/${product.category}`,
            },
          })}
        </script>
      </Helmet>
      <Card className="overflow-hidden product-card-hover border border-gray-200 hover:border-secondary">
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={`${productName} - Equipment Rental in Ukraine`}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2 h-14">{productName}</CardTitle>
          <CardDescription className="text-lg font-bold text-primary">
            {product.price} {t("price_per_day")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 h-18 text-sm">{productDescription}</p>
        </CardContent>
        <CardFooter className="pt-2 flex gap-2">
          <Button
            className="w-full"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t("add_to_cart")}
          </Button>
          {product.videoUrl && (
            <Button
              className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground"
              onClick={() => onPlayVideo?.(product.videoUrl)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </article>
  );
};

export default ProductCard;