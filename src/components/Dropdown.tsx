import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

export default function Dropdown({
  label,
  value,
  options,
  onChange,
  width = 150,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = options.find((o) => o.value === value)?.label || (value || "All");

  return (
    <div className="genre-picker" ref={ref} style={{ width }}>
      <button
        type="button"
        className={`filter-btn ${value ? "is-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span className="filter-select__label" style={{ fontSize: "0.62rem" }}>{label}</span>
          <span>{current}</span>
        </span>
        <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="genre-panel" style={{ width, left: 0 }}>
          <div className="genre-panel__list">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`genre-option ${value === opt.value ? "is-checked" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="genre-option__check" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
