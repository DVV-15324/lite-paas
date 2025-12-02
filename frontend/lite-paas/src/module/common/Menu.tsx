
{/*https://mui.com/material-ui/react-menu/ */ }
import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useHookAuth } from '../auth/hooks/authHooks';
import { useNavigate } from 'react-router-dom';

interface MunuMUIProps {
    children: React.ReactNode
}

export default function MenuMUI({ children }: MunuMUIProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { handleOut } = useHookAuth();
    const navigate = useNavigate();
    return (
        <div className='hidden xl:flex'>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                {children}
            </Button>
            <Menu
                disableScrollLock
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
            >
                <MenuItem onClick={() => { navigate("my_post") }}>Quản lý bài viết </MenuItem>
                <MenuItem onClick={() => { navigate("profile") }}>Cá nhân</MenuItem>
                <MenuItem onClick={handleOut}>Logout</MenuItem>
            </Menu>
        </div>
    );
}
