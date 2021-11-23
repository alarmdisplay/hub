# Alarmdisplay Hub

This component takes care of collecting, receiving, and processing alerts.
It combines them to incidents and forwards them to other systems like the [Display](https://github.com/alarmdisplay/display).

This repository contains backend and frontend code.
For more info on how to run those parts, check out the README in the respective sub folder.

## Build from source

```
git clone https://github.com/alarmdisplay/hub.git
cd hub

# Skip this step, if you want to build the development version
git checkout main

./scripts/build.sh
```
Now you have the runnable version in the _build_ directory.

## Deployment
At the moment, this project is not recommended for deployment outside a development or test environment.
