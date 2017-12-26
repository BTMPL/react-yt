import * as React from 'react';
import { render } from 'react-dom';
import Youtube from '../src/index';

import styled from 'styled-components';

const Toolbar = styled.div`
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  height: 40px;
  padding: 5px;
  background: rgba(0, 0, 0, 0.6);
  transition: 0.25s all;
`;

const YoutubeContainer = styled.div`
  position: relative;

  height: 320px;
  width: 640px;

  overflow: hidden;

  iframe {
    height: 100%;
    width: 100%;
  }

  :hover {
    ${Toolbar} {
      bottom: 0;
    }
  }
`;

const Button = styled.button`
  cursor: pointer;
  color: white;
  border: 0;
  padding: 0;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-family: Verdana;
  font-size: 12px;
  background: none;
  transition: 0.25s all;
  vertical-align: middle;

  &:hover {
    color: red;
  }
`;

interface VolumeButtonProps {
  muted?: boolean;
}

const VolumeButton = styled(Button)`
  transform: scaleX(-1);
  font-size: 20px;
  position: relative;

  ${(props: VolumeButtonProps) => {
    if (props.muted) {
      return `
        ::after {
          content: ' ';
          display: block;
          position: absolute;
          top: 20px;
          left: 8px;
          right: 8px;
          border-top: 2px solid white;
          transform: rotate(45deg);
          transition: 0.25s all;
        }

        :hover::after {
          border-color: red;
        }
      `;
    }    
    return '';
  }}  
`;

const Timer = styled.span`
  display: inline-block;
  height: 40px;
  line-height: 40px;
  padding: 0 5px;
  color: white;
  vertical-align: middle;
  position: relative;
  top: 2px;
  font-size: 13px;
`;

const App = () => {
  return (
    <Youtube 
      videoId={'SKGzIhOSQVY'}
      controls={0}
      modestbranding={0}
      showinfo={0}
      rel={0}
      render={({
        iframe,
        playVideo,
        pauseVideo,
        getPlayerState,
        getCurrentTime,
        getDuration,
        isMuted,
        mute,
        unMute
      }) => {            
        const isPlaying = getPlayerState() === 1;
        const formatTime = (time: number): string => {
          if (time === 0) {
            return '0:00';
          }
          const minutes = Math.floor(time / 60);
          const seconds = time - minutes * 60;
          return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        };

        return (
          <YoutubeContainer>
            {iframe}
            <Toolbar>
              {!isPlaying && <Button onClick={(event) => playVideo()}>▶</Button>}
              {isPlaying && <Button onClick={(event) => pauseVideo()}>▐▐</Button>}                                

              {isMuted() && <VolumeButton muted={true} onClick={(event) => unMute()}>🕪</VolumeButton>}
              {!isMuted() && <VolumeButton onClick={(event) => mute()}>🕪</VolumeButton>}

              <Timer>{`${formatTime(getCurrentTime())} / ${formatTime(getDuration())}`}</Timer>
            </Toolbar>
          </YoutubeContainer>
        );
      }}
    />    
  );
};

render(<App />, document.getElementById('root'));