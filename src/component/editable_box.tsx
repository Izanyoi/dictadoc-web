import { useState, useRef, useEffect } from 'react';

import '../styles/editable_box.css';


interface EditableProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
}

export function EditableBox({ value, onSave, className = '' } : EditableProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing) {
            textareaRef.current?.focus();
            autoResize();
        }
    }, [isEditing]);

    // Critical for transcript switching
    useEffect(() => {
        setTempValue(value);
    }, [value]);

    const handleSave = () => {
        if (tempValue !== value) {
            onSave(tempValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className={className}>
            {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={tempValue}
                    onChange={(e) => {
                        setTempValue(e.target.value);
                        autoResize();
                    }}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`EditableBox Editing ${className}`}
                    rows={1}
                    style={{ resize: 'none', overflow: 'hidden' }}
                />
            ) : (
                <span
                    onClick={() => setIsEditing(true)}
                    className={`EditableBox ${className}`}
                >
                    {value}
                </span>
            )}
        </div>
    );
};

export function EditableInput({ value, onSave, className = '' } : EditableProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Critical for transcript switching
    useEffect(() => {
        setTempValue(value);
    }, [value]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (tempValue !== value) {
            onSave(tempValue.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    };

    return (
        <div className={className}>
            {isEditing ? (
                <input
                    ref={inputRef}
                    value={tempValue}
                    onChange={(e) => {setTempValue(e.target.value);}}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`EditableBox Editing ${className}`}
                />
            ) : (
                <span
                    onClick={() => setIsEditing(true)}
                    className={`EditableBox ${className}`}
                >
                    {value}
                </span>
            )}
        </div>
    );
};