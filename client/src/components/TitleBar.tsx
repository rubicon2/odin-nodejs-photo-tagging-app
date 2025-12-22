import Container from '../styled/Container';
import PaddedContainer from '../styled/PaddedContainer';
import useDarkThemeActive from '../hooks/useDarkThemeActive';
import React from 'react';
import styled from 'styled-components';

// Could not get these to work as button background images,
// although apparently this is supposed to work. Vite does not
// import svg as a url like with png or jpg, and later replace
// with the dist version's url once everything has been packaged up.
// Instead, the svg data itself is imported. Sources (e.g. css tricks)
// say this should work with background-image: url(), but firefox and
// chrome give an error: invalid property value.
import settingsIconDark from '../img/icons/settings_48_dark.svg';
import settingsIconLight from '../img/icons/settings_48_light.svg';

const Content = styled(PaddedContainer)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-left: 0;
  padding-right: 0;

  h1 {
    margin: 0;
  }
`;

const SettingsButton = styled.button`
  display: grid;
  place-items: center;
  padding: 10px;
  background-color: transparent;
`;

interface Props {
  isAdminEnabled?: Boolean;
  onSettingsClick?: React.MouseEventHandler;
}

export default function TitleBar({ onSettingsClick = () => {} }: Props) {
  const isDarkThemeActive = useDarkThemeActive();
  return (
    <header>
      <Container>
        <Content>
          <h1>Where&apos;s Waldo?</h1>
          <SettingsButton onClick={onSettingsClick} title="Open settings">
            <img
              src={isDarkThemeActive ? settingsIconDark : settingsIconLight}
              alt=""
            />
          </SettingsButton>
        </Content>
      </Container>
    </header>
  );
}
