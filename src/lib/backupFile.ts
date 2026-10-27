import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function saveBackupFile(filename: string, content: string) {
  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    return;
  }

  const file = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
  });
  await Share.share({
    title: "词光学习备份",
    text: "保存这份文件，可在其他设备的词光中恢复学习进度。",
    url: file.uri,
    dialogTitle: "导出学习进度",
  });
}
