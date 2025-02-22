"use client";
import { TableStateI, CategoryI, CostI } from "@/typings/store";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
    vendor: TableStateI[];
    suplies: TableStateI[];
    product: TableStateI[];
    category: CategoryI[];
    costs: CostI[];
    categorySelected: string;
    setSuplies: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setVendor: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setProduct: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setCategory: React.Dispatch<React.SetStateAction<CategoryI[]>>;
    setCosts: React.Dispatch<React.SetStateAction<CostI[]>>;
    setCategorySelected: React.Dispatch<React.SetStateAction<string>>;
}

const initialState: AppState = {
    suplies: [],
    vendor: [],
    product: [],
    category: [],
    costs: [],
    categorySelected: '1',
    setSuplies: () => {},
    setVendor: () => {},
    setProduct: () => {},
    setCategory: () => {},
    setCosts: () => {},
    setCategorySelected: () => {},
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [vendor, setVendor] = useState<TableStateI[]>([]);
    const [suplies, setSuplies] = useState<TableStateI[]>([]);
    const [product, setProduct] = useState<TableStateI[]>([]);
    const [category, setCategory] = useState<CategoryI[]>([]);
    const [costs, setCosts] = useState<CostI[]>([]);
    const [categorySelected, setCategorySelected] = useState<string>('1');
    return (
        <AppContext.Provider value={{ vendor, setVendor, setSuplies, suplies, product, setProduct, category, setCategory, costs, setCosts, categorySelected, setCategorySelected }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);