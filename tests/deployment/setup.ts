export default function setup() {
  if (!process.env.DEPLOYMENT_URL || !process.env.STORYBOOK_DEPLOYMENT_URL) {
    throw new Error("DEPLOYMENT_URL and STORYBOOK_DEPLOYMENT_URL are required for deployment smoke tests")
  }
}
