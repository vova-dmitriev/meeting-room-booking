import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

// Deliberate rules updates must update these reviewed SHA-256 pins as well.
const hashes = {
  ".gitleaks.toml": "ff998c544f0ae968c7a92202e4f8211feffac00f899d761288049eb8a879c4e1",
  ".semgrep/javascript_eval_rule-eval-with-expression.yml": "eaed47207aa21a257b8fd68efe6a3698c143035144f568995c013ea5f68d5cd1",
  ".semgrep/javascript_exec_rule-child-process.yml": "88a14e032771edaf4b69601b739880eac05eb45bf55f73752df4cf2a1e4b8cd8",
  ".semgrep/rules_lgpl_javascript_eval_rule-eval-nodejs.yml": "3107092d4a8a349275379c1bcb8cd1100d41b80e7474601e4090ffd9b8ebca75",
  ".semgrep/rules_lgpl_javascript_eval_rule-eval-require.yml": "47331f1c8cfd41de69b49b6d17092abf783606d27eabe6bc9255467bcdfd591c",
  ".semgrep/rules_lgpl_javascript_eval_rule-vm-code-injection.yml": "096d8aa83fe5ee2dc055844cced27da07457c94488c959db70d9a104dddaf92b",
  ".semgrep/rules_lgpl_javascript_eval_rule-vm-compilefunction-injection.yml":
    "f54239c7b7dd00c0030b913b92395521af5dd7e4c111165b2ff34080e1d8607e",
  ".semgrep/rules_lgpl_javascript_eval_rule-vm-runincontext-injection.yml":
    "d6e46bbe77ce7e670c08f66902ad0d4bcf272e10bbb96c6d4a83fe308622309e",
  ".semgrep/rules_lgpl_javascript_eval_rule-vm-runinnewcontext-injection.yml":
    "36ed06d4b727540dbd05c9e4277fc9357321263bbf03d1c565261ad1aff3bcbd",
  ".semgrep/rules_lgpl_javascript_ssrf_rule-node-ssrf-part-1.yml": "c8cf05f4f7506aebc131787c6d5053095deec746f5bf1ec9b1259ecbd509af7d",
  ".semgrep/rules_lgpl_javascript_ssrf_rule-node-ssrf-part-2.yml": "cef817730d4010ad68334633130932d8114533a95b6d507be41421dc4903ee9b",
  ".semgrep/rules_lgpl_javascript_ssrf_rule-node-ssrf-part-3.yml": "6a78e6bb7fb6e662a85847e781b7f1b366ae1023485001f0d89c36574b635c1a",
  ".semgrep/rules_lgpl_javascript_ssrf_rule-playwright-ssrf.yml": "133148152334b8a7df4b6bfabdfb0df11f1dbb94923b26ec0a9ac7ac4355bf28",
}

export function verifyRules(root) {
  const expected = Object.keys(hashes).filter((file) => file.startsWith(".semgrep/"))

  const actual = readdirSync(join(root, ".semgrep"))
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .map((file) => `.semgrep/${file}`)
    .sort()

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error("Semgrep rules must match the complete pinned manifest")
  }

  for (const [file, expectedHash] of Object.entries(hashes)) {
    const digest = createHash("sha256")
      .update(readFileSync(join(root, file)))
      .digest("hex")

    if (digest !== expectedHash) {
      throw new Error(`Security configuration hash mismatch: ${file}`)
    }
  }

  return expected
}
