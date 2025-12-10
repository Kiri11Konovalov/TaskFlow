import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';
import clsx from 'clsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setIsRendered(true);
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) setIsRendered(false);
    };

    if (!isRendered) return null;

    return createPortal(
        <div
            className={clsx(styles.overlay, { [styles.open]: isOpen, [styles.close]: !isOpen })}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className={styles.backdrop} onClick={onClose} />
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
