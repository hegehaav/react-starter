#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const fse = require('fs-extra');
const { spawn } = require('child_process');
const { dep, devDep } = require('./dependencies');
const packagejson = require('../package.json');
const path = require('path');

commander
    .version(packagejson.version)
    .description('Automagic initiate a react app')
    .option('-C, --create [string]', 'App folder name')
    .on('--help', function () {
        console.log('');
        console.log('Examples:');
        console.log(' $ react-starter --create appname');
    })
    .parse(process.argv);

const appname = commander.create;

if (!appname) {
    console.log(
        `appname is missing run: ${chalk.blue.bold(
            'react-app --create appname'
        )}`
    );
    process.exit(1);
}

fse.copySync(`${path.join(__dirname, '../')}setup`, `./${appname}`);

const packageJson = fse.readJsonSync(`./${appname}/package.json`);

fse.writeJsonSync(`./${appname}/package.json`, {
    name: appname,
    ...packageJson,
});

const indexHtml = fse.readFileSync(`./${appname}/index.html`, 'utf-8');
const interpolatedHtml = indexHtml.replace(/{{appName}}/g, appname);
fse.writeFileSync(`./${appname}/index.html`, interpolatedHtml, 'utf-8');

const commands = [
    {
        cmd: 'npm',
        param: ['i', '-E', '-S', `${dep.join(' ')}`],
    },
    {
        cmd: 'npm',
        param: ['i', '-E', '-D', `${devDep.join(' ')}`],
    },
];

const exec_commands = (commands) => {
    const command = commands.shift();
    const npm = spawn(command.cmd, command.param, {
        cwd: `./${appname}`,
        shell: true,
        stdio: 'inherit',
    });

    npm.on('error', (error) => {
        console.error(chalk.red(error));
        process.exit(1);
        return;
    });

    npm.on('close', () => {
        if (commands.length) {
            exec_commands(commands);
        } else {
            console.log(`Your app is now ${chalk.green.bold('READY!')}`);
            console.log('');
            console.log(
                `You start your app with ${chalk.blue.bold(
                    `cd ./${appname} && npm run start`
                )}`
            );
        }
    });
};

exec_commands(commands);

console.log('');
console.log(`Setting up your app ${chalk.green.bold('POW!')}`);
