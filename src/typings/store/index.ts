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
    costo: number;
}

export interface TableStateI {
    key: string;
    data: RowTableI[];
}

export interface TableComponentI {
    key: string;
    data: RowTableI[];
}