interface Props {
  xPos?: string;
  yPos?: string;
  children: React.ReactNode;
}

export default function Overlay({
  xPos = '0px',
  yPos = '0px',
  children,
}: Props) {
  return (
    <div style={{ position: 'absolute', left: xPos, top: yPos }}>
      {children}
    </div>
  );
}
