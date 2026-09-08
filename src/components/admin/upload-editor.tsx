// src/components/admin/upload-editor.tsx
"use client";
import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import * as Dialog from "@radix-ui/react-dialog";
import { Upload, X } from "lucide-react";
import type { ActionResult, UploadMediaResult } from "@/application/dtos";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MenuImage } from "@/components/menu/menu-image";
import { UPLOAD_ASPECT_RATIO, UPLOAD_MAX_BYTES } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";

type Props = {
  currentMediaId: string | null;
  onUploadComplete: (mediaId: string) => void;
  onRemove: () => void;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadEditor({ currentMediaId, onUploadComplete, onRemove }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(strings.admin.imageTypeUnsupported);
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      toast.error(strings.admin.imageTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(String(reader.result));
      setIsOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCroppedBlob = async (): Promise<
    { blob: Blob; width: number; height: number } | null
  > => {
    if (!imageSrc || !croppedAreaPixels) return null;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", reject);
      img.src = imageSrc;
    });
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve({ blob, width: canvas.width, height: canvas.height });
      }, "image/jpeg", 0.92);
    });
  };

  const handleUpload = async () => {
    const cropped = await getCroppedBlob();
    if (!cropped) return;
    setIsUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append("file", cropped.blob, "crop.jpg");
    formData.append("width", String(cropped.width));
    formData.append("height", String(cropped.height));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress((event.loaded / event.total) * 100);
    };
    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status !== 200) {
        toast.error(strings.admin.imageUploadFailed);
        return;
      }
      const res = JSON.parse(xhr.responseText) as ActionResult<UploadMediaResult>;
      if (res.ok) {
        onUploadComplete(res.data.mediaId);
        setIsOpen(false);
        toast.success(strings.admin.imageUploaded);
        return;
      }
      toast.error(res.error.fa);
    };
    xhr.onerror = () => {
      setIsUploading(false);
      toast.error(strings.admin.imageUploadFailed);
    };
    xhr.send(formData);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="pf-image">{strings.admin.image}</Label>
      <div className="flex items-center gap-4">
        {currentMediaId ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            <MenuImage
              media={{ id: currentMediaId, dominantColor: "#16110b", width: 96, height: 96 }}
              alt={strings.admin.image}
              fill
              sizes="96px"
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label={strings.admin.removeImage}
              className="absolute top-1 end-1 z-10 rounded-full bg-destructive p-1 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4 me-2" />
          {currentMediaId ? strings.admin.replaceImage : strings.admin.uploadImage}
        </Button>
        <input
          id="pf-image"
          type="file"
          ref={fileRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
        />
      </div>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg">
            <Dialog.Title className="mb-4 text-lg font-semibold">
              {strings.admin.cropImage}
            </Dialog.Title>
            <div className="relative h-[400px] w-full bg-black">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={UPLOAD_ASPECT_RATIO}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            {isUploading && (
              <div
                className="mt-4 h-2 w-full rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {strings.admin.cancel}
              </Button>
              <Button onClick={() => void handleUpload()} disabled={isUploading}>
                {isUploading ? strings.admin.uploading : strings.admin.save}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}