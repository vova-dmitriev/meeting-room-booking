import type { StorybookConfig } from "@storybook/nextjs-vite"

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  staticDirs: ["../public", "./hosting"],
  viteFinal: async (config) => ({
    ...config,
    server: { ...config.server, allowedHosts: ["127.0.0.1", "localhost"] },
    define: { ...config.define, "process.env.NEXT_PUBLIC_API_BASE_URL": JSON.stringify("https://api.storybook.local") },
  }),
  core: { disableTelemetry: true },
}

export default config
