import logger from "../utils/logger";

export const distance = (point1, point2) => {
  const x = point2.x - point1.x;
  const y = point2.y - point1.y;
  return Math.sqrt(x * x + y * y);
};

// Check if the three points make up two lines at a 90 degrees angle with centerPoint as the
// common connecting point
const offsetDegrees = 2;
const offsetRadians = ( 2 * Math.PI * offsetDegrees) / 360;
const targetAngle = Math.PI / 2;
const lowerBound = targetAngle - offsetRadians;
const upperBound = targetAngle + offsetRadians;

export const isApproximatelyPerpendicular = (centerPoint, point2, point3) => {

  // https://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  const distCenter_2 = distance(centerPoint, point2);
  const distCenter_3 = distance(centerPoint, point3);
  const dist2_3 = distance(point2, point3);

  const sqrDist2 = distCenter_2 * distCenter_2;
  const sqrDist3 = distCenter_3 * distCenter_3;
  const sqrDist2_3 = dist2_3 * dist2_3;

  const angle = Math.acos((sqrDist2 + sqrDist3 - sqrDist2_3) / ( 2  * distCenter_2 * distCenter_3));
  logger.info('Corner angle is ' + (360 *  angle / (2*Math.PI)));

  return angle >= lowerBound && angle <= upperBound;
};