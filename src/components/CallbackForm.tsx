import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CallbackFormProps {
  productId?: string;
  onSuccess?: () => void;
  cart?: CartItem[];
}

const CallbackForm: React.FC<CallbackFormProps> = ({
  productId,
  onSuccess,
  cart = [],
}) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    phone: z.string().min(5, { message: "Valid phone number required" }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // Determine if this is a contact request (no cart or empty cart)
    const isContactMode = !cart || cart.length === 0;

    // Payload construction
    const payload = {
      order_id: isContactMode
        ? `1000100${Math.floor(Date.now() / 1000) % 10000}`.padStart(7, "0") // Simple 7-digit ID for contact
        : `1000100${Math.floor(Date.now() / 1000) % 10000}`.padStart(7, "0"), // Same logic for orders
      name: data.name,
      phone: data.phone,
      ...(isContactMode
        ? {}
        : {
            product_names: Object.entries(
              cart.reduce((acc, item) => {
                const existing = acc[item.name] || { count: 0, image: item.image };
                return {
                  ...acc,
                  [item.name]: {
                    count: existing.count + item.quantity,
                    image: item.image,
                  },
                };
              }, {} as Record<string, { count: number; image: string }>)
            )
              .map(([name, { count }]) => (count > 1 ? `${count} x ${name}` : name))
              .join(", ") || "No products",
            prices: Object.values(
              cart.reduce((acc, item) => {
                const existing = acc[item.name] || { totalPrice: 0 };
                return {
                  ...acc,
                  [item.name]: {
                    totalPrice: existing.totalPrice + item.price * item.quantity,
                  },
                };
              }, {} as Record<string, { totalPrice: number }>)
            )
              .map(({ totalPrice }) => totalPrice.toFixed(2))
              .join(", ") || "0.00",
            image: cart.length > 0 ? cart[0].image : "",
          }),
      created_at: new Date().toISOString(),
    };

    try {
      // Submit to Google Sheet via /api/submit
      console.log("Calling /api/submit with payload:", payload);
      const sheetResponse = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([payload]),
      });

      console.log("Google Sheet response status:", sheetResponse.status);
      const sheetResult = await sheetResponse.json();

      if (!sheetResponse.ok) {
        console.error("Google Sheet submission failed:", sheetResult);
        throw new Error(
          sheetResult.message || `HTTP error! Status: ${sheetResponse.status}`,
        );
      }

      // Call /api/send-email with adjusted payload
      const emailPayload = {
        name: data.name,
        phone: data.phone,
        ...(isContactMode
          ? {}
          : {
              productName: payload.product_names,
              price: payload.prices,
              time: payload.created_at,
              image: payload.image,
            }),
      };

      console.log("Calling /api/send-email with payload:", emailPayload);
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error("Email submission failed:", emailResult);
        throw new Error(
          emailResult.message || `HTTP error! Status: ${emailResponse.status}`,
        );
      }

      toast.success(t("callback_success"));
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting form:", error.message, error.stack);
      toast.error(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholders = {
    name: {
      ua: "Ім'я",
      ru: "Имя",
      en: "Name",
    },
    phone: "+380950001111",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("your_name")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={placeholders.name[language]} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("your_phone")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={placeholders.phone} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {t("send_request")}
            </span>
          ) : (
            t("send_request")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CallbackForm;