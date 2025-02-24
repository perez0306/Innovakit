import { RowTableI } from "../components";

export interface VendorI {
  id: string;
  nombre: string;
}

export interface SupliesI {
  id: string;
  proveedor: string;
  descripcion: string;
  clasificacion: string;
  costos: { [key: number]: number };
}

export interface ProductI {
  costo_otros: string;
  id: string;
  insumo: string[];
  linea_negocio: string;
  nombre: string;
  venta: string;
  category?: string;
  categoria: string;
}

export interface SupliesStateI {
    id: string;
    proveedor: {label: string, value: string};
    descripcion: string;
    clasificacion: string;
    costo: string;
  }

export interface TableStateI {
  key: string;
  data: RowTableI[];
}

export interface TableComponentI {
  key: string;
  data: RowTableI[];
}

export interface SelectI {
  value: string;
  label: string;
}

export interface CategoryI {
  id: string;
  nombre: string;
  child: string;
  parent: string;
}

export interface CostI {
  id: string;
  nombre: string;
  valor: number;
}
