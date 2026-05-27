export function submitFormHtml(formHtml: string, targetName?: string): void {
  const parser = new DOMParser();
  const doc = parser.parseFromString(formHtml, 'text/html');
  const parsedForm = doc.querySelector('form');
  if (!parsedForm) throw new Error('返回的 formHtml 中未找到 form');

  const form = document.createElement('form');
  form.method = (parsedForm.getAttribute('method') || 'post').toLowerCase();
  form.action = parsedForm.getAttribute('action') || '';
  form.acceptCharset = parsedForm.getAttribute('accept-charset') || 'UTF-8';
  if (targetName) form.target = targetName;
  form.style.display = 'none';

  parsedForm.querySelectorAll('input, textarea, select').forEach((field) => {
    const name = field.getAttribute('name');
    if (!name) return;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;

    // field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    // value property exists on these element types
    if ('value' in field && typeof (field as HTMLInputElement).value === 'string') {
      input.value = (field as HTMLInputElement).value || field.getAttribute('value') || '';
    } else {
      input.value = field.getAttribute('value') || '';
    }
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
