"use client";
import { VendorI, TableStateI } from "@/typings/store";
import { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
    vendor: TableStateI[];
    suplies: TableStateI[];
    setSuplies: React.Dispatch<React.SetStateAction<TableStateI[]>>;
    setVendor: React.Dispatch<React.SetStateAction<TableStateI[]>>;
}

const initialState: AppState = {
    suplies: [],
    vendor: [],
    setSuplies: () => {},
    setVendor: () => {},
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [vendor, setVendor] = useState<TableStateI[]>([]);
    const [suplies, setSuplies] = useState<TableStateI[]>([]);

    return (
        <AppContext.Provider value={{ vendor, setVendor, setSuplies, suplies }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);