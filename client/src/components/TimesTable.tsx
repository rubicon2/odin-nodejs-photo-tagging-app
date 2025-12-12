import roundToDigits from '../ext/roundToDigits';
import styled from 'styled-components';

const LeftTd = styled.td`
  text-align: left;
`;

const RightTd = styled.td`
  text-align: right;
`;

interface Props {
  times: Array<Time>;
}

export default function TimesTable({ times }: Readonly<Props>) {
  return (
    <table>
      <tr>
        <th>Name</th>
        <th>Seconds</th>
      </tr>
      {times.map((time) => (
        <tr>
          <LeftTd>{time.name}</LeftTd>
          <RightTd>{roundToDigits(time.timeMs / 1000, 2)}</RightTd>
        </tr>
      ))}
    </table>
  );
}
