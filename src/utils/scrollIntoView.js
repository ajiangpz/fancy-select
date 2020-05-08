// from react-select
export function scrollIntoView($scrollingEl, $focusedEl) {
  const regex = /\((.+?)\)/g;
  const offsetTop=parseInt($focusedEl.style.cssText.match(regex)[0].slice(1, -1));

  const scrollingReact = $scrollingEl.getBoundingClientRect();
  const focusedRect = $focusedEl.getBoundingClientRect();
  const overScroll = $focusedEl.offsetHeight / 3;
  if (focusedRect.bottom + overScroll > scrollingReact.bottom) {
    $scrollingEl.scrollTop = Math.min(
      offsetTop +
        $focusedEl.clientHeight -
        $scrollingEl.offsetHeight +
        overScroll,
      $scrollingEl.scrollHeight
    );
  } else if (focusedRect.top - overScroll < scrollingReact.top) {
    $scrollingEl.scrollTop = Math.max(offsetTop - overScroll, 0);
  }
}
