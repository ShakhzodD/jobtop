"use client";

import { Camera, MapPin, Save, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jobCategories, type JobCategory } from "@/entities/job/model/types";
import type { CurrentUser } from "@/entities/user/model/types";
import { useUserStore } from "@/entities/user/model/user-store";
import {
  updateProfile,
  uploadProfileAvatar,
} from "@/features/profile/api/update-profile";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CurrentUser;
};

type FormValues = {
  fullName: string;
  birthDate: string;
  district: string;
  experienceYears: string;
  about: string;
  categories: JobCategory[];
};

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "J";
}

export function ProfileEditSheet({ open, onOpenChange, user }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setUser = useUserStore((state) => state.setUser);
  const hasWorkerRole = user.roles.includes("worker");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { control, handleSubmit, register, reset, setValue } =
    useForm<FormValues>({
      defaultValues: {
        fullName: user.fullName,
        birthDate: user.birthDate ?? "",
        district: user.district ?? "",
        experienceYears: user.experienceYears?.toString() ?? "",
        about: user.about ?? "",
        categories: user.workerCategories,
      },
    });
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const fullName = useWatch({ control, name: "fullName" }) ?? user.fullName;

  const updateProfileMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const avatarUrl = avatarFile
        ? await uploadProfileAvatar(avatarFile)
        : undefined;
      return updateProfile({
        fullName: values.fullName,
        avatarUrl,
        ...(hasWorkerRole
          ? {
              birthDate: values.birthDate,
              district: values.district,
              experienceYears: values.experienceYears,
              about: values.about,
              categories: values.categories,
            }
          : {}),
      });
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setAvatarFile(null);
      setPreviewUrl(null);
      setMessage("Profil saqlandi");
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      fullName: user.fullName,
      birthDate: user.birthDate ?? "",
      district: user.district ?? "",
      experienceYears: user.experienceYears?.toString() ?? "",
      about: user.about ?? "",
      categories: user.workerCategories,
    });
  }, [open, reset, user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectAvatar(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Faqat rasm faylini tanlang");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Rasm hajmi 5 MB dan oshmasligi kerak");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage("");
  }

  function toggleCategory(category: JobCategory) {
    setValue(
      "categories",
      selectedCategories.includes(category)
        ? selectedCategories.filter((item) => item !== category)
        : [...selectedCategories, category],
      { shouldDirty: true },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setAvatarFile(null);
      setPreviewUrl(null);
      setMessage("");
    }
    onOpenChange(nextOpen);
  }

  return (
    <Drawer onOpenChange={handleOpenChange} open={open} showSwipeHandle>
      <DrawerContent className="max-h-[calc(100dvh-1rem)]">
        <DrawerHeader className="border-b border-border text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>Profilni tahrirlash</DrawerTitle>
              <DrawerDescription className="mt-1">
                Ism, rasm va ishchi ma’lumotlaringizni yangilang.
              </DrawerDescription>
            </div>
            <Button
              aria-label="Yopish"
              onClick={() => handleOpenChange(false)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X />
            </Button>
          </div>
        </DrawerHeader>
        <form
          className="min-h-0 overflow-y-auto overscroll-contain p-4 pb-7"
          onSubmit={handleSubmit(async (values) => {
            setMessage("");
            if (hasWorkerRole && !values.categories.length) {
              setMessage("Kamida bitta ish turini tanlang");
              return;
            }
            try {
              await updateProfileMutation.mutateAsync(values);
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Profilni saqlab bo‘lmadi",
              );
            }
          })}
        >
          <div className="grid gap-5">
            <div className="flex items-center gap-4">
              <button
                className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-50 text-xl font-bold text-emerald-800 ring-1 ring-emerald-100"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {previewUrl || user.avatarUrl ? (
                  <img
                    alt="Profil rasmi"
                    className="size-full object-cover"
                    src={previewUrl ?? user.avatarUrl ?? ""}
                  />
                ) : (
                  getInitials(fullName)
                )}
                <span className="absolute inset-x-0 bottom-0 grid h-7 place-items-center bg-black/55 text-white">
                  <Camera className="size-3.5" />
                </span>
              </button>
              <div className="min-w-0">
                <p className="font-medium">Profil rasmi</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Rasmni almashtirish uchun bosing. JPG, PNG yoki WebP, 5 MB gacha.
                </p>
                <Button
                  className="mt-2"
                  onClick={() => inputRef.current?.click()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Camera /> Rasm tanlash
                </Button>
              </div>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => selectAvatar(event.target.files?.[0])}
                ref={inputRef}
                type="file"
              />
            </div>
            <label className="grid gap-2 text-sm font-medium">
              <span>Ism-familiya</span>
              <Input
                {...register("fullName", { required: "Ismni kiriting" })}
                maxLength={80}
                placeholder="Ism-familiyangiz"
              />
            </label>
            {hasWorkerRole && (
              <>
                <div className="border-t border-border pt-5">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4 text-emerald-700" />
                    <h3 className="font-semibold">Ishchi ma’lumotlari</h3>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Bu ma’lumotlar ish beruvchi sizni tanlashda ko‘radi.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Tug‘ilgan sana
                    <Input type="date" {...register("birthDate")} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Tajriba (yil)
                    <Input
                      inputMode="numeric"
                      max="60"
                      min="0"
                      placeholder="Masalan, 2"
                      type="number"
                      {...register("experienceYears")}
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> Tuman
                  </span>
                  <Input
                    placeholder="Masalan, Chilonzor"
                    {...register("district")}
                  />
                </label>
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-medium">Sizga mos ish turlari</legend>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Shu turdagi e’lonlar haqida Telegram orqali xabar olasiz.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {jobCategories.map((category) => (
                      <Button
                        className="rounded-full"
                        key={category}
                        onClick={() => toggleCategory(category)}
                        type="button"
                        variant={
                          selectedCategories.includes(category)
                            ? "default"
                            : "outline"
                        }
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </fieldset>
                <label className="grid gap-2 text-sm font-medium">
                  O‘zingiz haqingizda
                  <Textarea
                    maxLength={500}
                    placeholder="Qaysi ishlarda tajribangiz borligini qisqa yozing"
                    rows={4}
                    {...register("about")}
                  />
                </label>
              </>
            )}
            {message && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                {message}
              </p>
            )}
            <Button
              className="h-11 bg-emerald-700 hover:bg-emerald-800"
              disabled={updateProfileMutation.isPending}
              type="submit"
            >
              <Save />
              {updateProfileMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
