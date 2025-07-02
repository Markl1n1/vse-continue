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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface ProductDetails {
  name: string;
  image: string;
  price: string;
}

interface CallbackFormProps {
  productId?: string;
  onSuccess?: () => void;
  includeDescription?: boolean;
  productDetails?: ProductDetails | ProductDetails[];
}

const CallbackForm: React.FC<CallbackFormProps> = ({
  productId,
  onSuccess,
  includeDescription = false,
  productDetails,
}) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    phone: z.string().min(5, { message: "Valid phone number required" }),
    description: includeDescription
      ? z.string().optional()
      : z.string().optional().default(""),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const payload = Array.isArray(productDetails)
      ? productDetails.map((item) => ({
          name: data.name,
          phone: data.phone,
          productName: item.name,
          image: item.image,
          price: item.price,
          time: new Date().toLocaleString(),
        }))
      : [
          {
            name: data.name,
            phone: data.phone,
            productName: productDetails?.name || "Unknown",
            image: productDetails?.image || "",
            price: productDetails?.price || "N/A",
            time: new Date().toLocaleString(),
          },
        ];

    try {
      const response = await fetch(
        "https://v1.nocodeapi.com/videosound/google_sheets/AHAZHyeXeJZiRVIw/addRows?tabId=List",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unknown error");
      }

      toast.success(t("callback_success"));
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting form:", error.message);
      toast.error("Submission error: " + error.message);
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
    description: {
      ua: "Напишіть, що вас цікавить або деталі заходу",
      ru: "Напишите, що вас интересует или детали мероприятия",
      en: "Write what are you looking for or event details",
    },
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

        {includeDescription && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {language === "ua"
                    ? "Опис"
                    : language === "ru"
                    ? "Описание"
                    : "Description"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={placeholders.description[language]}
                    className="min-h-[120px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
