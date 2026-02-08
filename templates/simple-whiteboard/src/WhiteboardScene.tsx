import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import styled from 'styled-components';

interface Element {
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'line';
  content?: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  radius?: number;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

interface WhiteboardSceneProps {
  title: string;
  elements: Element[];
}

export const WhiteboardScene: React.FC<WhiteboardSceneProps> = ({ title, elements }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <Container style={{ opacity }}>
      <WhiteboardPattern />
      <Title>{title}</Title>
      <ElementsContainer>
        {elements.map((el, i) => renderElement(el, i, frame))}
      </ElementsContainer>
    </Container>
  );
};

function renderElement(element: Element, index: number, frame: number) {
  const delay = index * 10;
  const elementOpacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const elementScale = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15, mass: 1, stiffness: 200 },
  });

  const baseStyle = {
    position: 'absolute' as const,
    opacity: elementOpacity,
    transform: `scale(${Math.max(0.1, elementScale)})`,
  };

  switch (element.type) {
    case 'text':
      return (
        <TextElement
          key={index}
          style={{
            ...baseStyle,
            left: element.x || 0,
            top: element.y || 0,
            fontSize: element.fontSize || 32,
            color: element.color || '#000000',
          }}
        >
          {element.content || ''}
        </TextElement>
      );

    case 'rectangle':
      return (
        <Rectangle
          key={index}
          style={{
            ...baseStyle,
            left: element.x || 0,
            top: element.y || 0,
            width: element.width || 100,
            height: element.height || 60,
            borderColor: element.strokeColor || '#000000',
            borderWidth: element.strokeWidth || 3,
          }}
        />
      );

    case 'circle':
      return (
        <Circle
          key={index}
          style={{
            ...baseStyle,
            left: element.x || 0,
            top: element.y || 0,
            width: (element.radius || 30) * 2,
            height: (element.radius || 30) * 2,
            borderColor: element.strokeColor || '#000000',
            borderWidth: element.strokeWidth || 3,
          }}
        />
      );

    case 'arrow':
    case 'line':
      return (
        <LineElement
          key={index}
          x1={element.x1 || element.x || 0}
          y1={element.y1 || element.y || 0}
          x2={element.x2 || (element.x || 0) + 100}
          y2={element.y2 || (element.y || 0) + 50}
          color={element.strokeColor || '#000000'}
          width={element.strokeWidth || 3}
          style={baseStyle}
          isArrow={element.type === 'arrow'}
        />
      );

    default:
      return null;
  }
}

const Container = styled(AbsoluteFill)`
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WhiteboardPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
`;

const Title = styled.h2`
  font-size: 64px;
  color: #1a1a1a;
  text-align: center;
  padding: 40px 20px;
  font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
  font-weight: bold;
  z-index: 10;
`;

const ElementsContainer = styled.div`
  flex: 1;
  position: relative;
`;

const TextElement = styled.div<{ left: number; top: number; fontSize: number; color: string }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  font-size: ${props => props.fontSize}px;
  color: ${props => props.color};
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif;
  font-weight: 500;
  white-space: nowrap;
`;

const Rectangle = styled.div<{ left: number; top: number; width: number; height: number; borderColor: string; borderWidth: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: ${props => props.borderWidth}px solid ${props.borderColor};
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const Circle = styled.div<{ left: number; top: number; width: number; height: number; borderColor: string; borderWidth: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: ${props => props.borderWidth}px solid ${props.borderColor};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
`;

const LineElement: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  style: React.CSSProperties;
  isArrow?: boolean;
}> = ({ x1, y1, x2, y2, color, width, style, isArrow }) => {
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return (
    <svg
      style={{
        position: 'absolute',
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        overflow: 'visible',
        ...style,
      }}
    >
      <line
        x1={x1 - Math.min(x1, x2)}
        y1={y1 - Math.min(y1, y2)}
        x2={x2 - Math.min(x1, x2)}
        y2={y2 - Math.min(y1, y2)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {isArrow && (
        <polygon
          points={`${x2},${y2} ${x2 - 15 * Math.cos((angle - 20) * Math.PI / 180)},${y2 - 15 * Math.sin((angle - 20) * Math.PI / 180)} ${x2 - 15 * Math.cos((angle + 20) * Math.PI / 180)},${y2 - 15 * Math.sin((angle + 20) * Math.PI / 180)}`}
          fill={color}
        />
      )}
    </svg>
  );
};
