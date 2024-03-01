import React, { useState } from 'react';
import './BurgerMenu.css'; // You'll create this CSS file next
import { Menu } from 'react-feather';


const BurgerMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="burger-menu">
            <button onClick={() => setIsOpen(!isOpen)} className="burger-button">
                <Menu size={20}/>
            </button>
            {isOpen && (
                <div className="menu-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default BurgerMenu;