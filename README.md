# StudentHub

###### Firebase CLI User Guide

Run the command :

`npm install -g firebase-tools`

Configuration Commands :

Command | Description

`login` - Authenticate to your Firebase account. Requires access to a web browser.
`logout` - Sign out of the Firebase CLI.
`login:ci` - Generate an authentication token for use in non-interactive environments.
`login:add` - Authorize the CLI for an additional account.
`login:list` - List authorized CLI accounts.
`login:use` - Set the default account to use for this project
`use` - Set active Firebase project, manage project aliases.
`open` - Quickly open a browser to relevant project resources.
`init` - Setup a new Firebase project in the current directory. This command will create a firebase.json configuration file in your current directory.
`help` - Display help information about the CLI or specific commands.

Refere to https://www.npmjs.com/package/firebase-tools for more Command-Line Usage.

## Firebase Functions

For set up your app credantial do :
firebase functions:config:set api.client_id="your_client_id" api.client_secret="your_client_secret"

## Firebase Firestore

For set up your app credantial replace placeHolder in Student-Hub/src/environments the files
environment.prod.sample.ts and to rename it to environment.prod.ts

###### Angular CLI User Guide

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.4.

## Npm modules

run the commande into Student-Hub:

`npm i --force` - Some module cant be deprecated so use --force.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
