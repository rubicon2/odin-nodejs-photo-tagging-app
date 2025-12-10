// Basically, a link that enjoys all the benefits of links (keyboard navigation, etc.),
// but doesn't move the viewport around when you click it or affect the url.
export default function FakeLink({
  children,
  ...props
}: React.HTMLProps<HTMLAnchorElement>) {
  return (
    <a href="#" onClick={(event) => event.preventDefault()} {...props}>
      {children}
    </a>
  );
}
