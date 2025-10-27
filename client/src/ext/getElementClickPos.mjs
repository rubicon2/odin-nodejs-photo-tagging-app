export default function getElementClickPos(reactClickEvent) {
  if (!reactClickEvent.nativeEvent) {
    throw new Error(
      'No nativeEvent! Sure you called this with a react click event?',
    );
  }

  // Calculate as percentage of width and height to account for different screen sizes.
  // Use client width as it does not take into account borders or scroll bars.
  return {
    x: reactClickEvent.nativeEvent.offsetX / reactClickEvent.target.clientWidth,
    y:
      reactClickEvent.nativeEvent.offsetY / reactClickEvent.target.clientHeight,
  };
}
