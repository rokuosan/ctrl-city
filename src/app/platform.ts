export type NavigatorInfo = Readonly<
  Pick<Navigator, "maxTouchPoints" | "platform" | "userAgent">
>;

export function isIOSDevice(info: NavigatorInfo = navigator): boolean {
  return (
    /iPad|iPhone|iPod/.test(info.userAgent) ||
    (info.platform === "MacIntel" && info.maxTouchPoints > 1)
  );
}
