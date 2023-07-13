# Releasing

## Creating a new version

Increment the version of the package by updating the version in `package.json`
or by updating the package using `npm version`.

```sh
$ cd aikido-api-client
$ npm version
```

## Releasing a new version

Make sure to re-buidl all Typescript files using `yarn build`. Release a new version by publishing the package to npm using `npm publish`.

```sh
$ cd aikido-api-client
$ yarn build
$ npm publish
```

*or*

Setup the "Publish Node.js Package" action in the aikido-api-client Github.com repo.
See also: https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages
