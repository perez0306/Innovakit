"use client";
import { useState, JSX } from 'react';
import styles from './index.module.css';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();

    const onClose = () => {
        setOpen(false);
    }

    const Icon: { [key: number]: JSX.Element } = {
        0: <PeopleAltIcon />,
        1: <InventoryIcon />,
        2: <HandymanIcon />,
        3: <AttachMoneyIcon />
    }

    const redirect: { [key: number]: string } = {
        0: '/proveedores',
        1: '/insumos',
        2: '/productos',
        3: '/costos'
    }

    const onRedirect = (index: number) => {
        router.push(redirect[index]);
    }

    return (
        <>
            <button className={styles.button} onClick={() => setOpen(prev => !prev)}><MenuIcon className={styles.menuIcon} /></button>
            <Drawer onClose={onClose} open={open}>
                <div style={{ background: '#FFF', width: '300px', height: '100vh' }}>
                    <List>
                        {['Proveedores', 'Insumos', 'Productos', 'Costos'].map((text, index) => (
                            <ListItem key={text} disablePadding onClick={() => onRedirect(index)}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        {Icon[index]}
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </div>
            </Drawer>
        </>
    );
}

export default Sidebar;