import React from 'react';

interface FractionFieldProps
{
  label: string;
  idStart: string;
  startValue: number;
  onStartChange: (value: number) => void;
  idEnd: string;
  endValue: number;
  onEndChange: (value: number) => void;
  min?: number;
}

export function FractionField({
  label,
  idStart,
  startValue,
  onStartChange,
  idEnd,
  endValue,
  onEndChange,
  min
}: FractionFieldProps)
{
  return (
    <div className="form-field">
      <label htmlFor={idStart}>{label}</label>
      <div className="fraction-input">
        <input
          id={idStart}
          type="number"
          value={startValue}
          onChange={e => onStartChange(Number(e.target.value))}
          min={min}
          max={endValue}
        />
        <span>/</span>
        <input
          id={idEnd}
          type="number"
          value={endValue}
          onChange={e => onEndChange(Number(e.target.value))}
          min={min}
        />
      </div>
    </div>
  );
}
