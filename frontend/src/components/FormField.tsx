import React from 'react';
import './FormField.css';

type FormFieldProps =
  React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> & {
    label: string;
    id?: string;
    as?: 'input' | 'textarea' | 'select';
    cssClass?: string;
    children?: React.ReactNode;
  };


function labelToId(label: string): string
{
  return label
    .toLowerCase()
    .replace(/[:]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function FormField({
  id,
  label,
  as = 'input',
  cssClass = 'form-field',
  children,
  ...props
}: FormFieldProps)
{
  const generatedId = id ?? labelToId(label);
  const Tag = as;

  const isVoidTag = ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(as);

  return (
    <div className={cssClass}>
      <label htmlFor={generatedId}>{label}</label>
      {isVoidTag ? (
        <Tag id={generatedId} {...props} />
      ) : (
        <Tag id={generatedId} {...props}>{children}</Tag>
      )}
    </div>
  );
}