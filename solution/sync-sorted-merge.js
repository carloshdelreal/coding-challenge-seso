"use strict";

// Print all entries, across all of the sources, in chronological order.

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

module.exports = (logSources, printer) => {

  // get one log from every log source
  logSources.forEach((logSource, idx) => {
    const log = logSource.pop()
    heapifyItem({ logSourceIdx: idx, log });
  });

  while (minHeap.length > 0) {
    const min = heapPop();
    const { logSourceIdx, log } = min;
    // console.log(minHeap.length)
    printer.print(log);
    const logSource = logSources[logSourceIdx];
    const newLog = logSource.pop()
    heapifyItem({ logSourceIdx, log: newLog });
  }
  printer.done();

  return console.log("Sync sort complete.");
};
