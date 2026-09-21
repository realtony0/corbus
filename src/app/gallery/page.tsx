import { getGallery } from "@/lib/siteContent";
import GalleryView from "./GalleryView";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  return <GalleryView photos={await getGallery()} />;
}
