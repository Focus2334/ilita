export function getTagClass(tag) {
  if (tag.includes('Обязательный')) return 'red';
  if (tag.includes('Завершён')) return 'green';
  if (tag.includes('В процессе') || tag.includes('Текущий')) return 'blue';
  if (tag.includes('Доступен')) return 'yellow';
  return 'gray';
}

export function getActionButton(course) {
  if (course.locked) return null;
  if (course.status === 'completed') return { label: 'Повторить', color: 'green' };
  if (course.status === 'in_progress') return { label: 'Продолжить', color: 'orange' };
  return { label: 'Начать', color: 'blue' };
}
