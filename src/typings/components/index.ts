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
    deleteAction: (id: string, label: string) => void;
    editAction: (id: string, label: string) => void;
}

export interface DialogComponentProps {
    handleClose: () => void;
    open: boolean;
    title: string;
    children: React.ReactNode;
}