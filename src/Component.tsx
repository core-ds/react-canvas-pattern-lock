import React, { forwardRef, useEffect, useRef } from 'react';
import mergeRefs from 'react-merge-refs';

import useEvent from 'react-use-event-hook';
import { PatternLock } from './pattern-lock';
import { DEFAULT_LIGHT_THEME, DEFAULT_THEME_STATE } from './consts';
import type {
  TProps, TNodes, TPatternLockInstance,
} from './typings';
import { nodesToCode } from './utils/libs';

export const ReactCanvasPatternLock = forwardRef<TPatternLockInstance, TProps>(
  (
    {
      width = 315,
      height = 315,
      onComplete,
      themeState,
      onDragStart,
      theme = DEFAULT_LIGHT_THEME,
      justifyNodes = 'space-around',
      rows = 3,
      cols = 3,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const patternLockInnerRef = useRef<TPatternLockInstance>();

    const handleComplete = useEvent((nodes: TNodes) => {
      if (nodes?.length) {
        onComplete?.(nodesToCode(nodes, [rows, cols]), nodes);
      }
    });

    const handleDragStart = useEvent(() => {
      onDragStart?.();

      if (!themeState && patternLockInnerRef.current) {
        patternLockInnerRef.current.setThemeState(DEFAULT_THEME_STATE.INITIAL);
      }
    });

    useEffect(() => {
      const patternLockVar = patternLockInnerRef;
      if (canvasRef.current) {
        mergeRefs([ref, patternLockVar])(
          new PatternLock({
            $canvas: canvasRef.current,
            width,
            height,
            grid: [rows, cols],
            theme,
            themeState: themeState ?? DEFAULT_THEME_STATE.INITIAL,
            justifyNodes,
          }),
        );

        if (patternLockVar.current) {
          patternLockVar.current.onComplete(handleComplete);
          patternLockVar.current.onStart(handleDragStart);
        }
      }

      return () => {
        patternLockVar.current?.destroy();
        patternLockInnerRef.current = undefined;
      };
    }, [
      width,
      height,
      justifyNodes,
      rows,
      cols,
      ref,
      theme,
      handleComplete,
      handleDragStart,
    ]);

    useEffect(() => {
      if (themeState && patternLockInnerRef.current) {
        patternLockInnerRef.current.setThemeState(themeState);
      }
    }, [themeState]);

    return <canvas ref={canvasRef} />;
  },
);
