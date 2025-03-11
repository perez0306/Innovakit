export interface RowTableI {
    label: string;
    key: string;
}

export interface TableComponentI {
    key: string;
    data: RowTableI[];
}

export interface TableComponentProps {
    header: RowTableI[];
    rows: TableComponentI[];
    indexKey: number;
    deleteAction: (id: string, label: string, index: number) => void;
    editAction: (id: string, label: string, index: number) => void;
}

export interface DialogComponentProps {
    handleClose: () => void;
    open: boolean;
    title: string;
    children: React.ReactNode;
}

export interface ProductFormI {
    id: string;
    nombre: string;
    lineaNegocio: string;
    clasificacion: string;
    valorVenta: string;
    otrosCostos: number;
    insumos: string[];
    vendedor: number;
    financiero: number;
}