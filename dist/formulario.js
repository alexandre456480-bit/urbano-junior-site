(() => {
  'use strict';
  const form = document.getElementById('request-form');
  const review = document.getElementById('review-panel');
  const textValidators = [];
  const date = form.elements.date;
  const today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  form.hidden = false;

  ['name', 'details'].forEach((name) => {
    const field = form.elements[name];
    const validate = () => field.setCustomValidity(field.value.trim().length >= Number(field.minLength) ? '' : `Preencha este campo com pelo menos ${field.minLength} caracteres.`);
    textValidators.push(validate);
    field.addEventListener('input', validate);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    textValidators.forEach(validate => validate());
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    const lines = [
      'Olá, Urbano Junior! Gostaria de solicitar um atendimento.',
      '',
      `Nome: ${value('name')}`,
      '',
      `Serviço: ${value('service')}`,
      ...(value('occasion') ? [`Ocasião: ${value('occasion')}`] : []),
      `Data desejada: ${value('date') ? value('date').split('-').reverse().join('/') : 'Ainda não definida'}`,
      '',
      'Detalhes do projeto:',
      value('details'),
      ...(value('reference') ? ['', `Referência: ${value('reference')}`] : []),
    ];
    const message = lines.join('\n');
    document.getElementById('review-data').textContent = message;
    document.getElementById('send-request').href = `https://wa.me/5562981647663?text=${encodeURIComponent(message)}`;
    form.hidden = true;
    review.hidden = false;
    document.getElementById('review-title').focus();
    review.scrollIntoView({ block: 'start' });
  });

  document.getElementById('edit-request').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
