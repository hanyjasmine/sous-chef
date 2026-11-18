import "i18next";
import type { defaultNS, resources } from "@/i18n";

// typed keys, so t("typo") fails the build
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["en"];
  }
}
