# Firebase Deploy

Firebase Deploy streamlines the use of the `firebase deploy` command by enabling you to pre-answer prompts. This is especially useful when you want to automate Firebase deployments within scripts or automated workflows.

## Install

```bash
npm install -g firebase-deploy
```

## Usage

```bash
firebase-deploy [options]
```

## Options

### Prompt Options

| Option | Description |
| --- | --- |
| ` --confirm-on-deletion` | Confirm deletion of resources if not present on codebase | 
| `--no-confirm-on-deletion` | Deny deletion of resources if not present on codebase |
| `--confirm-on-retry-failure` | Confirm retrying functions in case of failure |
| ` --no-confirm-on-retry-failure` | Deny retrying functions in case of failure |

### Firebase Deploy Options

You can also pass additional arguments (args) to firebase-deploy as needed for your deployment. These additional arguments can include any valid arguments that the `firebase deploy` command supports. This allows for flexibility in customizing your deployment process to suit your specific requirements.