import Container from '../styled/Container';
import styled from 'styled-components';

const ContentContainer = styled(Container)`
  padding: 0;
`;

const Item = styled.div`
  padding: 1rem;
  cursor: pointer;
`;

const SelectedItem = styled(Item)`
  font-weight: bold;
  background-color: #ff7777;
  color: #213547;
`;

interface Props {
  photo: Photo;
  isSelected: boolean;
}

export default function PhotoListItem({ photo, isSelected }: Props) {
  const content = <ContentContainer>{photo.altText}</ContentContainer>;
  return (
    // Wrap in link for keyboard navigation.
    <a href="#">
      {isSelected ? (
        <SelectedItem>{content}</SelectedItem>
      ) : (
        <Item>{content}</Item>
      )}
    </a>
  );
}
