import React from 'react'
import './Popup.css'

interface PopupProps {
    children: React.ReactNode,
    trigger: boolean,
    setTrigger: React.Dispatch<React.SetStateAction<boolean>>
}

function Popup(props: PopupProps) {
    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="close-btn" onClick={() => props.setTrigger(false)}>×</button>
                {props.children}
            </div>
        </div>
    ) : "";
}

export default Popup