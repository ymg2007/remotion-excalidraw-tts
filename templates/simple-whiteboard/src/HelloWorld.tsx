import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import styled from 'styled-components';

interface HelloWorldProps {
  title: string;
  text: string;
}

export const HelloWorld: React.FC<HelloWorldProps> = ({ title, text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const scale = spring({
    frame,
    fps: 30,
    config: { damping: 10, mass: 1, stiffness: 100 },
  });

  return (
    <Container style={{ opacity }}>
      <Title style={{ transform: `scale(${scale})` }}>{title}</Title>
      <Text style={{ transform: `scale(${scale})` }}>{text}</Text>
    </Container>
  );
};

const Container = styled(AbsoluteFill)`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 20px solid #f0f0f0;
  box-shadow: inset 0 0 100px rgba(0,0,0,0.05);
`;

const Title = styled.h1`
  font-size: 120px;
  color: #1a1a1a;
  margin-bottom: 60px;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
`;

const Text = styled.p`
  font-size: 64px;
  color: #333333;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif;
`;
