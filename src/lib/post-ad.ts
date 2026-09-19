export const POST_STEPS = [
  { title: "Category", hint: "Pick a category and title" },
  { title: "Details", hint: "Item-specific info" },
  { title: "Price", hint: "Rate and condition" },
  { title: "Photos", hint: "Photos, location and terms" },
  { title: "Publish", hint: "Featured ad and submit" },
] as const;

export const RENT_OPTIONS = [
  { value: "rent/hour", label: "Per hour" },
  { value: "rent/day", label: "Per day" },
  { value: "rent/week", label: "Per week" },
  { value: "rent/month", label: "Per month" },
  { value: "rent", label: "Rent" },
  { value: "fixed", label: "Fixed" },
  { value: "sale", label: "Sale" },
] as const;

export const FALLBACK_CONDITION = ["new", "like new", "good", "fair", "used"];
export const FALLBACK_CLOTH_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free size"];
export const FALLBACK_FUEL = ["petrol", "diesel", "CNG", "electric", "hybrid"];
export const FALLBACK_TRANSMISSION = ["manual", "automatic"];
export const FALLBACK_FURNISHED = ["furnished", "semi-furnished", "unfurnished"];
export const DELIVERY_OPTIONS = ["delivery", "pickup"];
export const UTILITY_OPTIONS = ["water", "electricity", "gas"];
export const PET_OPTIONS = ["pets allowed"];

export type CatKey = "vehicle" | "electronic" | "furniture" | "equipment" | "property" | "cloth" | "service" | string;

export function normalizeCatName(raw?: string | null): CatKey {
  const n = (raw || "").toLowerCase().trim();
  if (n.includes("vehicle") || n.includes("car") || n.includes("bike")) return "vehicle";
  if (n.includes("electronic")) return "electronic";
  if (n.includes("furniture")) return "furniture";
  if (n.includes("equipment")) return "equipment";
  if (n.includes("propert")) return "property";
  if (n.includes("cloth") || n.includes("apparel") || n.includes("fashion")) return "cloth";
  if (n.includes("service")) return "service";
  return n;
}

export function asNamedList(payload: unknown): Array<{ id: string; name: string }> {
  const root = payload as { data?: unknown; content?: unknown } | unknown[];
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((root as { data?: unknown }).data)
      ? (root as { data: unknown[] }).data
      : Array.isArray((root as { content?: unknown }).content)
        ? ((root as { content: unknown[] }).content)
        : [];
  return list
    .map((item) => {
      const row = item as { id?: string | number; name?: string };
      if (!row?.id || !row?.name) return null;
      return { id: String(row.id), name: String(row.name) };
    })
    .filter((row): row is { id: string; name: string } => Boolean(row));
}

export function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

export async function compressImage(file: File, max = 1600, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    bitmap.close();
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type PostAdValues = {
  catId: string;
  catName: string;
  subId: string;
  name: string;
  price: string;
  rent: string;
  desc: string;
  contact: string;
  address: string;
  lat: number;
  lng: number;
  availabilityDate: string;
  deposits: string;
  documents: string;
  additional: string;
  safety: string;
  terms: string;
  condition: string;
  featured: boolean;
  delivery: string[];
  utilities: string[];
  pets: string[];
  vehicleBrand: string;
  modelYear: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  electronicType: string;
  electronicBrand: string;
  screenSize: string;
  storage: string;
  camera: string;
  connectivity: string;
  operatingSystem: string;
  equipmentType: string;
  equipmentBrand: string;
  powerSource: string;
  weight: string;
  dimensions: string;
  furnitureType: string;
  furnitureBrand: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  furnished: string;
  serviceType: string;
  clothType: string;
  clothSize: string;
  clothBrand: string;
};

export function emptyPostAdValues(seed?: { address?: string; lat?: number; lng?: number; contact?: string }): PostAdValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    catId: "",
    catName: "",
    subId: "",
    name: "",
    price: "",
    rent: "rent/day",
    desc: "",
    contact: seed?.contact || "",
    address: seed?.address || "",
    lat: seed?.lat || 28.6139,
    lng: seed?.lng || 77.209,
    availabilityDate: today,
    deposits: "",
    documents: "",
    additional: "",
    safety: "",
    terms: "",
    condition: "",
    featured: false,
    delivery: [],
    utilities: [],
    pets: [],
    vehicleBrand: "",
    modelYear: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    electronicType: "",
    electronicBrand: "",
    screenSize: "",
    storage: "",
    camera: "",
    connectivity: "",
    operatingSystem: "",
    equipmentType: "",
    equipmentBrand: "",
    powerSource: "",
    weight: "",
    dimensions: "",
    furnitureType: "",
    furnitureBrand: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    furnished: "",
    serviceType: "",
    clothType: "",
    clothSize: "",
    clothBrand: "",
  };
}

export function appendCategoryFields(form: FormData, values: PostAdValues) {
  const cat = values.catName;
  if (!cat) return;
  form.append("cat_name", cat);
  form.append("location", values.address);
  form.append("availability_date", values.availabilityDate);
  form.append("contact_info", values.contact);
  form.append("deposits", values.deposits);
  form.append("doc_required", values.documents);
  form.append("additional_info", values.additional);
  form.append("t_and_c", values.terms);

  if (cat === "property") {
    form.append("property_type", values.propertyType);
    form.append("bedrooms", values.bedrooms);
    form.append("bathrooms", values.bathrooms);
    form.append("square_footage", values.squareFootage);
    form.append("furnished", values.furnished);
    form.append("utilities", JSON.stringify(values.utilities));
    form.append("pets", JSON.stringify(values.pets));
    return;
  }

  form.append("delivery_pickup", JSON.stringify(values.delivery));

  if (cat === "vehicle") {
    form.append("vehicle_brand", values.vehicleBrand);
    form.append("model_year", values.modelYear);
    form.append("mileage", values.mileage);
    form.append("fuel_type", values.fuelType);
    form.append("transmission", values.transmission);
    form.append("condition", values.condition);
    form.append("safety", values.safety);
  }
  if (cat === "service") {
    form.append("service_type", values.serviceType);
    form.append("safety", values.safety);
  }
  if (cat === "equipment") {
    form.append("equipment_type", values.equipmentType);
    form.append("equipment_brand", values.equipmentBrand);
    form.append("condition", values.condition);
    form.append("power_source", values.powerSource);
    form.append("weight", values.weight);
    form.append("dimensions", values.dimensions);
    form.append("safety", values.safety);
  }
  if (cat === "furniture") {
    form.append("furniture_type", values.furnitureType);
    form.append("furniture_brand", values.furnitureBrand);
    form.append("condition", values.condition);
  }
  if (cat === "electronic") {
    form.append("electronic_type", values.electronicType);
    form.append("electronic_brand", values.electronicBrand);
    form.append("model_year", values.modelYear);
    form.append("condition", values.condition);
    form.append("operating_system", values.operatingSystem);
    form.append("screen_size", values.screenSize);
    form.append("storage_capacity", values.storage);
    form.append("camera_resolution", values.camera);
    form.append("connectivity", values.connectivity);
  }
  if (cat === "cloth") {
    form.append("cloth_type", values.clothType);
    form.append("cloth_size", values.clothSize);
    form.append("cloth_brand", values.clothBrand);
    form.append("condition", values.condition);
  }
}
