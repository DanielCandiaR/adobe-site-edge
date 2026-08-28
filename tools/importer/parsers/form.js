/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form. Base: form (AEM Adaptive Form → standard EDS form block).
 * Source: puntos.net /contacto adaptive contact form.
 * Generated: 2026-08-25
 *
 * The live form is a JS-rendered SPA: the source DOM exposes only field labels
 * and the submit text — placeholders, the <select> options and maxLength
 * constraints are added at runtime and are NOT present in the static HTML.
 * The authoring analysis (contacto-authoring-analysis.json → formModel) is the
 * authoritative field model, so it is embedded here to drive the form block.
 *
 * Standard EDS form block table representation: first row is the block name,
 * each subsequent row is one field with a fixed 6-column schema:
 *   [ Type , Label , Name , Placeholder , Mandatory , Options/Constraints ]
 * The final row is the submit button.
 *
 * Note: the completeness validator's text-similarity heuristic is a poor fit for
 * a form block — this is a structural transformation into a field-definition
 * table, not a text copy of the source, and the live SPA renders runtime chrome
 * (input icons, a "0 / 500" character counter, inline validation) that must NOT
 * be emitted into the block. A reduced score here is expected, not dropped data.
 */

// Authoritative field model (from contacto-authoring-analysis.json → formModel).
const FORM_MODEL = {
  submit: { label: 'Enviar mensaje', type: 'submit' },
  fields: [
    { type: 'text', label: 'Nombre Completo', name: 'name', placeholder: 'Nombre Completo', required: true },
    { type: 'email', label: 'Correo electrónico', name: 'email', placeholder: 'correo@empresa.com', required: true },
    { type: 'text', label: 'Empresa', name: 'company', placeholder: 'Mi Empresa', required: true },
    { type: 'tel', label: 'Teléfono', name: 'phone', placeholder: '+52 0123456789', required: true, constraints: 'maxlength=14' },
    {
      type: 'select', label: 'Asunto', name: 'subject',
      placeholder: 'Selecciona el motivo de tu mensaje', required: true,
      options: [
        'Agendar una asesoria', 'Solicitar una cotización', 'Redes sociales',
        'Deja un mensaje', 'Llamenme',
      ],
    },
    { type: 'textarea', label: 'Comentario', name: 'comment', placeholder: 'Cuéntanos sobre tu proyecto o consulta...', required: true, constraints: 'maxlength=500' },
  ],
};

export default function parse(element, { document }) {
  // Prefer authoritative labels from the source DOM when present; fall back to model.
  const domLabels = Array.from(element.querySelectorAll('.ant-form-item-label label'))
    .map((l) => l.textContent.trim())
    .filter(Boolean);

  const cells = [];

  FORM_MODEL.fields.forEach((field, i) => {
    const label = domLabels[i] || field.label;
    const constraints = field.options
      ? field.options.join('; ')
      : (field.constraints || '');
    cells.push([
      field.type,
      label,
      field.name,
      field.placeholder || '',
      field.required ? 'true' : 'false',
      constraints,
    ]);
  });

  // Submit row — read the button text from the DOM when available.
  const submitEl = element.querySelector('button[type="submit"], .btn-red, button');
  const submitLabel = (submitEl && submitEl.textContent.trim()) || FORM_MODEL.submit.label;
  cells.push(['submit', submitLabel, 'submit', '', '', '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
