const BOOT_INTRO_KEY = "warebase-boot-intro";

export function markBootIntro() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(BOOT_INTRO_KEY, "1");
}

export function consumeBootIntro(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const hasIntro = window.sessionStorage.getItem(BOOT_INTRO_KEY) === "1";
  if (hasIntro) {
    window.sessionStorage.removeItem(BOOT_INTRO_KEY);
  }
  return hasIntro;
}
