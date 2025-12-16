export default function roundToDigits(value: number, digits: number) {
  const pow = Math.pow(10, digits);
  return Math.round(value * pow) / pow;
}
