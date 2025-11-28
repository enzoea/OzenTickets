import { useEffect, useRef, useState } from "react";
import { containerStyle, pickerButtonStyle, dropdownStyle } from "./style";
import type { DatePickerProps } from "./interface";

export default function DatePicker({ value = "", onChange, style = {}, disabled = false }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const base = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date();
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth() + 1);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = containerRef.current;
      const target = e.target as Node | null;
      if (el && target && !el.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const formatISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const display = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR")
    : "Selecionar data";

  return (
    <div ref={containerRef} style={{ ...containerStyle, ...style }}>
      <button
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            const next = !prev;
            if (next) {
              const b = value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date();
              setYear(b.getFullYear());
              setMonth(b.getMonth() + 1);
            }
            return next;
          });
        }}
        disabled={disabled}
        style={pickerButtonStyle(disabled)}
      >
        {display}
      </button>

      {open && (
        <div className="fade-in" style={dropdownStyle}>
          <div style={{ padding: 8 }}>
            <div className="calendar-header">
              <button
                onClick={() => {
                  const m = month - 1; const y = year + (m === 0 ? -1 : 0);
                  setYear(y);
                  setMonth(m === 0 ? 12 : m);
                }}
              >
                ‹
              </button>
              <div className="calendar-title">
                {new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </div>
              <button
                onClick={() => {
                  const m = month + 1; const y = year + (m === 13 ? 1 : 0);
                  setYear(y);
                  setMonth(m === 13 ? 1 : m);
                }}
              >
                ›
              </button>
            </div>
            <div className="calendar-scroll">
              <div className="calendar-grid">
                {["D","S","T","Q","Q","S","S"].map((d) => (
                  <div key={d} className="calendar-weekday">{d}</div>
                ))}
                {(() => {
                  const first = new Date(year, month - 1, 1);
                  const offset = first.getDay();
                  const days = new Date(year, month, 0).getDate();
                  const cells: (Date | null)[] = [];
                  for (let i = 0; i < offset; i++) cells.push(null);
                  for (let d = 1; d <= days; d++) cells.push(new Date(year, month - 1, d));
                  return cells.map((cell, idx) => {
                    if (!cell) return <div key={`b${idx}`} className="calendar-day empty"></div>;
                    const iso = formatISO(cell);
                    const isSelected = value && iso === value;
                    const cls = `calendar-day${isSelected ? ' selected-start' : ''}`;
                    return (
                      <button
                        key={iso}
                        className={cls}
                        onClick={() => {
                          onChange && onChange(iso);
                          setOpen(false);
                        }}
                      >
                        {cell.getDate()}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

