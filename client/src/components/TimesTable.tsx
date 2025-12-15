import roundToDigits from '../ext/roundToDigits';
import styled from 'styled-components';

const Table = styled.table`
  border-collapse: collapse;

  & td {
    padding: 0.25em 0.5em;
  }
`;

const TimeRow = styled.tr`
  border-bottom: 1px solid #00000022;

  &:first-child,
  &:last-child {
    border-bottom: none;
  }
`;

const NewTimeRow = styled(TimeRow)`
  border: 2px solid black;
  background-color: #ff3333;
  color: #f9f9f9;
`;

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
    <Table>
      <tr>
        <th>Name</th>
        <th>Seconds</th>
      </tr>
      {times.map((time, index) => (
        <>
          {/* If no id, this is the user's new time that hasn't been saved to server yet. */}
          {time.id === undefined ? (
            <NewTimeRow key={index}>
              <LeftTd>{time.name}</LeftTd>
              <RightTd>
                {roundToDigits(time.timeMs / 1000, 2).toFixed(2)}
              </RightTd>
            </NewTimeRow>
          ) : (
            <TimeRow key={index}>
              <LeftTd>{time.name}</LeftTd>
              <RightTd>
                {roundToDigits(time.timeMs / 1000, 2).toFixed(2)}
              </RightTd>
            </TimeRow>
          )}
        </>
      ))}
    </Table>
  );
}
