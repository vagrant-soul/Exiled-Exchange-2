<template>
  <div class="p-2 flex flex-col h-full items-center">
    <div class="flex flex-col items-center p-2 mb-4">
      <img class="w-12 h-12" src="/images/jeweler.png" />
      <p class="text-base">Exiled Exchange 2</p>
      <p class="">{{ t("app.version", [version]) }}</p>
      <div class="flex gap-2">
        <a
          class="border-b"
          href="https://github.com/Kvan7/exiled-exchange-2/releases"
          target="_blank"
          >{{ t("app.release_notes") }}</a
        >
        <a
          class="border-b"
          href="https://github.com/Kvan7/exiled-exchange-2/issues"
          target="_blank"
          >{{ t("app.report_bug") }}</a
        >
      </div>
    </div>
    <div
      class="border border-gray-600 rounded p-2 whitespace-nowrap min-w-min w-72"
    >
      <p>{{ info.str1 }}</p>
      <p>{{ info.str2 }}</p>
      <button v-if="info.action" @click="info.action" class="btn w-full mt-1">
        {{ info.actionText }}
      </button>
    </div>
    <div class="text-center mt-auto py-8">
      <p>
        {{ t("app.contact_me") }} <br /><span
          class="font-sans text-gray-500 select-all"
          >&lt;@340233612064718851&gt;</span
        >
      </p>
      <ul class="flex gap-4">
        <li>
          <img class="rounded inline" src="/images/dc_reddit.png" />
          <a
            class="border-b"
            href="https://old.reddit.com/r/pathofexile2"
            target="_blank"
            >r/pathofexile</a
          >
        </li>
        <li>
          <img class="rounded inline" src="/images/discord.png" />
          <a
            class="border-b"
            href="https://discord.gg/pathofexile"
            target="_blank"
            >pathofexile</a
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Host } from "@/web/background/IPC";
import { DateTime } from "luxon";

function checkForUpdates() {
  Host.sendEvent({
    name: "CLIENT->MAIN::user-action",
    payload: { action: "check-for-update" },
  });
}

function openDownloadPage() {
  window.open("https://github.com/Kvan7/exiled-exchange-2/releases");
}

function quitAndInstall() {
  Host.sendEvent({
    name: "CLIENT->MAIN::user-action",
    payload: { action: "update-and-restart" },
  });
}

function fmtTime(millis: number) {
  return DateTime.fromMillis(millis).toRelative({ style: "long" }) ?? "n/a";
}

export default defineComponent({
  name: "settings.about",
  inheritAttrs: false,
  setup() {
    const { t } = useI18n();

    const info = computed(() => {
      const rawInfo = Host.updateInfo.value;
      switch (rawInfo.state) {
        case "initial":
          return {
            str1: t("updates.maybe_outdated"),
            str2: t("updates.never_checked"),
            action: checkForUpdates,
            actionText: t("updates.check_now"),
          };
        case "checking-for-update":
          return { str1: t("updates.checking"), str2: t("please_wait") };
        case "update-not-available":
          return {
            str1: t("updates.latest"),
            str2: t("updates.last_checked", [fmtTime(rawInfo.checkedAt)]),
            action: checkForUpdates,
            actionText: t("updates.check_now"),
          };
        case "error":
          return {
            str1: t("updates.maybe_outdated"),
            str2: t("updates.error"),
            action: openDownloadPage,
            actionText: t("updates.downloads_page"),
          };
        case "update-downloaded":
          return {
            str1: t("updates.available", [rawInfo.version]),
            str2: t("updates.installed_on_exit"),
            action: quitAndInstall,
            actionText: t("updates.install_now"),
          };
        case "update-available":
          return rawInfo.noDownloadReason
            ? {
                str1: t("updates.available", [rawInfo.version]),
                str2:
                  rawInfo.noDownloadReason === "not-supported"
                    ? t("updates.download_manually")
                    : t("updates.download_disabled"),
                action: openDownloadPage,
                actionText: t("updates.downloads_page"),
              }
            : {
                str1: t("updates.available", [rawInfo.version]),
                str2: t("updates.downloading"),
              };
      }
    });

    return {
      t,
      info,
      version: Host.version,
    };
  },
});
</script>
