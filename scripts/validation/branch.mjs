import { git } from "./snapshot.mjs"

export function assertCommitBranch(root) {
  let branch

  try {
    branch = git(["symbolic-ref", "--quiet", "HEAD"], root).toString().trim()
  } catch (error) {
    if (error.status === 1) {
      return
    }

    throw error
  }

  if (branch === "refs/heads/main") {
    throw new Error("Pre-commit blocked: direct commits to main are prohibited. Create a feature branch and open a pull request into main.")
  }
}
