import { useEffect, useRef, useState } from "react";
import { ConfigWrapper } from "@rin/config";
import type { Profile } from "../state/profile";
import { defaultClientConfig } from "../state/config";
import { applyThemeColor } from "../utils/theme-color";
import { readBootstrappedClientConfig } from "./bootstrap-config";
import { client } from "./runtime";

function applyViewportScaling() {
  const highResolutionThreshold = 2560;
  document.documentElement.style.fontSize = window.screen.width >= highResolutionThreshold ? "125%" : "100%";
}

export function useAppBootstrap() {
  const initializedRef = useRef(false);
  const [profile, setProfile] = useState<Profile | undefined | null>(undefined);
  const [config, setConfig] = useState<ConfigWrapper>(new ConfigWrapper({}, new Map()));

  useEffect(() => {
    applyViewportScaling();

    const updateClientConfig = (nextConfig: Record<string, unknown>) => {
      sessionStorage.setItem("config", JSON.stringify(nextConfig));
      setConfig(new ConfigWrapper(nextConfig, defaultClientConfig));
      applyThemeColor(typeof nextConfig["theme.color"] === "string" ? nextConfig["theme.color"] : undefined);
    };

    const syncClientConfigFromSession = () => {
      const cachedConfig = sessionStorage.getItem("config");
      if (!cachedConfig) {
        return;
      }

      const configObject = JSON.parse(cachedConfig) as Record<string, unknown>;
      updateClientConfig(configObject);
    };

    const handleStorage = (event: Event) => {
      if (typeof StorageEvent !== "undefined" && event instanceof StorageEvent && event.key && event.key !== "config") {
        return;
      }

      syncClientConfigFromSession();
    };

    window.addEventListener("storage", handleStorage);

    if (initializedRef.current) {
      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    }

    client.user.profile().then(({ data, error }) => {
      if (data) {
        setProfile({
          id: data.id,
          avatar: data.avatar || "",
          permission: data.permission,
          name: data.username,
        });
      } else if (error) {
        setProfile(null);
      }
    });

    const cachedConfig = sessionStorage.getItem("config");
    const bootstrappedConfig = readBootstrappedClientConfig();

    if (bootstrappedConfig) {
      updateClientConfig(bootstrappedConfig);
    } else if (cachedConfig) {
      syncClientConfigFromSession();
    }

    initializedRef.current = true;

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return { config, profile };
}
