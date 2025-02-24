import { VendorI, TableStateI, SupliesStateI, ProductI, CategoryI, SelectI, SupliesI } from "@/typings/store";

export const getCostFormat = (cost: number) => {
  const date = new Date();
  const format = {
    [date.getFullYear()]: cost,
  };
  return format;
};

export const formatVendor = (vendor: VendorI[]): TableStateI[] => {
  return vendor.map((vendor: VendorI) => {
    return { key: vendor.id, data: [{ label: vendor.nombre, key: vendor.id }] };
  });
};

export const formatSuplies = (vendor: SupliesStateI[]): TableStateI[] => {
  return vendor.map((vendor: SupliesStateI) => {
    return {
      key: vendor.id,
      data: [
        { label: vendor.id, key: vendor.id },
        { label: vendor.descripcion, key: vendor.id },
        { label: vendor.clasificacion, key: vendor.id },
        { label: vendor.proveedor.label, key: vendor.proveedor.value },
        { label: String(vendor.costo), key: vendor.id },
      ],
    };
  });
};

export const formatSelectInsumo = (vendor: TableStateI[]) => {
  return vendor.map((vendor) => {
    return { value: vendor?.key, label: vendor?.data?.[0]?.label };
  });
};

export const formatSelectInsumoOptions = (vendor: SupliesI[]) => {
  return vendor.map((vendor: SupliesI) => {
    return { value: vendor?.id + '-' + vendor?.proveedor, label: vendor?.id + ' - ' + vendor?.proveedor };
  });
};

export const formatProduct = (product: ProductI[]): TableStateI[] => {
  return product.map((product: ProductI) => {
    return {
      key: product.id,
      data: [
        { label: String(product.id), key: product.id },
        { label: product.nombre, key: product.id },
        { label: String(product.venta), key: product.id },
        { label: String(product.category), key: product.id },
        { label: String(product.linea_negocio), key: product.id }
      ]
    };
  });
};

export const formatCategory = (category: CategoryI[]): SelectI[] => {
  return category.map((category: CategoryI) => {
    return { value: category.id, label: category.child + ' - ' + category.parent }
  });
};

export const percentageMargen = (total: number, cost: number) => {
  if (cost === 0) return 0;
  return ((total / cost) * 100).toFixed(2)
}

export const getCostValue = (cost: { [key: number]: number }) => {
  const date = new Date();
  return Number(cost?.[date.getFullYear()]) ?? 0;
};

export const getCostValueLastYear = (cost: { [key: number]: number }) => {
  const date = new Date();
  const lastYear = date.getFullYear() - 1;
  return Number(cost?.[lastYear]) ?? 0;
};

export const formatMiles = (value: number) => {
  return Number(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getIncrementoCosto = (costos: { [key: number]: number }) => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const lastYear = currentYear - 1;

  const currentCost = costos?.[currentYear] ?? 0;
  const lastYearCost = costos?.[lastYear] ?? 0;

  if (lastYearCost === 0) return null;

  const incremento = ((currentCost - lastYearCost) / lastYearCost) * 100;
  return incremento.toFixed(2);
};

export const categoryProduct = {
  "1": "General",
  "2": "Marquesina Cafe",
  "3": "Marquesina Cacao",
}

export const getCategoryProduct = (category: string) => {
  return categoryProduct[category as keyof typeof categoryProduct];
}