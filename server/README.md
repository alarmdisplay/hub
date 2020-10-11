# hub-backend

> Backend for collecting, processing and forwarding alerts

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3, 4.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/hub-backend
    npm install
    ```

3. Build [console](../console/README.md) and copy to current folder

    ```
    cp -r ../console/dist ./ext-console
    ```

4. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Build for production

1. Make sure you have typescript installed.

    ```
    npm install -g typescript
    ```

2. Build application

    ```
    tsc --build tsconfig.json
    ```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).
