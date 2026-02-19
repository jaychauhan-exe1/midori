import type { CaretPosition } from "@/src/types/typing";

export const getCaretPosition = (
  activeWordRef: HTMLElement | null,
  userInputLength: number,
): CaretPosition => {
  if (!activeWordRef) return { top: 0, left: 0, height: 0 };

  const letters = activeWordRef.querySelectorAll(".letter, .extra");
  let targetEl: HTMLElement;
  let useRight = false;

  if (userInputLength === 0) {
    targetEl =
      (activeWordRef.querySelector(".letter") as HTMLElement) || activeWordRef;
    useRight = false;
  } else {
    targetEl = letters[
      Math.min(userInputLength - 1, letters.length - 1)
    ] as HTMLElement;
    useRight = true;
  }

  const top =
    (targetEl.offsetParent as HTMLElement)?.offsetTop +
      targetEl.offsetTop +
      targetEl.offsetHeight * 0.1 || targetEl.offsetTop;
  const left =
    (targetEl.offsetParent as HTMLElement)?.offsetLeft +
      targetEl.offsetLeft +
      (useRight ? targetEl.offsetWidth : 0) || targetEl.offsetLeft;
  const height = targetEl.offsetHeight * 0.8;

  return { top, left, height };
};
