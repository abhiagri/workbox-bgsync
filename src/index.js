import React, { Component } from 'react';
import './styles.css';

let BG_STORE = null;

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

const Requests = () => new Promise((resolve) => {
  getBGRKeys().then((keys) => {
    const reqs = keys.map(key => getBGR(key));
    resolve(Promise.all(reqs));
  });
});

const formateDate = s => (new Date(s)).toLocaleString();

const getResult = (r) => {
  if (!r.result) return 'Pending';
  if (r.result.error) return 'Network Error';
  if (r.result.response && 'status' in r.result.response) {
    const { status, statusText } = r.result.response;
    return `${status}: ${statusText}`;
  }
  return 'Error';
};

const getResultClass = (r) => {
  if (!r.result) return 'pending';
  if (r.result.error) return 'error';
  if (r.result.response && 'status' in r.result.response) {
    const { status } = r.result.response;
    return status < 400 ? 'success' : 'error';
  }
  return 'error';
};

class BgSyncQueue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
    };
  }

  componentDidMount() {
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }

    const idb = window.indexedDB;

    const init = new Promise(((resolve, reject) => {
      const openBGQDB = idb.open('bgqueue');
      openBGQDB.onupgradeneeded = () => {
        const db = openBGQDB.result;
        db.createObjectStore('requests', { keyPath: 'key' });
        // var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
        console.log('brr');
      };

      openBGQDB.onerror = () => reject;
      openBGQDB.onsuccess = () => {
        BG_STORE = openBGQDB.result;
        const txStore = BG_STORE.transaction('requests', 'readwrite').objectStore('requests');
        const getAllrequests = txStore.getAll();
        getAllrequests.onsuccess = () => {
          // sycnDB().then(() => {
          resolve();
          // }).catch(() => reject);
        };
      };
    }));
    init.then(() => Requests().then(requests => this.setState({ requests })));
  }

  renderRequests() {
    const { requests } = this.state;

    console.log(requests);
    return (
      requests.sort((b, a) => a.key - b.key).map(r => (
        <li>
          <div className="infoSection">
            <div className="infoItems infoKey">
              <span>
                Workbox Key:
                <strong>
                  {r.key}
                </strong>
              </span>
            </div>
            <div className="infoItems infoTime">
              <span>
                Init Time:
                <strong>
                  {formateDate(r.storableRequest.timestamp)}
                </strong>
              </span>
            </div>
            <div className={`infoItems infoStatus  ${getResultClass(r)}`}>
              <span>
                Status:
                <strong className="statusText">
                  {getResult(r)}
                </strong>
              </span>
            </div>
            <div className="infoItems infoQueue">
              <span>
                Queue Name:
                <strong>
                  {r.queueName}
                </strong>
              </span>
            </div>
          </div>
          <div className="infoUrl">
            <span>
              Url: {r.storableRequest.url}
            </span>
          </div>
        </li>
      ))
    );
  }

  render() {
    return (
      <div>
        <h2 className="bqueue">Offline Requests</h2>
        <ol className="bqueue">
          {this.renderRequests()}
        </ol>
      </div>
    );
  }
}

export default BgSyncQueue;
