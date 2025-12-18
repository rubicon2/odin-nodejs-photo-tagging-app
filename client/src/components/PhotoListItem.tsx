import PaddedContainer from '../styled/PaddedContainer';
import FakeLink from '../styled/FakeLink';
import * as breakpoints from '../breakpoints';
import styled from 'styled-components';

const Item = styled.div`
  cursor: pointer;
`;

const SelectedItem = styled(Item)`
  font-weight: bold;
  background-color: #ff7777;
  color: #213547;
  border-bottom: 5px solid #dd5555;

  @media (min-width: ${breakpoints.desktop}) {
    border-right: 5px solid #dd5555;
    border-bottom: none;
  }
`;

interface Props {
  photo: Photo;
  isSelected: boolean;
}

export default function PhotoListItem({ photo, isSelected }: Readonly<Props>) {
  const content = <PaddedContainer>{photo.altText}</PaddedContainer>;
  return (
    <FakeLink>
      {isSelected ? (
        <SelectedItem>{content}</SelectedItem>
      ) : (
        <Item>{content}</Item>
      )}
    </FakeLink>
  );
}
