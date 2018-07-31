let WB_STORE = null;
let BG_STORE = null;
let IDB = self.indexedDB;

const getWBRKeys = () => new Promise((resolve, reject) => {
  const txStore = WB_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.getAllKeys();
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve(getAllrequests.result);
  };
});


const getWBR = key => new Promise((resolve, reject) => {
  const txStore = WB_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.get(key);
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve({ ...getAllrequests.result, key });
  };
});

const getWBRRequests = () => new Promise((resolve) => {
  getWBRKeys().then((keys) => {
    const reqs = keys.map(key => getWBR(key));
    resolve(Promise.all(reqs));
  });
});

const getBGRKeys = () => new Promise((resolve, reject) => {
  const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.getAllKeys();
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve(getAllrequests.result);
  };
});

const getBGR = key => new Promise((resolve, reject) => {
  const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.get(key);
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve(getAllrequests.result);
  };
});

const addBGR = value => new Promise((resolve, reject) => {
  const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.add(value);
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve(getAllrequests.result);
  };
});

const putBGR = value => new Promise((resolve, reject) => {
  const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
  const getAllrequests = txStore.put(value);
  getAllrequests.onerror = () => reject;
  getAllrequests.onsuccess = () => {
    resolve(getAllrequests.result);
  };
});

const Requests = () => new Promise((resolve) => {
  getBGRKeys().then((keys) => {
    const reqs = keys.map(key => getBGR(key));
    resolve(Promise.all(reqs));
  });
});

const workboxDBQueueKeys = () => new Promise(((resolve, reject) => {
  const openWBoxDB = IDB.open('workbox-background-sync');
  openWBoxDB.onsuccess = () => {
    WB_STORE = openWBoxDB.result;
    if (WB_STORE.objectStoreNames.length) {
      resolve(getWBRKeys());
    }
    reject();
  };
}));


const syncResults = (results) => {
  Requests().then((reqs) => {
    results.forEach((res) => {
      const requestBG = reqs;
      const ri = requestBG.findIndex(x => x.storableRequest.url && !x.result);
      if (ri >= 0) {
        requestBG[ri] = {
          ...requestBG[ri],
          result: {
            error: res.error && res.error.toString(),
            response: res.response && { status: res.response.status, statusText: res.response.statusText },
          },
          v: requestBG[ri].v + 1,
        };
        putBGR(requestBG[ri]);
      }
    });
  });
};

const sycnDB = results => workboxDBQueueKeys().then((keys) => {
  if (results && results.length) {
    syncResults(results);
  }
  keys.forEach((key) => {
    Promise.all([getBGR(key), getWBR(key)]).then((values) => {
      const [valueBGR, valueWBR] = values;
      if (valueBGR === undefined) {
        addBGR({ ...valueWBR, v: 0 }).then(x => console.log('inserted', x));
      } else {
        putBGR({ ...valueWBR, key, v: valueBGR.v + 1 }).then(x => console.log('updated', x));
      }
    });
  });
});

const p = new Promise(((resolve, reject) => {
  const openBGQDB = IDB.open('bgqueue');
  openBGQDB.onupgradeneeded = () => {
    const db = openBGQDB.result;
    db.createObjectStore('requests', { keyPath: 'key' });
    // var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
  };

  openBGQDB.onerror = () => reject;
  openBGQDB.onsuccess = () => {
    BG_STORE = openBGQDB.result;
    const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
    const getAllrequests = txStore.getAll();
    getAllrequests.onsuccess = () => {
      resolve();
    };
  };
}));
