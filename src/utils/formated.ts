import { VendorI, TableStateI, SupliesI } from "@/typings/store";

export const getCostFormat = (cost: number) => {
  const date = new Date();
  const format = {
    [date.getFullYear()]: cost,
  };
  return [format];
};

export const formatVendor = (vendor: VendorI[]): TableStateI[] => {
  return vendor.map((vendor: VendorI) => {
    return { key: vendor.id, data: [{ label: vendor.nombre, key: vendor.id }] };
  });
};

export const formatSuplies = (vendor: SupliesI[]): TableStateI[] => {
  return vendor.map((vendor: SupliesI) => {
    return {
      key: vendor.id,
      data: [
        { label: vendor.id, key: vendor.id },
        { label: vendor.descripcion, key: vendor.id },
        { label: vendor.clasificacion, key: vendor.id },
        { label: vendor.proveedor, key: vendor.id },
        { label: vendor.costo, key: vendor.costo },
      ],
    };
  });
};

export const formatSelectInsumo = (vendor: TableStateI[]) => {
  return vendor.map((vendor) => {
    return { value: vendor?.key, label: vendor?.data?.[0]?.label };
  });
};
