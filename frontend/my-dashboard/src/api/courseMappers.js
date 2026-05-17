const STATUS_TAGS = {
  completed: 'Завершён',
  in_progress: 'В процессе',
  available: 'Доступен',
  locked: 'Заблокирован',
};

const TASK_TYPES = new Set(['video', 'article', 'task', 'test']);

export function mapProgressStatus(status) {
  if (status === 'completed') return 'completed';
  if (status === 'in_progress') return 'in_progress';
  return 'available';
}

function formatDurationDays(days) {
  const hours = Math.max(1, days * 2);
  if (hours === 1) return '1 час';
  if (hours >= 2 && hours <= 4) return `${hours} часа`;
  return `${hours} часов`;
}

function xpForCourse(durationDays) {
  return Math.max(100, (durationDays || 7) * 15);
}

function buildTags({ mandatory = false, status, category = 'Введение' }) {
  const tags = [];
  if (mandatory) tags.push('Обязательный');
  if (STATUS_TAGS[status]) tags.push(STATUS_TAGS[status]);
  if (category && !tags.includes(category)) tags.push(category);
  return tags;
}

function mapProgressToStages(pages, progressPages) {
  const sortedPages = [...pages].sort((a, b) => a.position - b.position);
  const viewedMap = Object.fromEntries(
    (progressPages || []).map((p) => [p.page_id, p.viewed]),
  );

  let currentIndex = sortedPages.findIndex((page) => !viewedMap[page.id]);
  if (currentIndex === -1) currentIndex = sortedPages.length > 0 ? sortedPages.length - 1 : 0;

  return sortedPages.map((page, index) => {
    const viewed = viewedMap[page.id] ?? false;
    const blocks = [...(page.blocks || [])].sort((a, b) => a.position - b.position);
    const doneCount = blocks.filter(
      (b) => viewed || (b.content || {}).done,
    ).length;
    const pageProgress =
      blocks.length === 0 ? (viewed ? 100 : 0) : Math.round((doneCount / blocks.length) * 100);

    let stageStatus = 'locked';
    if (viewed || pageProgress >= 100) stageStatus = 'completed';
    else if (index === currentIndex) stageStatus = 'current';
    else if (index < currentIndex) stageStatus = 'completed';

    const tasks = blocks.map((block) => ({
      id: String(block.id),
      title:
        (block.content || {}).title ||
        (block.content || {}).text ||
        `${block.type} #${block.position}`,
      type: TASK_TYPES.has(block.type) ? block.type : 'article',
      done: viewed || (block.content || {}).done || false,
      pageId: page.id,
    }));

    return {
      id: String(page.id),
      title: page.title,
      progress: pageProgress,
      status: stageStatus,
      tasks,
    };
  });
}

/** GET /me/courses + каталог GET /courses */
export function mergeCatalogWithProgress(catalog, progressItems) {
  const progressById = Object.fromEntries(
    (progressItems || []).map((item) => [item.course_id, item]),
  );

  return (catalog || []).map((course) => {
    const progress = progressById[course.id];
    if (progress) {
      return mapMyCourseProgress(progress, course);
    }
    return mapCatalogCourse(course);
  });
}

/** Элемент GET /me/courses */
export function mapMyCourseProgress(item, catalogCourse = null) {
  const progress = item.progress_percent ?? 0;
  const status = mapProgressStatus(item.status);
  const durationDays = catalogCourse?.duration_days ?? 7;
  const totalStages = catalogCourse?.pages?.length || 3;
  const currentStage = Math.min(
    totalStages,
    Math.max(1, Math.ceil((progress / 100) * totalStages) || 1),
  );

  return {
    id: String(item.course_id),
    title: item.course_title,
    description: catalogCourse?.description || '',
    category: 'Введение',
    mandatory: false,
    duration: formatDurationDays(durationDays),
    xp: xpForCourse(durationDays),
    totalStages,
    currentStage,
    progress,
    status,
    locked: false,
    tags: buildTags({ status, category: 'Введение' }),
    stages: [],
    ...(item.completed_at && {
      completedDate: new Date(item.completed_at).toLocaleDateString('ru-RU'),
    }),
  };
}

/** GET /courses без прогресса */
export function mapCatalogCourse(course) {
  const durationDays = course.duration_days ?? 7;
  const totalStages = course.pages?.length || 3;

  return {
    id: String(course.id),
    title: course.title,
    description: course.description || '',
    category: 'Введение',
    mandatory: false,
    duration: formatDurationDays(durationDays),
    xp: xpForCourse(durationDays),
    totalStages,
    currentStage: 1,
    progress: 0,
    status: 'available',
    locked: false,
    tags: buildTags({ status: 'available', category: 'Введение' }),
    stages: [],
  };
}

/** GET /courses (админ) */
export function mapAdminCourses(items) {
  return (items || []).map(mapCatalogCourse);
}

/** GET /courses/{id} + GET /courses/{id}/progress */
export function mapCourseDetail(detail, progress) {
  const durationDays = detail.duration_days ?? 7;
  const progressPercent = progress?.progress_percent ?? 0;
  const status = mapProgressStatus(progress?.status || 'not_started');
  const stages = mapProgressToStages(detail.pages || [], progress?.pages || []);
  const totalStages = stages.length || 1;
  const completedStages = stages.filter((s) => s.status === 'completed').length;
  const currentStage =
    status === 'completed'
      ? totalStages
      : Math.min(totalStages, Math.max(1, completedStages + (status === 'in_progress' ? 1 : 0)));

  return {
    id: String(detail.id),
    title: detail.title,
    description: detail.description || '',
    category: 'Введение',
    mandatory: false,
    duration: formatDurationDays(durationDays),
    xp: xpForCourse(durationDays),
    totalStages,
    currentStage,
    progress: progressPercent,
    status,
    locked: false,
    tags: buildTags({ status, category: 'Введение' }),
    stages,
    ...(progress?.completed_at && {
      completedDate: new Date(progress.completed_at).toLocaleDateString('ru-RU'),
    }),
  };
}
