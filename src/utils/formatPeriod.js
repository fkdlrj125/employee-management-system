// 기간 포맷 공통 함수
export function formatPeriod(startDate, endDate) {
  if (!startDate && !endDate) return '';
  if (startDate && !endDate) {
    const start = new Date(startDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
    });
    return `${start} ~`;
  }
  if (!startDate && endDate) {
    const end = new Date(endDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
    });
    return `~ ${end}`;
  }
  const start = new Date(startDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
  });
  const end = new Date(endDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
  });
  return `${start} ~ ${end}`;
}
