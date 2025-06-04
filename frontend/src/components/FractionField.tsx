import React, { useRef } from 'react';


interface FractionFieldProps
{
  label: string;
  idStart: string;
  startValue: number;
  onStartChange: React.ChangeEventHandler<HTMLInputElement>;
  idEnd: string;
  endValue: number;
  onEndChange: React.ChangeEventHandler<HTMLInputElement>;
  min?: number;
  endReadOnly?: boolean;
  showConnectingLine?: boolean;
}

export function FractionField({
  label,
  idStart,
  startValue,
  onStartChange,
  idEnd,
  endValue,
  onEndChange,
  min,
  endReadOnly,
  showConnectingLine
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
          onChange={onStartChange}
          min={min}
          max={endValue}
        />
        <span>/</span>
        <input
          id={idEnd}
          type="number"
          value={endValue}
          onChange={onEndChange}
          min={min}
          readOnly={endReadOnly === true}
          className={endReadOnly === true ? 'read-only' : ''}
        />
        {showConnectingLine && <div className="connecting-line" />}
      </div>
    </div>
  );
}
