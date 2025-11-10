interface Props {
  xPos?: string;
  yPos?: string;
  children: React.ReactNode;
}

export default function Overlay({
  xPos = '0px',
  yPos = '0px',
  children,
  ...props
}: Props & React.HTMLProps<HTMLDivElement>) {
  return (
    <div style={{ position: 'absolute', left: xPos, top: yPos }} {...props}>
      {children}
    </div>
  );
}
