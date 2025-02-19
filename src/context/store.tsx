"use client";
import { VendorI, TableStateI, CategoryI } from "@/typings/store";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
    vendor: TableStateI[];
    suplies: TableStateI[];
    product: TableStateI[];
    category: CategoryI[];
    setSuplies: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setVendor: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setProduct: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setCategory: React.Dispatch<React.SetStateAction<CategoryI[]>>;
}

const initialState: AppState = {
    suplies: [],
    vendor: [],
    product: [],
    category: [],
    setSuplies: () => {},
    setVendor: () => {},
    setProduct: () => {},
    setCategory: () => {},
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [vendor, setVendor] = useState<TableStateI[]>([]);
    const [suplies, setSuplies] = useState<TableStateI[]>([]);
    const [product, setProduct] = useState<TableStateI[]>([]);
    const [category, setCategory] = useState<CategoryI[]>([]);
    return (
        <AppContext.Provider value={{ vendor, setVendor, setSuplies, suplies, product, setProduct, category, setCategory }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);