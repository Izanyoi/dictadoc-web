import React, { useState, useRef, useEffect } from 'react';

interface EditableBoxProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
}

export function EditableBox({ value, onSave, className = '' } : EditableBoxProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
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
        <div className={`inline-block ${className}`}>
            {isEditing 
                ? (<input
                    ref={inputRef}
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={className}
                />) 
                : (<span
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
                >
                    {value}
                </span>)
            }
        </div>
    );
};