import React, { useState, useRef, useEffect } from "react";
import { getVarDesc } from "../utils/variableDescriptions";

interface TooltipProps {
  /** Key de la variable para buscar descripción en el diccionario */
  varKey: string;
  /** Texto alternativo si no se usa varKey */
  label?: string;
  /** Descripción personalizada (opcional, sobreescribe la del diccionario) */
  description?: string;
  /** Children: el elemento sobre el que se muestra el tooltip */
  children: React.ReactNode;
  /** Posición del tooltip */
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  varKey,
  label,
  description,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const desc = getVarDesc(varKey);
  const displayLabel = label ?? desc.label;
  const displayDescription = description ?? desc.description;

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (position) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "right":
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Keep within viewport
    if (x < 4) x = 4;
    if (y < 4) y = 4;
    if (x + tooltipRect.width > window.innerWidth - 4) {
      x = window.innerWidth - tooltipRect.width - 4;
    }
    if (y + tooltipRect.height > window.innerHeight - 4) {
      y = window.innerHeight - tooltipRect.height - 4;
    }

    setCoords({ x, y });
  }, [visible, position]);

  return (
    <div
      ref={triggerRef}
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="tooltip-box"
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            zIndex: 9999,
          }}
        >
          <strong>{displayLabel}</strong>
          <p>{displayDescription}</p>
        </div>
      )}
    </div>
  );
}
