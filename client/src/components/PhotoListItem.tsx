interface Props {
  photo: Photo;
  isSelected: boolean;
}

export default function PhotoListItem({ photo, isSelected }: Props) {
  return <>{photo.altText}</>;
}
