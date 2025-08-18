// 공통: 빈 행에서 입력 클릭 시 addFn() 후 openFn(0) 호출
export function handleEmptyRowClick(addFn, openFn) {
  addFn();
  setTimeout(() => {
    openFn(0);
  }, 0);
}
