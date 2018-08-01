# Workbok-bgSync

![npm](https://img.shields.io/npm/v/workbox-bgsync.svg)
![npm](https://img.shields.io/npm/l/workbox-bgsync.svg)

Adds a react component to list the offline requests made by workbox's [backgroundSync](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync).

## Getting Started

The package comes with a script to be added in your service worker and a react component.

### Prerequisites

A service worker with workbox registed and active.

eg: 
```
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

#...
#Precache
#...

```

### Installing


#### Service Worker
Add the script to your service woker after workbox

```
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');
importScripts('https://rawgit.com/abhiagri/workbox-bgsync/master/dist/sw.js');

...

```
You can also [download](https://rawgit.com/abhiagri/workbox-bgsync/master/dist/sw.js) the file and import it locally

##### Register Routes

```
const bgSync = bgSyncPlugin('queueName');
workbox.routing.registerRoute(
  /\/api\/.*/,
  workbox.strategies.networkOnly({
    plugins: [bgSync],
  }),
  'POST',
);
```

#### React Component
```
npm install workbox-bgsync
```

```
import Requests from 'workbox-bgsync'

...

render() {
    return <Requests />
}

```

## Authors

* **Abhishek Lal** - *Initial work* - [GitHub](https://github.com/abhisheklalnediya)

## License

This project is licensed under the MIT License


