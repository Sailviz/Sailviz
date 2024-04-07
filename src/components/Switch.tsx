import React from 'react';

const Switch = ({ isOn, handleToggle, onColour, id }: { isOn: boolean, handleToggle: any, onColour: any, id: string }) => {
    return (
        <>
            <input
                checked={isOn}
                onChange={handleToggle}
                className="react-switch-checkbox"
                id={id}
                type="checkbox"
            />
            <label
                style={{ background: isOn && onColour }}
                className="react-switch-label"
                htmlFor={id}
            >
                <span className={`react-switch-button`} />
            </label>
        </>
    );
};

export default Switch;