/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable one-var */

import rtcPart from '../webRTC/rtcPart';

let judge = {
  attend: true, // attendance check
  attendPer: 100, // attendance ratio for x sec
  sleep: false, // sleep check
  sleepPer: 40, // sleep ratio for x sec
  focusPoint: 100, // focus point
};

let teacherData = {
  threshold: [20, 80], // 0: attendance threshold, 1: sleep threshold
  period: 5, // send data to DB for each 5sec
};

let studentData = {
  eyeSize: 0.28, // default
  blinkSize: 0.15, // default
};

// attend check var
let detect = {
  arr: [],
};

// sleep check var
let sleep = {
  arr: [],
  threshold: 40, // close eye threshold
};

// point check var
let point = {
  deadP: [0, 0.15], // up down 0~0.15
  deadY: [-0.18, 0.18], // left right -0.2~0.2
  deadR: [-0.23, 0.23], // spin l, spin r -0.25~0.25
  weightP: 30,
  weightY: 13,
  weightR: 13,
  centerArr0: [], // face x point
  centerArr1: [], // face y point
  center: [0, 0],
  centerTemp: [140, 85], // default
  deadXY: [50, 40],
  deadM: 0.55,
  weightM: 2.5,
};

// time var
let timeVar = {
  change: true,
  temp: 0,
};

// display landmark to student's video
let draw_point = judge.focusPoint;

function varInit() {
  // initialize var
  timeVar.change = true;
  detect.arr.length = 0;
  sleep.arr.length = 0;
  point.centerArr0.length = 0;
  point.centerArr1.length = 0;
  point.centerTemp = point.center;
  judge.focusPoint = 100;
}

function analysis(detection, landmarks, angle, timestamp) {
  // time part
  if (timeVar.change) {
    timeVar.change = false;
    timeVar.temp = timestamp;
  }
  // detect part
  judge.attendPer = getDetectPer(detection).toFixed(2);
  if (judge.attendPer < teacherData.threshold[0]) judge.attend = false;
  else {
    judge.attend = true;
    if (landmarks) {
      // sleep part
      judge.sleepPer = getSleepPer(landmarks).toFixed(2);
      if (judge.sleepPer > teacherData.threshold[1]) judge.sleep = true;
      else judge.sleep = false;
      // point part
      judge.focusPoint -= getPoint(landmarks, angle);
    }
  }

  // send to DB part
  const nowTime = new Date();
  if (nowTime.getTime() - timeVar.temp.getTime() > teacherData.period * 1000) {
    if (!judge.attend) judge.focusPoint = 0;
    else if (judge.sleep) judge.focusPoint = 10;
    else {
      judge.focusPoint -= (judge.sleepPer / 2.5).toFixed(2);
      if (judge.focusPoint < 20) judge.focusPoint = 20;
    }
    rtcPart.sendSignalToServer('sendConcentration', {
      content: judge,
    });
    console.log(judge);
    draw_point = judge.focusPoint;
    varInit();
  }
  return draw_point;
}

// cal detection ratio
function getDetectPer(detection) {
  if (detection) detect.arr.push(1);
  else detect.arr.push(0);
  return (detect.arr.reduce((a, b) => a + b) * 100) / detect.arr.length;
}

// cal closing eye ratio
function getSleepPer(landmarks) {
  const inHL = calcDist(landmarks[43], landmarks[47]);
  const outHL = calcDist(landmarks[44], landmarks[46]);
  const wL = calcDist(landmarks[42], landmarks[45]);
  const inHR = calcDist(landmarks[38], landmarks[40]);
  const outHR = calcDist(landmarks[37], landmarks[41]);
  const wR = calcDist(landmarks[36], landmarks[39]);
  const perL = (inHL + outHL) / (2 * wL);
  const perR = (inHR + outHR) / (2 * wR);
  const EAR = (perL + perR) / 2;

  studentData.blinkSize =
    EAR < studentData.blinkSize ? EAR : studentData.blinkSize;
  studentData.eyeSize = EAR > studentData.eyeSize ? EAR : studentData.eyeSize;
  if (studentData.eyeSize > 0.3) studentData.eyeSize = 0.3;

  const EAR_nom =
    (100 * (EAR - studentData.blinkSize)) /
    (studentData.eyeSize - studentData.blinkSize);
  if (EAR_nom < sleep.threshold) sleep.arr.push(1);
  else sleep.arr.push(0);
  return (sleep.arr.reduce((a, b) => a + b) * 100) / sleep.arr.length;
}

// cal focus point
function getPoint(landmarks, angle) {
  const pitch = Number(angle[0][0]); // up down
  const yaw = Number(angle[0][1]); // l r
  const roll = Number(angle[0][2]); // spin l r
  let minusP, minusY, minusR, minusC, minusM;

  // cal pitch yaw roll weight
  if (pitch < point.deadP[0])
    minusP = point.weightP * (Math.abs(pitch) - point.deadP[0]);
  else if (pitch > point.deadP[1])
    minusP = point.weightP * (pitch - point.deadP[1]);
  else minusP = 0;
  if (yaw > point.deadY[0] && yaw < point.deadY[1]) minusY = 0;
  else minusY = point.weightY * (Math.abs(yaw) - point.deadY[1]);
  if (roll > point.deadR[0] && roll < point.deadR[1]) minusR = 0;
  else minusR = point.weightR * (Math.abs(roll) - point.deadR[1]);

  // cal face location weight
  const nowCenter = [landmarks[33]._x, landmarks[33]._y];
  point.centerArr0.push(nowCenter[0]);
  point.centerArr1.push(nowCenter[1]);
  point.center = [
    point.centerArr0.reduce((a, b) => a + b) / point.centerArr0.length,
    point.centerArr1.reduce((a, b) => a + b) / point.centerArr1.length,
  ];
  const xEdge = [
    point.centerTemp[0] - point.deadXY[0],
    point.centerTemp[0] + point.deadXY[0],
  ];
  const yEdge = [
    point.centerTemp[1] - point.deadXY[1],
    point.centerTemp[1] + point.deadXY[1],
  ];
  if (
    nowCenter[0] < xEdge[0] ||
    nowCenter[0] > xEdge[1] ||
    nowCenter[1] < yEdge[0] ||
    nowCenter[1] > yEdge[1]
  )
    minusC = 0.9;
  else minusC = 0;

  // cal mouse ratio weight
  const mW = calcDist(landmarks[48], landmarks[54]);
  const mH =
    (calcDist(landmarks[50], landmarks[58]) +
      calcDist(landmarks[51], landmarks[57]) +
      calcDist(landmarks[52], landmarks[56])) /
    3;
  const MAR = mH / mW;

  if (MAR < point.deadM) minusM = 0;
  else minusM = point.weightM * (MAR - point.deadM);

  return minusP + minusY + minusR + minusC + minusM;
}

export default {
  analysis,
  varInit,
};

function calcDist(p1, p2) {
  return Math.sqrt(Math.pow(p1._x - p2._x, 2) + Math.pow(p1._y - p2._y, 2));
}
