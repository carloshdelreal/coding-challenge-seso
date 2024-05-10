"use strict";

const minHeap = []

const heapifyItem = ({ logSourceIdx, log}) => {
  if (log) {
    minHeap.push({ logSourceIdx, log });
  }
  let i = minHeap.length - 1;
  let parent = Math.floor((i - 1) / 2);

  // console.log({i, minHeap})

  while (i > 0 && minHeap[parent].log.date > minHeap[i].log.date) {
    [minHeap[parent], minHeap[i]] = [minHeap[i], minHeap[parent]];
    i = parent;
    parent = Math.floor((i - 1) / 2);
  }

}

const heapPop = () => {
  const min = minHeap[0];
  if (minHeap.length === 1) {
    return minHeap.pop();
  }
  minHeap[0] = minHeap.pop();
  let i = 0;
  let left = 2 * i + 1;
  let right = 2 * i + 2;
  let smallest = i;

  while (left < minHeap.length) {
    if (minHeap[left].log.date < minHeap[smallest].log.date) {
      smallest = left;
    }

    if (right < minHeap.length && minHeap[right].log.date < minHeap[smallest].log.date) {
      smallest = right;
    }

    if (smallest === i) {
      break;
    }

    [minHeap[i], minHeap[smallest]] = [minHeap[smallest], minHeap[i]];
    i = smallest;
    left = 2 * i + 1;
    right = 2 * i + 2;
  }

  return min;

}

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {

    const syncedSources = []
    // get one log from every log source
    
    let latestLogs = await Promise.all(logSources.map((logSource) => logSource.popAsync()));

    while (latestLogs.some(l => !!l)) {
      latestLogs.forEach((log, idx) => {
        if (syncedSources[idx]) {
          syncedSources[idx].push(log);
        } else {
          syncedSources[idx] = [log]
        }
      })
      const logs = await Promise.all(logSources.map((logSource) => logSource.popAsync()))
      latestLogs = logs
    }

    syncedSources.forEach((logSource, idx) => {
      const log = logSource.shift()
      heapifyItem({ logSourceIdx: idx, log });
    });

    while (minHeap.length > 0) {
      const min = heapPop();
      const { logSourceIdx, log } = min;
      // console.log(minHeap.length)
      printer.print(log);
      const logSource = syncedSources[logSourceIdx];
      const newLog = await logSource.shift()

       heapifyItem({ logSourceIdx, log: newLog });
      
    }

    printer.done()
    resolve(console.log("Async sort complete."));
  });
};
