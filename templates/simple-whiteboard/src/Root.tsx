import React from 'react';
import { Composition } from 'remotion';
import { HelloWorld } from './HelloWorld';
import { WhiteboardScene } from './WhiteboardScene';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Welcome!',
          text: 'Hello World',
        }}
      />
      <Composition
        id="WhiteboardScene"
        component={WhiteboardScene}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'My Scene',
          elements: [
            {
              type: 'text',
              content: 'Start here',
              x: 200,
              y: 200,
              fontSize: 48,
              color: '#000000',
            },
          ],
        }}
      />
    </>
  );
};
