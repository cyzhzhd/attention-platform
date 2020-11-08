/* eslint no-param-reassign: "error" */
let currentTime = new Date();
let nextSortedTime = new Date();
let nextRearrangedTime = new Date();
const totalCCTContainer = {};

function CCTSetter(data) {
  data.CCTData = {
    avr: { num: 0, ttl: 0 },
    CCT: { absence: [], focusPoint: [], sleep: [], turnHead: [], time: [] },
  };
}
CCTSetter(totalCCTContainer);

function setVal(target, content) {
  currentTime = new Date();
  const { absence, focusPoint, sleep, turnHead } = content;
  target.CCT.absence.push(Number(absence * 100));
  target.CCT.focusPoint.push(Number(focusPoint));
  target.CCT.sleep.push(Number(sleep * 100));
  target.CCT.turnHead.push(Number(turnHead * 100));
  target.CCT.time.push(currentTime.toString().split(' ')[4]);
  target.avr.num += 1;
  target.avr.ttl += Number(focusPoint);
}

function allocateCCTData(foundUser, content) {
  setVal(foundUser.CCTData, content);
  setVal(totalCCTContainer.CCTData, content);
}

function setNextExecuteTime(interval) {
  const time = new Date();
  time.setSeconds(time.getSeconds() + interval);
  return time;
}

function timeCompare(a, b) {
  return a.valueOf() && b.valueOf() ? (a > b) - (a < b) : NaN;
}

function sortByCCT(userlist) {
  userlist.sort((a, b) => {
    if (a.isTeacher || b.isTeacher) return false;
    if (!a.CCTData || !b.CCTData) return false;
    return (
      a.CCTData.CCT.focusPoint[a.CCTData.avr.num - 1] -
      b.CCTData.CCT.focusPoint[b.CCTData.avr.num - 1]
    );
  });
}

function sortUserListByCCT(userlist, interval, isImmediate = false) {
  if (timeCompare(currentTime, nextSortedTime) >= 0 || isImmediate) {
    sortByCCT(userlist);
    nextSortedTime = setNextExecuteTime(interval);
  }
}

function addCCTDataOnTotalCCT(CCTData, interval, isImmediate = false) {
  if (timeCompare(currentTime, nextRearrangedTime) >= 0 || isImmediate) {
    const { num, ttl } = totalCCTContainer.CCTData.avr;
    const cct = totalCCTContainer.CCTData.CCT;
    const absenceTTL = cct.absence.reduce((val, acc) => acc + val, 0);
    const focusPointTTL = cct.focusPoint.reduce((val, acc) => acc + val, 0);
    const sleepTTL = cct.sleep.reduce((val, acc) => acc + val, 0);
    const turnHeadTTL = cct.turnHead.reduce((val, acc) => acc + val, 0);
    CCTData.avr.num += 1;
    CCTData.avr.ttl += ttl / num;
    CCTData.CCT.absence.push(absenceTTL / num);
    CCTData.CCT.focusPoint.push(focusPointTTL / num);
    CCTData.CCT.sleep.push(sleepTTL / num);
    CCTData.CCT.turnHead.push(turnHeadTTL / num);
    CCTData.CCT.time.push(currentTime.toString().split(' ')[4]);

    nextRearrangedTime = setNextExecuteTime(interval);
    CCTSetter(totalCCTContainer);
  }
}

export default {
  CCTSetter,
  allocateCCTData,
  sortUserListByCCT,
  addCCTDataOnTotalCCT,
  setNextExecuteTime,
  timeCompare,
};
