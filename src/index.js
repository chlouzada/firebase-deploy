#!/usr/bin/env node
// @ts-check

import { Command } from 'commander';
import { spawn } from 'child_process';

const logger = {
  log: (args) => console.log(args),
  error: (args) => console.error(args),
};


const program = new Command();

program
  .name('firebase-deploy')
  .description('Wrapper for `firebase deploy` that allows preanswering prompts')
  .version('1.0.2');

program
  .option(
    '--confirm-on-deletion',
    'Automatically confirm deletion of resources if not present on codebase'
  )
  .option(
    '--no-confirm-on-deletion',
    'Automatically deny deletion of resources if not present on codebase'
  )
  .option(
    '--confirm-on-retry-failure',
    'Automatically confirm retrying functions in case of failure'
  )
  .option(
    '--no-confirm-on-retry-failure',
    'Automatically deny retrying functions in case of failure'
  );

const options = program.allowUnknownOption(true).parse().opts();

const args = (() => {
  const result = program.args;

  if (result.includes('--non-interactive')) {
    logger.error(`--non-interactive is not supported.`);
    process.exit(1);
  }

  if (result.includes("-f") || result.includes("--force")) {
    logger.error(`-f/--force is not supported. Please use --confirm-on-deletion instead.`);
    process.exit(1);
  }

  return result;
})();

main(
  {
    confirmOnDeletion: options.confirmOnDeletion,
    confirmOnRetryFailure: options.confirmOnRetryFailure,
  },
  args
);

/**
 * @param {{
 *  confirmOnDeletion: boolean | undefined;
 *  confirmOnRetryFailure: boolean | undefined;
 * }} options
 * @param {string[]} args
 * @returns {void}
 * */
function main({ confirmOnDeletion, confirmOnRetryFailure }, args) {
  const child = spawn('firebase', ['deploy', ...args, '--interactive'], {
    stdio: 'pipe',
  });

  const prompts = [
    {
      text: 'Would you like to proceed with deletion? Selecting no will continue the rest',
      options: ['--confirm-on-deletion', '--no-confirm-on-deletion'],
      value: confirmOnDeletion,
    },
    {
      text: 'The following functions will newly be retried in case of failure',
      options: ['--confirm-on-retry-failure', '--no-confirm-on-retry-failure'],
      value: confirmOnRetryFailure,
    },
  ];

  child.stdout.on('data', (data) => {
    const output = data.toString();
    logger.log(output);

    prompts.forEach((prompt) => {
      if (output.includes(prompt.text)) {
        if (prompt.value === undefined) {
          logger.error(
            `Prompt '${
              prompt.text
            }' was found but no response was provided. Please provide either ${prompt.options.join(
              ' or '
            )}`
          );
          process.exit(1);
        }
        child.stdin.write(prompt.value ? 'y\n' : 'n\n');
      }
    });
  });

  child.stderr.on('data', (data) => {
    logger.error(data.toString());
  });

  child.on('close', (code) => {
    logger.log(`process exited with code ${code}`);
    process.exit(code ?? 1);
  });
}
